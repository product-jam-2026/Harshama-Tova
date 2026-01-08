'use client';

import GroupRequestCard from "./GroupRequestCard";

interface RequestsViewProps {
  groups: any[];
  pendingRegistrations: any[];
}

export default function RequestsView({ groups, pendingRegistrations }: RequestsViewProps) {
  
  // Count requests per group
  const groupCounts: { [key: string]: number } = {};
  pendingRegistrations?.forEach((reg) => {
    groupCounts[reg.group_id] = (groupCounts[reg.group_id] || 0) + 1;
  });

  // Filter groups that actually have pending requests
  const groupsWithRequests = groups?.filter(group => groupCounts[group.id] > 0) || [];

  return (
    <div dir="rtl" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>בקשות הצטרפות לקבוצות</h1>

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