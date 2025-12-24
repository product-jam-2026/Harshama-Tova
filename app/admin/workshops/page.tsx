import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import WorkshopsManager from "./components/WorkshopsManager";
import { checkAndCloseExpiredWorkshops } from "./actions";

export default async function WorkshopsPage() {

  // This ensures the DB is updated with any newly ended workshops based on the date
  await checkAndCloseExpiredWorkshops();

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- OPTIMIZATION: Fetch all data in parallel ---
  const [workshopsResult, registrationsResult] = await Promise.all([
    // 1. Fetch workshops
    supabase
      .from("workshops")
      .select('*')
      .order('created_at', { ascending: false }),

    // 2. Fetch all registrations (Workshops don't require approval)
    supabase
      .from('workshop_registrations')
      .select('workshop_id')
  ]);

  // Extract data and errors from results
  const { data: workshopsData, error: workshopsError } = workshopsResult;
  const { data: allRegistrations, error: regsError } = registrationsResult;

  // Log errors if they exist
  if (workshopsError) console.error("Error fetching workshops:", workshopsError);
  if (regsError) console.error("Error fetching registrations:", regsError);

  // Map workshops and add counts
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