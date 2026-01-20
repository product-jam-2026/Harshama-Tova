import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import BackButton from "@/components/buttons/BackButton";
import ParticipantsList from "@/app/admin/components/ParticipantsList";
import StatsGrid from "@/components/Badges/StatsGrid";
import ExcelExportButton from "@/app/admin/components/ExcelExportButton";
import styles from "./page.module.css";


interface WorkshopParticipantPageProps {
  params: {
    id: string;
  };
}

export default async function WorkshopParticipantsPage({ params }: WorkshopParticipantPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const workshopId = params.id;

  // Fetch workshop details
  const { data: workshop, error: workshopError } = await supabase
    .from('workshops')
    .select('name')
    .eq('id', workshopId)
    .single();

  if (workshopError) return <div>Error loading workshop</div>;

  // Fetch registrations + User details
  const { data: registrations, error: regError } = await supabase
    .from('workshop_registrations')
    .select(`
      *,
      users (
        id,
        first_name,
        last_name,
        email,
        phone_number,
        city,
        gender,
        age,
        community_status,
        comments
      )
    `)
    .eq('workshop_id', workshopId)
    .order('created_at', { ascending: false });

  if (regError) return <div>Error loading participants</div>;

  const totalCount = registrations?.length || 0;

  const statsData = [
    { label: 'סה"כ נרשמים', value: totalCount, colorBg: '#f3f4f6', colorText: '#374151' },
  ];

  return (
    <div className={styles.container}>
      
      {/* Header Actions Container */}
      <div className={styles.headerActions}>
         <BackButton href="/admin/?tab=workshops"/>

         <ExcelExportButton 
            data={registrations || []} 
            fileName={`participants-${workshop.name}`} 
            exportType="workshop"
         />
      </div>

      <div className={styles.contentContainer}>
        <h3 className={styles.title}>
            נרשמים לסדנה: {workshop.name}
        </h3>

        <div className={styles.statsWrapper}>
        <StatsGrid stats={statsData} />
        </div>
        
      </div>

      {/* Use the new Client Component - showStatus is false for workshops */}
      <ParticipantsList registrations={registrations || []} showStatus={false} />
    </div>
  );
}