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
    <div dir="rtl" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>עריכת סדנה: {workshop.name}</h1>
      <WorkshopForm initialData={workshop} />
    </div>
  );
}