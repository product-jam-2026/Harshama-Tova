import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import BackButton from "@/components/buttons/BackButton";
import ParticipantsList from "@/components/ParticipantsList";
import StatsGrid from "@/components/Badges/StatsGrid";

interface ParticipantPageProps {
  params: {
    id: string;
  };
}

export default async function GroupParticipantsPage({ params }: ParticipantPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const groupId = params.id;

  // Fetch group name
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('name')
    .eq('id', groupId)
    .single();

  if (groupError) return <div>Error loading group</div>;

  // Fetch registrations + User details
  // Note: We select specific user fields needed for the popup
  const { data: registrations, error: regError } = await supabase
    .from('group_registrations')
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
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (regError) return <div>Error loading participants</div>;

  // Calculations
  const totalCount = registrations?.length || 0;
  const approvedCount = registrations?.filter((r) => r.status === 'approved').length || 0;
  const rejectedCount = registrations?.filter((r) => r.status === 'rejected').length || 0;
  const pendingCount = totalCount - approvedCount - rejectedCount;

  const statsData = [
    { label: 'סה"כ', value: totalCount, colorBg: '#f3f4f6', colorText: '#374151' },
    { label: 'אושרו', value: approvedCount, colorBg: '#dcfce7', colorText: '#166534' },
    { label: 'נדחו', value: rejectedCount, colorBg: '#fee2e2', colorText: '#991b1b' },
    { label: 'ממתינים', value: pendingCount, colorBg: '#fef9c3', colorText: '#854d0e' },
  ];

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <BackButton href="/admin/groups"/>

      <div style={{ margin: '30px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>
            נרשמים לקבוצה: {group.name}
        </h1>
        <StatsGrid stats={statsData} />
      </div>

      {/* Use the new Client Component */}
      <ParticipantsList registrations={registrations || []} showStatus={true} />
    </div>
  );
}