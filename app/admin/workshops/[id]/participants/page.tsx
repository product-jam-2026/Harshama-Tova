import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import BackButton from "@/components/buttons/BackButton";
import ParticipantsList from "@/components/ParticipantsList";
import StatsGrid from "@/components/Badges/StatsGrid";

interface WorkshopParticipantPageProps {
  params: {
    id: string;
  };
}

export default async function WorkshopParticipantsPage({ params }: WorkshopParticipantPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const workshopId = params.id;

  const { data: workshop, error: workshopError } = await supabase
    .from('workshops')
    .select('name')
    .eq('id', workshopId)
    .single();

  if (workshopError) return <div>Error loading workshop</div>;

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
      <BackButton href="/admin/workshops"/>

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