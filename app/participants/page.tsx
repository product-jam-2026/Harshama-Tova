import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import GroupRegisteredCard from '@/app/participants/components/GroupRegisteredCard';
import WorkshopRegisteredCard from '@/app/participants/components/WorkshopRegisteredCsrd';

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user data from users table
  let userData: { first_name: string; last_name: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();
    userData = data;
  }

  // Fetch approved group registrations for this user
  let approvedGroups: any[] = [];
  if (user) {
    // Get all approved registrations for this user
    
    const { data: registrations } = await supabase
      .from('group_registrations')
      .select('group_id')
      .eq('user_id', user.id)
      .eq('status', 'approved');

    if (registrations && registrations.length > 0) {
      const groupIds = registrations.map(reg => reg.group_id);
      
      // Fetch the group details
      const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);

      approvedGroups = groups || [];
    }
  }

  // Fetch approved group registrations for this user
  let approvedWorkshops: any[] = [];
  if (user) {
    // Get all approved registrations for this user
    
    const { data: registrations } = await supabase
      .from('workshop_registrations')
      .select('workshop_id')
      .eq('user_id', user.id)

    if (registrations && registrations.length > 0) {
      const workshopIds = registrations.map(reg => reg.workshop_id);
      
      // Fetch the workshop details
      const { data: workshops } = await supabase
        .from('workshops')
        .select('*')
        .in('id', workshopIds);

      approvedWorkshops = workshops || [];
    }
  }

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