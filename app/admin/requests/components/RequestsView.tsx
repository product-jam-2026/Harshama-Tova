'use client';

import GroupRequestCard from "./GroupRequestCard";
import styles from "./RequestsView.module.css";

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
    <div className={styles.container}>
      <h3 className={styles.title}>בקשות הצטרפות לקבוצות</h3>

      {groupsWithRequests.length === 0 ? (
        <div className={styles.emptyState}>
            <p className="p4">אין בקשות חדשות.</p>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          {groupsWithRequests.map((group) => (
            <GroupRequestCard
                key={group.id}
                groupId={group.id}
                groupName={group.name}
                imageUrl={group.image_url}
                requestCount={groupCounts[group.id]}
                // Pass the missing data to the card
                mentor={group.mentor}
                audience={group.community_status} 
            />
          ))}
        </div>
      )}
    </div>
  );
}