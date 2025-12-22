import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import GroupRegistered from '@/app/participants/components/group-registered-card';
import WorkshopRegistered from '@/app/participants/components/workshop-registered-card';

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

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

  return (
    <div>
      <p>שלום, {user?.user_metadata?.full_name || user?.email || ''}!</p>
      
      <p>הקבוצות שלי:</p>
      <GroupRegistered groups={approvedGroups} />

      <p> הסדנאות שלי: </p>
      <WorkshopRegistered />
    </div>
  );
}