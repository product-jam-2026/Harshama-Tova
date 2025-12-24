// app/admin/requests/page.tsx

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import GroupRequestCard from "./components/GroupRequestCard";

export default async function RequestsDashboard() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch all pending registrations
  const { data: pendingRegs } = await supabase
    .from('group_registrations')
    .select('group_id')
    .eq('status', 'pending');

  // Count requests per group
  const groupCounts: { [key: string]: number } = {};
  pendingRegs?.forEach((reg) => {
    groupCounts[reg.group_id] = (groupCounts[reg.group_id] || 0) + 1;
  });

  // Fetch details for groups that have requests
  const groupIds = Object.keys(groupCounts);
  
  let groupsWithRequests: any[] = [];
  if (groupIds.length > 0) {
      const { data } = await supabase
        .from('groups')
        .select('id, name, image_url')
        .in('id', groupIds);
      groupsWithRequests = data || [];
  }

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