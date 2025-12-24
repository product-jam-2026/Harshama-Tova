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

  // Fetch APPROVED registrations (for participants count)
  const { data: approvedRegistrations, error: regsError } = await supabase
    .from('group_registrations')
    .select('group_id')
    .eq('status', 'approved');
  
  if (regsError) {
    console.error("Error fetching approved registrations:", regsError);
  }

  // Fetch PENDING registrations (for requests badge)
  const { data: pendingRegistrations, error: pendingError } = await supabase
    .from('group_registrations')
    .select('group_id')
    .eq('status', 'pending');
  
  if (pendingError) {
      console.error("Error fetching pending registrations:", pendingError);
  }

  // Map groups and add counts
  const groups = groupsData?.map(group => {
    // Count approved participants
    const approvedCount = approvedRegistrations?.filter(r => r.group_id === group.id).length || 0;
    
    // Count pending requests
    const pendingCount = pendingRegistrations?.filter(r => r.group_id === group.id).length || 0;

    return {
      ...group,
      participants_count: approvedCount,
      pending_count: pendingCount 
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