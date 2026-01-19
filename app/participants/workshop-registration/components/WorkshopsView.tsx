'use client';

import { useState, useMemo } from 'react';
import WorkshopUnregisteredCard from './WorkshopUnregisteredCard';
import Button from '@/components/buttons/Button';
import styles from './WorkshopsView.module.css';

interface WorkshopsViewProps {
  workshops: any[];
  userWorkshopRegs: any[];
  userStatuses: string[];
}

export default function WorkshopsView({ workshops, userWorkshopRegs, userStatuses }: WorkshopsViewProps) {
  // Local state for the filter button
  const [filter, setFilter] = useState<'all' | 'mine'>('mine');

  // Filter Logic
  const availableWorkshops = useMemo(() => {
    const registeredWorkshopIds = new Set(userWorkshopRegs.map(r => r.workshop_id));
    return workshops.filter(workshop => {
      const isOpen = workshop.status === 'open';
      const isNotRegistered = !registeredWorkshopIds.has(workshop.id);
      const workshopDate = new Date(workshop.date);
      const now = new Date();
      // Check if date is in the future
      const isFuture = workshopDate >= new Date(now.setHours(0,0,0,0));
      // find available spots
      const hasSpace =
        typeof workshop.max_participants !== 'number' ||
        typeof workshop.registeredCount !== 'number' ||
        workshop.registeredCount < workshop.max_participants;

      // Matching Logic
      let isMatch = true;
      if (filter === 'mine' && workshop.community_status?.length > 0 && userStatuses?.length > 0) {
        isMatch = userStatuses.some(status => workshop.community_status.includes(status));
      }

      return isOpen && isNotRegistered && isFuture && isMatch && hasSpace;
    });
  }, [workshops, userWorkshopRegs, userStatuses, filter]);

  return (
    <div>
      <header className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>סדנאות פעילות</h3>
        <div className={styles.introRow}>
          <img src="/icons/igulim.svg" alt="" className={styles.introIcon} />
          <p className={styles.introText}>
            כאן תוכלו לראות את כל הסדנאות
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
          לכל הסדנאות
        </button>
        <button
          className={filter === 'mine' ? styles.activeFilterButton : styles.filterButton}
          onClick={() => setFilter('mine')}
        >
         סדנאות מותאמות אליי
        </button>
      </div>

      {availableWorkshops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
              <p className="dark-texts">
                  {filter === 'all' 
                      ? 'אין סדנאות זמינות להרשמה כרגע.' 
                      : 'אין כרגע סדנאות זמינות עבורך, מוזמנ/ת לעקוב ולהתעדכן.'}
              </p>
          </div>
      ) : (
          <WorkshopUnregisteredCard workshops={availableWorkshops} />
      )}
    </div>
  );
}