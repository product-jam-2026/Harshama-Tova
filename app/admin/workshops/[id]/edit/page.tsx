import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import WorkshopForm from "../../components/WorkshopForm";

export default async function EditWorkshopPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch the existing workshop data
  const { data: workshop, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !workshop) {
    return <div>סדנה לא נמצאה</div>;
  }

  // Render the shared form WITH data (Edit Mode)
  return (
    <div dir="rtl">
      <WorkshopForm initialData={workshop} />
    </div>
  );
}