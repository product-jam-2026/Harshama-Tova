import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import WorkshopsManager from "../components/WorkshopsManager";
import { checkAndCloseExpiredWorkshops } from "./actions";

export default async function WorkshopsPage() {

  // This ensures the DB is updated with any newly ended workshops based on the date
  await checkAndCloseExpiredWorkshops();

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch workshops from the database
  const { data: workshopsData, error: workshopsError } = await supabase
    .from("workshops")
    .select('*')
    .order('created_at', { ascending: false });

  if (workshopsError) {
    console.error("Error fetching workshops:", workshopsError);
  }

  // Fetch all registrations (Workshops usually don't require approval)
  const { data: allRegistrations, error: regsError } = await supabase
    .from('workshop_registrations')
    .select('workshop_id');
  
  if (regsError) {
    console.error("Error fetching registrations:", regsError);
  }

  const workshops = workshopsData?.map(workshop => {
    // Count all participants for each workshop
    const participantsCount = allRegistrations?.filter(r => r.workshop_id === workshop.id).length || 0;

    return {
      ...workshop,
      participants_count: participantsCount
    };
  }) || [];

  // Pass the fetched workshops data to the WorkshopsManager component
  return (
    <div dir="rtl">
      {/* We verify workshops is not null before passing */}
      <WorkshopsManager workshops={workshops} />
    </div>
  );
}