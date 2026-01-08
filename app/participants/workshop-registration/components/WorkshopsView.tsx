'use client';

import { useState, useMemo } from 'react';
import WorkshopUnregisteredCard from './WorkshopUnregisteredCard';
import Button from '@/components/buttons/Button';

interface WorkshopsViewProps {
  workshops: any[];
  userWorkshopRegs: any[];
  userStatuses: string[];
}

export default function WorkshopsView({ workshops, userWorkshopRegs, userStatuses }: WorkshopsViewProps) {
  // Local state for the filter button
  const [showAll, setShowAll] = useState(false);

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

       // Matching Logic
       let isMatch = true;
       if (!showAll && workshop.community_status?.length > 0 && userStatuses?.length > 0) {
          isMatch = userStatuses.some(status => workshop.community_status.includes(status));
       }

       return isOpen && isNotRegistered && isFuture && isMatch;
    });
  }, [workshops, userWorkshopRegs, userStatuses, showAll]);

  return (
    <div>
       <div>
          <Button
              className="filter-button"
              variant="secondary-light"
              size="sm"
              onClick={() => setShowAll(!showAll)}
          >
              {showAll ? 'הצג סדנאות המתאימות עבורי' : 'הצג את כל הסדנאות'}
          </Button>
       </div>

      {availableWorkshops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
              <p className="dark-texts">
                  {showAll 
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