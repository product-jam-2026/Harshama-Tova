import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import GroupRegisteredCard from '@/app/participants/components/GroupRegisteredCard';
import WorkshopRegisteredCard from '@/app/participants/components/WorkshopRegisteredCsrd'; // typo in original filename?

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user first
  const { data: { user } } = await supabase.auth.getUser();

  // OPTIMIZATION: Fetch all data streams in parallel using Promise.all
  const [userDataResult, approvedGroups, approvedWorkshops] = await Promise.all([
    
    // Fetch user profile data
    user 
      ? supabase.from('users').select('first_name, last_name').eq('id', user.id).single()
      : Promise.resolve({ data: null }),

    // Fetch approved groups
    (async () => {
      if (!user) return [];
      
      // Get registrations first
      const { data: regs } = await supabase
        .from('group_registrations')
        .select('group_id')
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (!regs || regs.length === 0) return [];

      // Get full group details using the IDs
      const groupIds = regs.map(r => r.group_id);
      const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);
      
      return groups || [];
    })(),

    // Fetch approved workshops
    (async () => {
      if (!user) return [];

      // Get registrations first (Workshops don't have 'approved' status)
      const { data: regs } = await supabase
        .from('workshop_registrations')
        .select('workshop_id')
        .eq('user_id', user.id);

      if (!regs || regs.length === 0) return [];

      // Get full workshop details using the IDs
      const workshopIds = regs.map(r => r.workshop_id);
      const { data: workshops } = await supabase
        .from('workshops')
        .select('*')
        .in('id', workshopIds);

      return workshops || [];
    })()
  ]);

  // Extract user data from the result
  const userData = userDataResult.data;

  return (
    <div>
      <p>שלום, {userData?.first_name || ''}!</p>
      
      <p>הקבוצות שלי:</p>
      {approvedGroups.length > 0 ? (
        <GroupRegisteredCard groups={approvedGroups} />
      ) : (
        <p>כרגע אינך רשומ/ה לאף קבוצה עדיין</p>
      )}

      <p> הסדנאות שלי: </p>
      {approvedWorkshops.length > 0 ? (
        <WorkshopRegisteredCard workshops={approvedWorkshops} />
      ) : (
        <p>כרגע אינך רשומ/ה לאף סדנה עדיין</p>
      )}
    </div>
  );
}