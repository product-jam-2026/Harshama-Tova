import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ParticipantDashboardClient from './components/ParticipantDashboardClient';

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams?: { tab?: string | string[] };
}) {
  const tabParam = searchParams?.tab;
  const initialTab = (typeof tabParam === 'string' ? tabParam : Array.isArray(tabParam) ? tabParam[0] : null) || 'my-activities';
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/?screen=last');
  }

  // Calculate today's time range for announcements
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // OPTIMIZATION: Fetch ALL necessary data streams in parallel
  const [userDataRes, groupsRes, workshopsRes, userGroupRegsRes, userWorkshopRegsRes, allWorkshopRegsRes, allGroupRegsRes, announcementsRes] = await Promise.all([
    // Fetch user profile data
    supabase
      .from('users')
      .select('first_name, last_name, community_status')
      .eq('id', user.id)
      .single(),

    // Fetch ALL open groups (Client will filter)
    supabase
      .from('groups')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false }),

    // Fetch ALL open workshops (Client will filter)
    supabase
      .from('workshops')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false }),

    // Fetch User's Group Registrations
    supabase
      .from('group_registrations')
      .select('*')
      .eq('user_id', user.id),

    // Fetch User's Workshop Registrations
    supabase
      .from('workshop_registrations')
      .select('*')
      .eq('user_id', user.id),

    // Fetch ALL workshop registrations (for counting per workshop)
    supabase
      .from('workshop_registrations')
      .select('*'),

    // Fetch ALL group registrations (for counting per group)
    supabase
      .from('group_registrations')
      .select('*'),


    // --- Fetch Daily Announcements ---
    supabase
      .from('daily_announcements')
      .select('*')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString())
      .order('created_at', { ascending: false }) 
  ]);

  // Extract data
  const userData = userDataRes.data;
  const groups = groupsRes.data || [];
  const workshops = workshopsRes.data || [];
  const allWorkshopRegs = allWorkshopRegsRes.data || [];
  const allGroupRegs = allGroupRegsRes.data || [];
  const userGroupRegs = userGroupRegsRes.data || [];
  const userWorkshopRegs = userWorkshopRegsRes.data || [];
  const announcements = announcementsRes.data || []; // Extract announcements

  return (
    <div>
      <Suspense
        fallback={
          <div className="loading-container">
            <div className="loading-spinner-simple" />
            <p style={{ marginTop: 12, fontFamily: 'var(--font-body)', color: 'var(--text-dark-2)' }}>טוען...</p>
          </div>
        }
      >
        <ParticipantDashboardClient
          initialGroups={groups}
          initialWorkshops={workshops}
          initialUserGroupRegs={userGroupRegs}
          initialUserWorkshopRegs={userWorkshopRegs}
          initialAllWorkshopRegs={allWorkshopRegs}
          initialAllGroupRegs={allGroupRegs}
          initialAnnouncements={announcements}
          initialTab={initialTab}
          userId={user.id}
          userName={userData?.first_name || 'משתתף/ת'}
          userStatuses={userData?.community_status || []}
        />
      </Suspense>
    </div>
  );
}