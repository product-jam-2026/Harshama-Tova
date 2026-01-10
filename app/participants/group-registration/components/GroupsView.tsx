'use client';

import { useState, useMemo } from 'react';
import GroupUnregisteredCard from './GroupUnregisteredCard';
import Button from '@/components/buttons/Button';
import { hasGroupEnded } from '@/lib/utils/date-utils';

interface GroupsViewProps {
  groups: any[];
  userGroupRegs: any[];
  userStatuses: string[];
}

export default function GroupsView({ groups, userGroupRegs, userStatuses }: GroupsViewProps) {
  // Local state for the filter button (specific to this view)
  const [showAll, setShowAll] = useState(false);

  // Filter Logic: Filter groups based on status, registration, and date
  const availableGroups = useMemo(() => {
    const registeredGroupIds = new Set(userGroupRegs.map(r => r.group_id));
    
    return groups.filter(group => {
      const isOpen = group.status === 'open';
      const isNotRegistered = !registeredGroupIds.has(group.id);
      const isNotEnded = !hasGroupEnded(group.date, group.meetings_count);
      
      // Matching Logic: Check if the group matches the user's community status
      let isMatch = true;
      // If filtering is ON (!showAll), check for status match
      if (!showAll && group.community_status?.length > 0 && userStatuses?.length > 0) {
         isMatch = userStatuses.some(status => group.community_status.includes(status));
      }
      // If user has no status or group has no target audience, it's a match by default
      // If showAll is true, we ignore the match check (isMatch stays true effectively)

      return isOpen && isNotRegistered && isNotEnded && isMatch;
    });
  }, [groups, userGroupRegs, userStatuses, showAll]);

  return (
    <div>
      <div>
        <Button
            className="filter-button"
            variant="secondary-light"
            size="sm"
            onClick={() => setShowAll(!showAll)}
        >
            {showAll ? 'הצג קבוצות המתאימות עבורי' : 'הצג את כל הקבוצות'}
        </Button>
      </div>
      
      {availableGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
            <p className="dark-texts">
                {showAll 
                    ? 'אין קבוצות זמינות להרשמה כרגע.' 
                    : 'אין כרגע קבוצות זמינות עבורך, מוזמנ/ת לעקוב ולהתעדכן.'}
            </p>
        </div>
      ) : (
        <GroupUnregisteredCard groups={availableGroups} />
      )}
    </div>
  );
}