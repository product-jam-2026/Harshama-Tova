import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import GroupForm from "../../components/GroupForm";

export default async function EditGroupPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch data on the server
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !group) {
    return <div>קבוצה לא נמצאה</div>;
  }

  // Render the shared form WITH data (Edit Mode)
  return (
    <div dir="rtl">
      <GroupForm initialData={group} />
    </div>
  );
}