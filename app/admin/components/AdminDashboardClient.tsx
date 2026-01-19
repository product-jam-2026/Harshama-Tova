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
import ActivityCard from './TodaysActivities/ActivityCard';
import AdminAnnouncement from './AdminAnnouncement/AdminAnnouncement';
import { formatTimeForInput, isGroupActiveToday, getTodayDateString } from '@/lib/utils/date-utils';
import styles from './AdminDashboard.module.css';
import Image from 'next/image';
import Link from 'next/link';
import BackButton from '@/components/buttons/BackButton';


interface AdminDashboardClientProps {
  initialGroups: any[];
  initialWorkshops: any[];
  initialGroupRegs: any[];
  initialWorkshopRegs: any[];
  initialAnnouncements: any[];
  initialTab?: string;
}

export default function AdminDashboardClient({ 
  initialGroups, 
  initialWorkshops, 
  initialGroupRegs, 
  initialWorkshopRegs,
  initialAnnouncements,
  initialTab = 'dashboard',
}: AdminDashboardClientProps) {
  
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(initialTab);

  // סנכרון עם ה-URL כשמנווטים (למשל טאבים, חזרה בדפדפן)
  useEffect(() => {
    const t = searchParams.get('tab') || 'dashboard';
    setActiveTab(t);
  }, [searchParams]);

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
      <div>

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
      <div className={styles.dashboardPage}>
        
        <div className={styles.iconsContainer}>
          <Link href="/logout" className={styles.logoutButton}>
              <span>התנתקות</span>
          </Link>

          {/* Icon for managing admins */}
          <Link href="/admin/manage-admins" title="ניהול הרשאות" className={styles.profileIconLink}>
              <div> 
                  <Image 
                    src="/icons/AdminProfile.svg"
                    alt="ניהול פרופיל"
                    width={24}
                    height={24}
                  />
              </div>
          </Link>
      </div>

        {/* Header */}
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>אדמה טובה</h1>
          <h2 className={`h2-light ${styles.dateText}`}>
            {new Intl.DateTimeFormat('he-IL', { weekday: 'long' }).format(new Date())}, {new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date())}
          </h2>
        </div>

        {/* Admin Navigation Bar */}
        <div className={styles.adminNavBarWrapper}>
            <AdminNavBar activeTab={activeTab} onTabSelect={setActiveTab} />
        </div>

        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            
            {/* Daily Announcement Widget */}
            <div className={styles.announcementWrapper}>
              <AdminAnnouncement 
                announcements={dailyAnnouncements} 
                onRefresh={refreshData}
              />
            </div>

            <div className={styles.gridContainer}>
              
              {/* Activities Panel */}
                <div className={styles.activitiesHeader}>
                  <h3 className={styles.activitiesTitle}>
                    הפעילות היום במרחב
                  </h3>
                  <p className={styles.activitiesBadge}>
                    {dashboardActivities.length} פעילויות
                  </p>
                </div>
                
                <div className={styles.activitiesList}>
                  {dashboardActivities.length === 0 ? (
                    <div className={styles.emptyStateContainer}>
                      <p className={styles.emptyStateText}>אין פעילויות מתוכננות להיום.</p>
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

              {/* Requests Summary Panel */}
              <div 
                onClick={() => setActiveTab('requests')} 
                className={styles.clickableCardWrapper}
              >
                  <div className={styles.requestCard}>
                    <div className={`p4 ${styles.requestInfo}`}>
                        <span>סהכ</span>
                        <span className={`p4 ${styles.requestCount}`}>
                          {pendingCount}
                        </span>
                        <span>בקשות ממתינות לאישור</span>
                    </div>
                    <BackButton href="/admin/?tab=requests" direction="left" />
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