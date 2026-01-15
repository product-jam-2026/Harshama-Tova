'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AdminNavBar from './AdminNavBar';
import GroupsManager from '@/app/admin/groups/components/GroupsManager';
import GroupForm from '@/app/admin/groups/components/GroupForm';
import WorkshopsManager from '@/app/admin/workshops/components/WorkshopsManager';
import WorkshopForm from '@/app/admin/workshops/components/WorkshopForm';
import RequestsView from '@/app/admin/requests/components/RequestsView';
import ActivityCard from './ActivityCard';
import AdminAnnouncement from './AdminAnnouncement/AdminAnnouncement';
import { formatTimeForInput, isGroupActiveToday, getTodayDateString } from '@/lib/utils/date-utils';

interface AdminDashboardClientProps {
  initialGroups: any[];
  initialWorkshops: any[];
  initialGroupRegs: any[];
  initialWorkshopRegs: any[];
  initialAnnouncements: any[];
}

export default function AdminDashboardClient({ 
  initialGroups, 
  initialWorkshops, 
  initialGroupRegs, 
  initialWorkshopRegs,
  initialAnnouncements
}: AdminDashboardClientProps) {
  
  const searchParams = useSearchParams();
  // Initialize tab from URL, but manage it with State for instant switching
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');

  const [groups, setGroups] = useState(initialGroups);
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [groupRegs, setGroupRegs] = useState(initialGroupRegs);
  const [workshopRegs, setWorkshopRegs] = useState(initialWorkshopRegs);

  // --- Initialize with server data ---
  const [dailyAnnouncements, setDailyAnnouncements] = useState<any[]>(initialAnnouncements);

  // State for Edit Mode
  const [editingItem, setEditingItem] = useState<{ id: string, type: 'group' | 'workshop' } | null>(null);
  
  const supabase = createClient();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensures that when Server Actions complete (like approving a request),
  // the local state updates immediately without needing a manual refresh.
  useEffect(() => { setGroups(initialGroups); }, [initialGroups]);
  useEffect(() => { setWorkshops(initialWorkshops); }, [initialWorkshops]);
  useEffect(() => { setGroupRegs(initialGroupRegs); }, [initialGroupRegs]);
  useEffect(() => { setWorkshopRegs(initialWorkshopRegs); }, [initialWorkshopRegs]);
  useEffect(() => { setDailyAnnouncements(initialAnnouncements); }, [initialAnnouncements]);

  // --- DATA PROCESSING HELPERS ---

  // Process Groups with Counts - Recalculate only if groups or regs change
  const processedGroups = useMemo(() => {
    return groups.map(group => {
      const approvedCount = groupRegs.filter(r => r.group_id === group.id && r.status === 'approved').length;
      const pendingCount = groupRegs.filter(r => r.group_id === group.id && r.status === 'pending').length;
      return { ...group, participants_count: approvedCount, pending_count: pendingCount };
    });
  }, [groups, groupRegs]);

  // Process Workshops with Counts - Recalculate only if workshops or regs change
  const processedWorkshops = useMemo(() => {
    return workshops.map(workshop => {
      const count = workshopRegs.filter(r => r.workshop_id === workshop.id).length;
      return { ...workshop, participants_count: count };
    });
  }, [workshops, workshopRegs]);

  // Process Pending Requests - Recalculate only if groupRegs change
  const pendingRegistrations = useMemo(() => {
    return groupRegs.filter(r => r.status === 'pending');
  }, [groupRegs]);

  const pendingCount = pendingRegistrations.length;

  // Process Dashboard Activities (Today) - Memoized for performance
  const dashboardActivities = useMemo(() => {
    const now = new Date();
    const todayIsoString = getTodayDateString();
    const todayDayOfWeek = now.getDay();

    const activeGroups = groups.filter(g => 
      g.meeting_day === todayDayOfWeek && 
      g.status === 'open' &&
      isGroupActiveToday(g.date, g.meetings_count)
    );

    const todayWorkshops = workshops.filter(w => w.date === todayIsoString);

    const combined = [
      ...activeGroups.map(g => ({
        id: g.id,
        name: g.name,
        audience: g.community_status || [],
        time: formatTimeForInput(g.meeting_time) || '00:00',
        mentor: g.mentor,
        type: 'Group' as const
      })),
      ...todayWorkshops.map(w => ({
        id: w.id,
        name: w.name,
        audience: w.community_status || [],
        time: formatTimeForInput(w.meeting_time) || '??:??',
        mentor: w.mentor,
        type: 'Workshop' as const
      }))
    ];

    return combined.sort((a, b) => a.time.localeCompare(b.time));
  }, [groups, workshops]);


  // --- REALTIME LOGIC ---
  
  const refreshData = useCallback(async () => {
    console.log("Refreshing Admin Data...");
    
    // --- Use UTC Midnight to match server logic and prevent timezone issues ---
    const now = new Date();
    // Create a date object representing 00:00:00 UTC of the current day.
    const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    // Fetch everything in parallel (Client Side)
    const [gRes, wRes, grRes, wrRes, announcementRes] = await Promise.all([
      supabase.from("groups").select('*').order('created_at', { ascending: false }),
      supabase.from("workshops").select('*').order('created_at', { ascending: false }),
      supabase.from('group_registrations').select('*'),
      supabase.from('workshop_registrations').select('*'),
      
      // Fetch ALL announcements for today (List)
      supabase.from('daily_announcements')
        .select('*')
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false }) 
    ]);

    if (gRes.data) setGroups(gRes.data);
    if (wRes.data) setWorkshops(wRes.data);
    if (grRes.data) setGroupRegs(grRes.data);
    if (wrRes.data) setWorkshopRegs(wrRes.data);
    
    setDailyAnnouncements(announcementRes.data || []);

  }, [supabase]);

  // Initial fetch (Ensures client data is fresh even after SSR)
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const handleUpdate = () => {
      // Debounce updates
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => {
        refreshData();
      }, 1000);
    };

    const channel = supabase.channel('admin-spa-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workshops' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_registrations' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workshop_registrations' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_announcements' }, handleUpdate)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [supabase, refreshData]);


  // --- RENDER ---

  // 1. Handle Edit Mode View
  if (editingItem) {
    const isGroup = editingItem.type === 'group';
    const itemData = isGroup 
      ? groups.find(g => g.id === editingItem.id) 
      : workshops.find(w => w.id === editingItem.id);

    if (!itemData) return <div>פריט לא נמצא</div>;

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          עריכת {isGroup ? 'קבוצה' : 'סדנה'}: {itemData.name}
        </h1>

        {isGroup ? (
          <GroupForm 
            initialData={itemData} 
            onSuccess={() => { refreshData(); setEditingItem(null); }}
            onCancel={() => setEditingItem(null)}
          />
        ) : (
          <WorkshopForm 
            initialData={itemData} 
            onSuccess={() => { refreshData(); setEditingItem(null); }}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </div>
    );
  }

  // 2. Handle Dashboard View
  return (
    <div>
      {/* Pass state control to Navbar for instant switching */}
      <AdminNavBar activeTab={activeTab} onTabSelect={setActiveTab} />

      <div style={{ paddingBottom: '40px' }}>
        
        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
             {/* Header */}
            <div style={{ marginBottom: '25px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>אדמה טובה</h1>
              <p style={{ color: '#666', marginTop: '5px' }}>
                {new Intl.DateTimeFormat('he-IL', { weekday: 'long' }).format(new Date())}, {new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date())}
              </p>
            </div>

            {/* Daily Announcement Widget */}
            <div style={{ marginBottom: '25px' }}>
              <AdminAnnouncement 
                announcements={dailyAnnouncements} 
                onRefresh={refreshData}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              
              {/* Activities Panel */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📅 הפעילות היום במרחב
                  </h2>
                  <span style={{ fontSize: '12px', background: '#f3f4f6', padding: '4px 10px', borderRadius: '20px', color: '#555' }}>
                    {dashboardActivities.length} פעילויות
                  </span>
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto', paddingLeft: '5px' }}>
                  {dashboardActivities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed #ddd', borderRadius: '12px', background: '#fafafa' }}>
                      <p style={{ color: '#888', fontSize: '16px' }}>אין פעילויות מתוכננות להיום.</p>
                    </div>
                  ) : (
                    dashboardActivities.map((activity, idx) => (
                      <ActivityCard 
                        key={`${activity.type}-${activity.id}-${idx}`}
                        id={activity.id}
                        title={activity.name}
                        time={activity.time}
                        mentor={activity.mentor}
                        audience={activity.audience}
                        type={activity.type}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Requests Summary Panel */}
              <div 
                onClick={() => setActiveTab('requests')} 
                style={{ cursor: 'pointer', textDecoration: 'none' }}
              >
                  <div style={{ 
                    background: 'white', 
                    padding: '15px', 
                    borderRadius: '16px', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)', 
                    border: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', fontSize: '18px', color: '#4b5563' }}>
                        <span>סהכ</span>
                        <span style={{ 
                            fontSize: '24px', 
                            fontWeight: 'bold', 
                            color: pendingCount > 0 ? '#ef4444' : '#10b981',
                            lineHeight: '1'
                        }}>
                          {pendingCount}
                        </span>
                        <span>בקשות ממתינות לאישור</span>
                    </div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '20px' }}>
                        ←
                    </div>
                  </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: REQUESTS */}
        {activeTab === 'requests' && (
          <RequestsView 
            groups={groups} 
            pendingRegistrations={pendingRegistrations} 
          />
        )}

        {/* TAB: GROUPS */}
        {activeTab === 'groups' && (
          <GroupsManager 
            groups={processedGroups} 
            onEdit={(group) => setEditingItem({ id: group.id, type: 'group' })}
          />
        )}

        {/* TAB: WORKSHOPS */}
        {activeTab === 'workshops' && (
          <WorkshopsManager 
            workshops={processedWorkshops} 
            onEdit={(workshop: any) => setEditingItem({ id: workshop.id, type: 'workshop' })}
          />
        )}

      </div>
    </div>
  );
}