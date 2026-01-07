import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import BackButton from "@/components/buttons/BackButton";
import ParticipantsList from "@/app/admin/components/ParticipantsList";
import StatsGrid from "@/components/Badges/StatsGrid";
import ExcelExportButton from "@/app/admin/components/ExcelExportButton";

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
        community_status
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
    <div dir="rtl" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header Actions Container */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
         <BackButton href="/admin/workshops"/>

         <ExcelExportButton 
            data={registrations || []} 
            fileName={`participants-${workshop.name}`} 
            exportType="workshop"
         />
      </div>

      <div style={{ margin: '30px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>
            נרשמים לסדנה: {workshop.name}
        </h1>
        <StatsGrid stats={statsData} />
      </div>

      {/* Use the new Client Component - showStatus is false for workshops */}
      <ParticipantsList registrations={registrations || []} showStatus={false} />
    </div>
  );
}