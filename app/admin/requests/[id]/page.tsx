import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import RequestCard from "../components/RequestCard";
import BackButton from "@/components/buttons/BackButton";
import styles from "./page.module.css";

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
    <div dir="rtl" className={styles.pageContainer}>
      
      {/* Reusable Back Button */}
      <BackButton href="/admin?tab=requests"/>

      <h3 className={styles.title}>
        {group?.name}
      </h3>

      {requests && requests.length > 0 ? (
        <div>
            {requests
              .filter((req: any) => req.users !== null) // Filter out requests with null users
              .map((req: any) => (
                <RequestCard 
                    key={req.id}
                    registrationId={req.id}
                    user={req.users}
                    createdAt={req.created_at}
                />
            ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className="p4">אין בקשות ממתינות בקבוצה זו.</p>
        </div>
      )}
    </div>
  );
}