import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import GroupsManager from "./components/GroupsManager";
import { checkAndCloseExpiredGroups } from "./actions";

export default async function GroupsPage() {

  // This ensures the DB is updated with any newly ended groups
  await checkAndCloseExpiredGroups();

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch groups from the database
  const { data: groupsData, error: groupsError } = await supabase
    .from("groups")
    .select('*')
    .order('created_at', { ascending: false });

  if (groupsError) {
    console.error("Error fetching groups:", groupsError);
  }

  // Take only the group_id of approved registrations
  const { data: approvedRegistrations, error: regsError } = await supabase
    .from('group_registrations')
    .select('group_id')
    .eq('status', 'approved');
  
  if (regsError) {
    console.error("Error fetching registrations:", regsError);
  }

  const groups = groupsData?.map(group => {
    // Count approved participants for each group
    const approvedCount = approvedRegistrations?.filter(r => r.group_id === group.id).length || 0;

    return {
      ...group,
      participants_count: approvedCount
    };
  }) || [];

  // Pass the fetched groups data to the GroupsManager component
  return (
    <div dir="rtl">
      {/* We verify groups is not null before passing */}
      <GroupsManager groups={groups} />
    </div>
  );
}