import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import RequestCard from "../components/RequestCard";
import Link from "next/link";

export default async function GroupRequestsPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const groupId = params.id;

  // Fetch Group Details (Name)
  const { data: group } = await supabase
    .from('groups')
    .select('name')
    .eq('id', groupId)
    .single();

  // Fetch Pending Requests (Sorted by Oldest First)
  const { data: requests, error } = await supabase
    .from('group_registrations')
    .select(`
        id,
        created_at,
        users (*)
    `)
    .eq('group_id', groupId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true }); // Oldest request first

  if (error) {
    return <div>Error loading requests</div>;
  }

  return (
    <div dir="rtl" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      
      {/* Back Button */}
      <Link href="/admin/requests" style={{ display: 'flex', alignItems: 'center', color: '#666', textDecoration: 'none', marginBottom: '20px' }}>
        <span style={{ marginLeft: '5px' }}>→</span> חזרה לרשימת הקבוצות
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
        בקשות לקבוצה: {group?.name}
      </h1>

      {requests && requests.length > 0 ? (
        <div>
            {requests.map((req: any) => (
                <RequestCard 
                    key={req.id}
                    registrationId={req.id}
                    user={req.users}
                    createdAt={req.created_at}
                />
            ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '10px' }}>
            אין בקשות ממתינות בקבוצה זו.
        </div>
      )}
    </div>
  );
}