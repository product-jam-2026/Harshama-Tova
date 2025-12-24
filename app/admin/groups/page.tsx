import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import GroupsManager from "./components/GroupsManager";
import { checkAndCloseExpiredGroups } from "./actions";

export default async function GroupsPage() {

  // This ensures the DB is updated with any newly ended groups
  await checkAndCloseExpiredGroups();

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- OPTIMIZATION: Fetch all data in parallel ---
  const [groupsResult, approvedResult, pendingResult] = await Promise.all([
    // 1. Fetch groups
    supabase
      .from("groups")
      .select('*')
      .order('created_at', { ascending: false }),

    // 2. Fetch APPROVED registrations (for participants count)
    supabase
      .from('group_registrations')
      .select('group_id')
      .eq('status', 'approved'),

    // 3. Fetch PENDING registrations (for requests badge)
    supabase
      .from('group_registrations')
      .select('group_id')
      .eq('status', 'pending')
  ]);

  // Extract data and errors from results
  const { data: groupsData, error: groupsError } = groupsResult;
  const { data: approvedRegistrations, error: regsError } = approvedResult;
  const { data: pendingRegistrations, error: pendingError } = pendingResult;

  // Log errors if they exist
  if (groupsError) console.error("Error fetching groups:", groupsError);
  if (regsError) console.error("Error fetching approved registrations:", regsError);
  if (pendingError) console.error("Error fetching pending registrations:", pendingError);

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