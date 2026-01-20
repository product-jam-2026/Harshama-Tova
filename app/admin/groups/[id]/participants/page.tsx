import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import BackButton from "@/components/buttons/BackButton";
import ParticipantsList from "@/app/admin/components/ParticipantsList";
import StatsGrid from "@/components/Badges/StatsGrid";
import ExcelExportButton from "@/app/admin/components/ExcelExportButton";
import styles from "./page.module.css";

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
        community_status,
        comments
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
    { label: 'סה"כ', value: totalCount, colorBg: 'var(--color-background-light)', colorText: 'var(--text-dark-2)' },
    { label: 'אושרו', value: approvedCount, colorBg: 'var(--group-color)', colorText: 'var(--group-text-color)' },
    { label: 'נדחו', value: rejectedCount, colorBg: 'var(--workshop-color)', colorText: 'var(--workshop-text-color)' },
    { label: 'ממתינים', value: pendingCount, colorBg: 'var(--light-blue-color)', colorText: 'var(--border-color)' },
  ];

  return (
    <div className={styles.container}>
      
      {/* Header Actions Container */}
      <div className={styles.headerActions}>
         <BackButton href="/admin/?tab=groups"/>

         <ExcelExportButton 
           data={registrations || []} 
           fileName={`participants-approved-${group.name}`} 
           exportType="group" 
         />
      </div>

      <div className={styles.contentContainer}>
        <h3 className={styles.title}>
            נרשמים לקבוצה: {group.name}
        </h3>
        <StatsGrid stats={statsData} />
      </div>

      {/* Use the Client Component for the list */}
      <ParticipantsList registrations={registrations || []} showStatus={true} />
    </div>
  );
}