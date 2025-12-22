import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import GroupsManager from "../components/GroupsManager";
import { checkAndCloseExpiredGroups } from "./actions";

export default async function GroupsPage() {

  // This ensures the DB is updated with any newly ended groups
  await checkAndCloseExpiredGroups();

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch groups from the database
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order('created_at', { ascending: false });

  // Pass the fetched groups data to the GroupsManager component
  return (
    <div dir="rtl">
      {/* We verify groups is not null before passing */}
      <GroupsManager groups={groups || []} />
    </div>
  );
}