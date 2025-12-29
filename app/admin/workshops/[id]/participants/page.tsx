import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { COMMUNITY_STATUSES } from "@/lib/constants";
import BackButton from "@/components/Buttons/BackButton";

interface WorkshopParticipantPageProps {
  params: {
    id: string;
  };
}

export default async function WorkshopParticipantsPage({ params }: WorkshopParticipantPageProps) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const workshopId = params.id;

  // Fetch workshop name (for the header)
  const { data: workshop, error: workshopError } = await supabase
    .from('workshops')
    .select('name')
    .eq('id', workshopId)
    .single();

  if (workshopError) {
    return <div style={{ padding: 20 }}>Error loading workshop: {workshopError.message}</div>;
  }

  // Fetch registrations + User details (Join)
  const { data: registrations, error: regError } = await supabase
    .from('workshop_registrations')
    .select(`
      *,
      users (
        first_name,
        last_name,
        phone_number,
        community_status
      )
    `)
    .eq('workshop_id', workshopId)
    .order('created_at', { ascending: false }); // Newest first

  if (regError) {
    return <div style={{ padding: 20 }}>Error loading participants: {regError.message}</div>;
  }

  // --- Calculations ---
  // We count all registrations as valid participants (there is no approval flow here)
  const totalCount = registrations?.length || 0;

  return (
    <div dir="rtl" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Reusable Back Button */}
      <BackButton href="/admin/workshops" text="חזרה לניהול סדנאות" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            נרשמים לסדנה: {workshop.name}
        </h1>
        
        {/* Total Badge */}
        <div style={{ background: '#f3f4f6', padding: '10px 20px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '12px', color: '#6b7280' }}>סה&quot;כ נרשמים</span>
            <strong style={{ fontSize: '18px' }}>{totalCount}</strong>
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
              <th style={{ padding: '15px', fontWeight: 'bold' }}>משהו נוסף שחשוב שנדע</th> 
            </tr>
          </thead>
          <tbody>
            {!registrations || registrations.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                  עדיין אין נרשמים לסדנה זו.
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