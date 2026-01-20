'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import UserNavBar from './UserNavBar';
import TopIcons from './TopIcons';
import Styles from './ParticipantDashboardClient.module.css';

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
  initialAllWorkshopRegs: any[];
  initialAllGroupRegs: any[];
  initialAnnouncements: any[];
  initialTab?: string;
  userId: string;
  userName: string;
  userStatuses: string[];
}

export default function ParticipantDashboardClient({ 
  initialGroups, 
  initialWorkshops, 
  initialUserGroupRegs, 
  initialUserWorkshopRegs,
  initialAllWorkshopRegs,
  initialAllGroupRegs,
  initialAnnouncements,
  initialTab = 'my-activities',
  userId,
  userName,
  userStatuses
}: ParticipantDashboardClientProps) {
  
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(initialTab);

  // סנכרון עם ה-URL כשמנווטים (למשל חזרה בדפדפן)
  useEffect(() => {
    const t = searchParams.get('tab') || 'my-activities';
    setActiveTab(t);
  }, [searchParams]);

  // Central State for all data
  const [groups, setGroups] = useState(initialGroups);
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [userGroupRegs, setUserGroupRegs] = useState(initialUserGroupRegs);
  const [userWorkshopRegs, setUserWorkshopRegs] = useState(initialUserWorkshopRegs);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [allWorkshopRegs, setAllWorkshopRegs] = useState(initialAllWorkshopRegs);
  const [allGroupRegs, setAllGroupRegs] = useState(initialAllGroupRegs);
  
  const supabase = createClient();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // When a Server Action completes (like registration), Next.js sends new props.
  // These effects ensure the local state updates immediately to match the new props.
  useEffect(() => { setGroups(initialGroups); }, [initialGroups]);
  useEffect(() => { setWorkshops(initialWorkshops); }, [initialWorkshops]);
  useEffect(() => { setUserGroupRegs(initialUserGroupRegs); }, [initialUserGroupRegs]);
  useEffect(() => { setUserWorkshopRegs(initialUserWorkshopRegs); }, [initialUserWorkshopRegs]);
  useEffect(() => { setAnnouncements(initialAnnouncements); }, [initialAnnouncements]);
  useEffect(() => { setAllWorkshopRegs(initialAllWorkshopRegs); }, [initialAllWorkshopRegs]);

  // --- DATA PROCESSING HELPERS (For "My Activities" Tab only) ---

  // Count registrations for each workshop
  const workshopIdToCount = useMemo(() => {
    const map: Record<string, number> = {};
    allWorkshopRegs.forEach((reg: any) => {
      if (!map[reg.workshop_id]) map[reg.workshop_id] = 0;
      map[reg.workshop_id]++;
    });
    return map;
  }, [allWorkshopRegs]);

  // Workshops with registration count (no filtering for dashboard)
  const workshopsWithCount = useMemo(() => {
    return workshops.map((w: any) => ({
      ...w,
      registeredCount: workshopIdToCount[w.id] || 0
    }));
  }, [workshops, workshopIdToCount]);

  // Count registrations for each group (only approved or pending)
  const groupIdToCount = useMemo(() => {
    const map: Record<string, number> = {};
    allGroupRegs.forEach((reg: any) => {
      if (reg.status === 'approved' || reg.status === 'pending') {
        if (!map[reg.group_id]) map[reg.group_id] = 0;
        map[reg.group_id]++;
      }
    });
    return map;
  }, [allGroupRegs]);

  // Groups with registration count (no filtering for dashboard)
  const groupsWithCount = useMemo(() => {
    return groups.map((g: any) => ({
      ...g,
      registeredCount: groupIdToCount[g.id] || 0
    }));
  }, [groups, groupIdToCount]);

  // 1. My Activities (Registered Groups)
  const myGroups = useMemo(() => {
    return userGroupRegs
      .filter((reg: any) => reg.status === 'approved')
      .map((reg: any) => {
        const group = groupsWithCount.find((g: any) => g.id === reg.group_id);
        if (!group) return null;
        return { ...group, registrationStatus: reg.status, registrationId: reg.id };
      })
      .filter(Boolean);
  }, [groupsWithCount, userGroupRegs]);

  // 2. My Activities (Registered Workshops)
  const myWorkshops = useMemo(() => {
    return userWorkshopRegs.map((reg: any) => {
      const workshop = workshopsWithCount.find((w: any) => w.id === reg.workshop_id);
      if (!workshop) return null;
      return {
        ...workshop,
        registrationStatus: reg.status,
        registrationId: reg.id
      };
    }).filter(Boolean);
  }, [workshopsWithCount, userWorkshopRegs]);


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
      <TopIcons />
      {/* Main Content Area */}
      <div className={Styles.container}>

        {/* Header Greeting */}
        <div className={Styles.header}>
            <h1>
             שלום {userName},
            </h1>
            <p className={Styles.h2Light}> שמחים לראות אותך כאן</p>
        </div>
        <UserNavBar activeTab={activeTab} onTabSelect={setActiveTab} />

        {/* TAB: MY ACTIVITIES */}
        {activeTab === 'my-activities' && (
          <div>

            {/* --- Daily Announcements Section --- */}
            {announcements.length > 0 && (
              <Box className={Styles.announcementsBox}>
                <AnnouncementsCarousel 
                  announcements={announcements} 
                />
              </Box>
            )}
            
            <h3 className={Styles.mySectionTitle}>הפעילויות שלי</h3>
 
             {/* My Workshops Section */}
             <div>
                <div className={Styles.mySectionTitle2}>
                  <img src="/icons/workshop-icon.svg" alt="Workshop Icon" className={Styles.sectionIcon} />
                  <p className={Styles.headline}>הסדנאות שלי</p>
                </div>
                {myWorkshops.length === 0 ? (
                    <>
                      <p className={Styles.mySectionText}>אנחנו כאן כדי לעזור לך למצוא את הסדנה המתאימה עבורך.</p>
                      <button className={Styles.exploreButton} onClick={() => setActiveTab('workshops')}>לסדנאות הזמינות</button>
                    </>
                ) : (
                    <WorkshopRegisteredCard workshops={myWorkshops} />
                )}
             </div>

             {/* My Groups Section */}
             <div>
                <div className={Styles.mySectionTitle}>
                  <img src="/icons/group-icon.svg" alt="Group Icon" className={Styles.sectionIcon} />
                  <p className={Styles.headline}>הקבוצות שלי</p>
                </div>
                {myGroups.length === 0 ? (
                    <>
                      <p className={Styles.mySectionText}>אנחנו כאן כדי לעזור לך למצוא את הקבוצה המתאימה עבורך.</p>
                      <button className={Styles.exploreButton} onClick={() => setActiveTab('groups')}>לקבוצות הזמינות</button>
                    </>
                ) : (
                    <GroupRegisteredCard groups={myGroups} />
                )}
             </div>
          </div>
        )}

        {/* TAB: GROUPS REGISTRATION - Using the extracted View */}
        {activeTab === 'groups' && (
            <GroupsView 
                groups={groupsWithCount} 
                userGroupRegs={userGroupRegs} 
                userStatuses={userStatuses} 
            />
        )}

        {/* TAB: WORKSHOPS REGISTRATION - Using the extracted View */}
        {activeTab === 'workshops' && (
          <WorkshopsView 
            workshops={workshopsWithCount} 
            userWorkshopRegs={userWorkshopRegs} 
            userStatuses={userStatuses} 
          />
        )}

      </div>
    </div>
  );
}