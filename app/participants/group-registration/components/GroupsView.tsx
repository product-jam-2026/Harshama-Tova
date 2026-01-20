'use client';

import { useState, useMemo } from 'react';
import GroupUnregisteredCard from './GroupUnregisteredCard';
import styles from './GroupsView.module.css';
import { hasGroupEnded } from '@/lib/utils/date-utils';

interface GroupsViewProps {
  groups: any[];
  userGroupRegs: any[];
  userStatuses: string[];
}

export default function GroupsView({ groups, userGroupRegs, userStatuses }: GroupsViewProps) {
  // Local state for the filter button (specific to this view)
  const [filter, setFilter] = useState<'all' | 'mine'>('mine');

  // Filter Logic: Filter groups based on status, registration, and date
  const availableGroups = useMemo(() => {
    const registeredGroupIds = new Set(userGroupRegs.map(r => r.group_id));
    return groups.filter(group => {
      const isOpen = group.status === 'open';
      const isNotRegistered = !registeredGroupIds.has(group.id);
      const isNotEnded = !hasGroupEnded(group.date, group.meetings_count);
      // filter according to available spots
      const hasSpace =
        typeof group.max_participants !== 'number' ||
        typeof group.registeredCount !== 'number' ||
        group.registeredCount < group.max_participants;

      // Matching Logic: Check if the group matches the user's community status
      let isMatch = true;
      if (filter === 'mine' && group.community_status?.length > 0 && userStatuses?.length > 0) {
        isMatch = userStatuses.some(status => group.community_status.includes(status));
      }
      // If user has no status or group has no target audience, it's a match by default
      // If showAll is true, we ignore the match check (isMatch stays true effectively)

      return isOpen && isNotRegistered && isNotEnded && isMatch && hasSpace;
    });
  }, [groups, userGroupRegs, userStatuses, filter]);

  return (
    <div>
      <header className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>קבוצות פעילות</h3>
        <div className={styles.introRow}>
          <img src="/icons/igulim.svg" alt="" className={styles.introIcon} />
          <p className={styles.introText}>
            כאן תוכלו לראות את כל הקבוצות
            <br />
            המתקיימות במרחב
          </p>
        </div>
      </header>

      <div className={styles.filterButtonsRow}>
        <button
          className={filter === 'all' ? styles.activeFilterButton : styles.filterButton}
          onClick={() => setFilter('all')}
        >
          לכל הקבוצות
        </button>
        <button
          className={filter === 'mine' ? styles.activeFilterButton : styles.filterButton}
          onClick={() => setFilter('mine')}
        >
          קבוצות מותאמות אליי
        </button>
      </div>
      
      {availableGroups.length === 0 ? (
        <div className={styles.noGroupsMessage}>
            <p className="dark-texts">
                {filter === 'all' 
                    ? 'אין קבוצות זמינות להרשמה כרגע, מוזמנ/ת לעקוב ולהתעדכן.' 
                    : 'אין כרגע קבוצות זמינות עבורך, מוזמנ/ת לעקוב ולהתעדכן.'}
            </p>
        </div>
      ) : (
        <GroupUnregisteredCard groups={availableGroups} />
      )}
    </div>
  );
}