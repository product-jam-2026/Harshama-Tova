import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import GroupRequestCard from "./components/GroupRequestCard";

export default async function RequestsDashboard() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- OPTIMIZATION: Fetch pending regs AND groups in parallel ---
  const [pendingResult, groupsResult] = await Promise.all([
    // 1. Fetch all pending registrations
    supabase
      .from('group_registrations')
      .select('group_id')
      .eq('status', 'pending'),

    // 2. Fetch all groups (lightweight fetch - only needed fields)
    supabase
      .from('groups')
      .select('id, name, image_url')
  ]);

  const { data: pendingRegs, error: pendingError } = pendingResult;
  const { data: allGroups, error: groupsError } = groupsResult;

  if (pendingError) console.error("Error fetching pending regs:", pendingError);
  if (groupsError) console.error("Error fetching groups:", groupsError);

  // --- Processing Data ---

  // 1. Count requests per group
  const groupCounts: { [key: string]: number } = {};
  pendingRegs?.forEach((reg) => {
    groupCounts[reg.group_id] = (groupCounts[reg.group_id] || 0) + 1;
  });

  // 2. Filter groups that actually have pending requests
  const groupsWithRequests = allGroups?.filter(group => groupCounts[group.id] > 0) || [];

  return (
    <div dir="rtl" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>ניהול בקשות הצטרפות</h1>

      {groupsWithRequests.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
           <p>אין בקשות חדשות.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {groupsWithRequests.map((group) => (
            <GroupRequestCard
                key={group.id}
                groupId={group.id}
                groupName={group.name}
                imageUrl={group.image_url}
                requestCount={groupCounts[group.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}