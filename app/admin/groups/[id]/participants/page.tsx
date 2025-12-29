import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { COMMUNITY_STATUSES } from "@/lib/constants";
import BackButton from "@/components/buttons/BackButton";

interface ParticipantPageProps {
  params: {
    id: string;
  };
}

export default async function GroupParticipantsPage({ params }: ParticipantPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const groupId = params.id;

  // Fetch group name (for the header)
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('name')
    .eq('id', groupId)
    .single();

  if (groupError) {
    return <div style={{ padding: 20 }}>Error loading group: {groupError.message}</div>;
  }

  // Fetch registrations + User details (Join)
  const { data: registrations, error: regError } = await supabase
    .from('group_registrations')
    .select(`
      *,
      users (
        first_name,
        last_name,
        phone_number,
        community_status
      )
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false }); // Newest first

  if (regError) {
    return <div style={{ padding: 20 }}>Error loading participants: {regError.message}</div>;
  }

  // --- Calculations ---
  const totalCount = registrations?.length || 0;
  const approvedCount = registrations?.filter((r) => r.status === 'approved').length || 0;
  const rejectedCount = registrations?.filter((r) => r.status === 'rejected').length || 0;
  // Pendings calculated by remainder
  const pendingCount = totalCount - approvedCount - rejectedCount;

  return (
    <div dir="rtl" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Reusable Back Button */}
      <BackButton href="/admin/groups"/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            נרשמים לקבוצה: {group.name}
        </h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
            
            {/* Total Badge */}
            <div style={{ background: '#f3f4f6', padding: '8px 16px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280' }}>סהכ</span>
                <strong style={{ fontSize: '18px' }}>{totalCount}</strong>
            </div>

            {/* Approved Badge */}
            <div style={{ background: '#dcfce7', padding: '8px 16px', borderRadius: '8px', textAlign: 'center', color: '#166534' }}>
                <span style={{ display: 'block', fontSize: '12px', opacity: 0.8 }}>אושרו</span>
                <strong style={{ fontSize: '18px' }}>{approvedCount}</strong>
            </div>

            {/* Rejected Badge */}
            <div style={{ background: '#fee2e2', padding: '8px 16px', borderRadius: '8px', textAlign: 'center', color: '#991b1b' }}>
                <span style={{ display: 'block', fontSize: '12px', opacity: 0.8 }}>נדחו</span>
                <strong style={{ fontSize: '18px' }}>{rejectedCount}</strong>
            </div>

             {/* Pending Badge */}
             <div style={{ background: '#fef9c3', padding: '8px 16px', borderRadius: '8px', textAlign: 'center', color: '#854d0e' }}>
                <span style={{ display: 'block', fontSize: '12px', opacity: 0.8 }}>ממתינים</span>
                <strong style={{ fontSize: '18px' }}>{pendingCount}</strong>
            </div>

        </div>
      </div>

      {/* Participants Table */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '15px', fontWeight: 'bold' }}>שם מלא</th>
              <th style={{ padding: '15px', fontWeight: 'bold' }}>טלפון</th>
              <th style={{ padding: '15px', fontWeight: 'bold' }}>סטטוס קהילתי</th>
              <th style={{ padding: '15px', fontWeight: 'bold' }}>סטטוס</th>
              <th style={{ padding: '15px', fontWeight: 'bold' }}>משהו נוסף שחשוב שנדע</th>
            </tr>
          </thead>
          <tbody>
            {!registrations || registrations.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                  עדיין אין נרשמים לקבוצה זו.
                </td>
              </tr>
            ) : (
              registrations.map((reg: any) => {
                const user = reg.users;
                
                // Multiple community statuses
                const userStatuses: string[] = user?.community_status || [];
                
                // Map each status value to its Hebrew label
                const statusLabels = userStatuses.map((statusValue: string) => {
                    const found = COMMUNITY_STATUSES.find(s => s.value === statusValue);
                    return found ? found.label : statusValue;
                });

                // Join them with a comma and space
                const communityStatusDisplay = statusLabels.length > 0 ? statusLabels.join(', ') : '-';

                return (
                  <tr key={reg.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>
                        {user ? `${user.first_name} ${user.last_name}` : 'משתמש לא נמצא'}
                    </td>
                    <td style={{ padding: '15px' }}>
                        {user?.phone_number || '-'} 
                    </td>
                    <td style={{ padding: '15px', maxWidth: '200px', lineHeight: '1.4' }}>
                        {/* Display the comma-separated list */}
                        {communityStatusDisplay}
                    </td>
                    <td style={{ padding: '15px' }}>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backgroundColor: reg.status === 'approved' ? '#dcfce7' : reg.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                            color: reg.status === 'approved' ? '#166534' : reg.status === 'rejected' ? '#991b1b' : '#854d0e'
                        }}>
                            {reg.status === 'approved' ? 'אושר' : reg.status === 'rejected' ? 'נדחה' : 'ממתין'}
                        </span>
                    </td>
                    <td style={{ padding: '15px', color: '#666', fontSize: '14px', maxWidth: '200px' }}>
                        {reg.comment || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}