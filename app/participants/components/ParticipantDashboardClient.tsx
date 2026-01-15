'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import UserNavBar from './UserNavBar';

// Import Cards for "My Activities" tab
import GroupRegisteredCard from '@/app/participants/group-registration/components/GroupRegisteredCard';
import WorkshopRegisteredCard from '@/app/participants/workshop-registration/components/WorkshopRegisteredCard';

// Import Views for "Registration" tabs
import GroupsView from '@/app/participants/group-registration/components/GroupsView';
import WorkshopsView from '@/app/participants/workshop-registration/components/WorkshopsView';

// --- Import the shared Carousel component ---
import AnnouncementsCarousel from '@/components/AnnouncementsCarousel/AnnouncementsCarousel';
import { Box, Typography } from '@mui/material';

interface ParticipantDashboardClientProps {
  initialGroups: any[];
  initialWorkshops: any[];
  initialUserGroupRegs: any[];
  initialUserWorkshopRegs: any[];
  initialAnnouncements: any[];
  userId: string;
  userName: string;
  userStatuses: string[];
}

export default function ParticipantDashboardClient({ 
  initialGroups, 
  initialWorkshops, 
  initialUserGroupRegs, 
  initialUserWorkshopRegs,
  initialAnnouncements,
  userId,
  userName,
  userStatuses
}: ParticipantDashboardClientProps) {
  
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('my-activities');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Central State for all data
  const [groups, setGroups] = useState(initialGroups);
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [userGroupRegs, setUserGroupRegs] = useState(initialUserGroupRegs);
  const [userWorkshopRegs, setUserWorkshopRegs] = useState(initialUserWorkshopRegs);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  
  const supabase = createClient();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- DATA PROCESSING HELPERS (For "My Activities" Tab only) ---

  // 1. My Activities (Registered Groups)
  const myGroups = useMemo(() => {
    return userGroupRegs
      .filter(reg => reg.status === 'approved')
      .map(reg => {
        const group = groups.find(g => g.id === reg.group_id);
        if (!group) return null;
        return { ...group, registrationStatus: reg.status, registrationId: reg.id };
      })
      .filter(Boolean);
  }, [groups, userGroupRegs]);

  // 2. My Activities (Registered Workshops)
  const myWorkshops = useMemo(() => {
    return userWorkshopRegs.map(reg => {
      const workshop = workshops.find(w => w.id === reg.workshop_id);
      if (!workshop) return null;
      return { ...workshop, registrationStatus: reg.status, registrationId: reg.id };
    }).filter(Boolean);
  }, [workshops, userWorkshopRegs]);


  // --- REALTIME LOGIC ---
  const refreshData = useCallback(async () => {
    console.log("Refreshing Participant Data...");
    
    // --- Use UTC Midnight to match Admin logic and Server Actions ---
    const now = new Date();
    // Create a date object representing 00:00:00 UTC of the current day.
    const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    const [gRes, wRes, gRegRes, wRegRes, annRes] = await Promise.all([
      supabase.from("groups").select('*').eq('status', 'open').order('created_at', { ascending: false }),
      supabase.from("workshops").select('*').eq('status', 'open').order('created_at', { ascending: false }),
      supabase.from('group_registrations').select('*').eq('user_id', userId),
      supabase.from('workshop_registrations').select('*').eq('user_id', userId),
      
      // --- Refresh announcements ---
      // Filter: Created >= UTC Midnight
      supabase.from('daily_announcements')
        .select('*')
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false })
    ]);

    if (gRes.data) setGroups(gRes.data);
    if (wRes.data) setWorkshops(wRes.data);
    if (gRegRes.data) setUserGroupRegs(gRegRes.data);
    if (wRegRes.data) setUserWorkshopRegs(wRegRes.data);
    if (annRes.data) setAnnouncements(annRes.data); 

  }, [supabase, userId]);

  useEffect(() => {
    const handleUpdate = () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => {
        refreshData();
      }, 1000);
    };

    const channel = supabase.channel('participant-spa-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workshops' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_registrations' }, handleUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workshop_registrations' }, handleUpdate)
      // --- Listen for changes in announcements ---
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_announcements' }, handleUpdate)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [supabase, refreshData]);


  // --- RENDER ---

  return (
    <div>
      <UserNavBar activeTab={activeTab} onTabSelect={setActiveTab} />

      {/* Main Content Area */}
      <div style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

        {/* Header Greeting */}
        <div style={{ marginBottom: '20px', marginTop: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
             שלום, {userName}!
            </h1>
        </div>

        {/* --- Daily Announcements Section --- */}
        {announcements.length > 0 && (
          <Box sx={{ mb: 4 }}>
             <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2, px: 1 }}>
               הודעות יומיות במרחב
             </Typography>

             {/* --- REUSED CAROUSEL COMPONENT --- 
                 Using the shared component handles auto-scroll, dots, and layout automatically.
                 No onDelete prop passed here, so it renders in Read-Only mode.
             */}
             <AnnouncementsCarousel 
               announcements={announcements} 
             />
          </Box>
        )}

        {/* TAB: MY ACTIVITIES */}
        {activeTab === 'my-activities' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
             {/* My Groups Section */}
             <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#1f2937' }}>הקבוצות שלי</h2>
                {myGroups.length === 0 ? (
                    <p style={{ color: '#6b7280' }}>את/ה יכול/ה להירשם לקבוצות שמתאימות לך בעמוד הקבוצות</p>
                ) : (
                    <GroupRegisteredCard groups={myGroups} />
                )}
             </div>

             {/* My Workshops Section */}
             <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#1f2937' }}>הסדנאות שלי</h2>
                {myWorkshops.length === 0 ? (
                    <p style={{ color: '#6b7280' }}>את/ה יכול/ה להירשם לסדנאות שמתאימות לך בעמוד הסדנאות</p>
                ) : (
                    <WorkshopRegisteredCard workshops={myWorkshops} />
                )}
             </div>
          </div>
        )}

        {/* TAB: GROUPS REGISTRATION - Using the extracted View */}
        {activeTab === 'groups' && (
            <GroupsView 
                groups={groups} 
                userGroupRegs={userGroupRegs} 
                userStatuses={userStatuses} 
            />
        )}

        {/* TAB: WORKSHOPS REGISTRATION - Using the extracted View */}
        {activeTab === 'workshops' && (
            <WorkshopsView 
                workshops={workshops} 
                userWorkshopRegs={userWorkshopRegs} 
                userStatuses={userStatuses} 
            />
        )}

      </div>
    </div>
  );
}