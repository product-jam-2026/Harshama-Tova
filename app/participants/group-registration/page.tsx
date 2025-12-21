import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import GroupUnregistered from '@/components/group-unregistered';

export default async function GroupsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Getting current user data
  const { data: { user } } = await supabase.auth.getUser();

  // Fetching open groups
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .eq('status', 'open')
    .gte('registration_end_date', new Date().toISOString())
    .order('date', { ascending: true });

  // Get user's registrations
  let registeredGroupIds: string[] = [];
  if (user) {
    const { data: registrations } = await supabase
      .from('group_registrations')
      .select('group-id')
      .eq('user-id', user.id);
    
    registeredGroupIds = registrations?.map(r => r['group-id']) || [];
  }

  // Filter out groups the user is already registered to
  const availableGroups = groups?.filter(group => !registeredGroupIds.includes(group.id)) || [];

  return (
    <div>
      <GroupUnregistered groups={availableGroups} />
    </div>
  );
}