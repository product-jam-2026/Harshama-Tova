import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboardClient from './components/AdminDashboardClient';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: { tab?: string | string[] };
}) {
  const tabParam = searchParams?.tab;
  const initialTab = (typeof tabParam === 'string' ? tabParam : Array.isArray(tabParam) ? tabParam[0] : null) || 'dashboard';

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Double security check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/?screen=last');
  }

  // Calculate today's time range for announcements (Server Side)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // --- FETCH ALL DATA IN PARALLEL ---
  const [groupsRes, workshopsRes, groupRegsRes, workshopRegsRes, announcementsRes] = await Promise.all([
    supabase.from("groups").select('*').order('created_at', { ascending: false }),
    supabase.from("workshops").select('*').order('created_at', { ascending: false }),
    supabase.from('group_registrations').select('*'),
    supabase.from('workshop_registrations').select('*'),
    // --- Fetch Daily Announcements ---
    supabase.from('daily_announcements')
      .select('*')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString())
      .order('created_at', { ascending: false }) 
  ]);

  return (
    <Suspense
      fallback={
        <div className="loading-container">
          <div className="loading-spinner-simple" />
          <p style={{ marginTop: 12, fontFamily: 'var(--font-body)', color: 'var(--text-dark-2)' }}>טוען...</p>
        </div>
      }
    >
      <AdminDashboardClient
        initialGroups={groupsRes.data || []}
        initialWorkshops={workshopsRes.data || []}
        initialGroupRegs={groupRegsRes.data || []}
        initialWorkshopRegs={workshopRegsRes.data || []}
        initialAnnouncements={announcementsRes.data || []}
        initialTab={initialTab}
      />
    </Suspense>
  );
}