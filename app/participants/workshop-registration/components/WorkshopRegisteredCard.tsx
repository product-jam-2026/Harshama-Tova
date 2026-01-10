'use client';

import { formatScheduleForWorkshop } from '@/lib/utils/date-utils';
import { unregisterFromWorkshop } from '@/app/participants/workshop-registration/actions';
import { useRouter } from 'next/navigation';
import { confirmAndExecute } from '@/lib/utils/toast-utils';
import { useState, useEffect, useRef } from 'react';
import { generateSingleEventICS, downloadICS } from '@/lib/utils/calendar-utils';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Button from '@/components/buttons/Button';
import { useGenderText } from '@/components/providers/GenderProvider';
import { COMMUNITY_STATUSES } from '@/lib/constants';
import styles from '@/app/participants/components/ParticipantsCards.module.css';


interface WorkshopData {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  mentor: string;
  date: string;
  meeting_day: number;
  meeting_time: string;
  community_status: Array<string>;
}

interface WorkshopRegisteredProps {
  workshops: WorkshopData[];
}

export default function WorkshopRegisteredCard({ workshops }: WorkshopRegisteredProps) {
  const router = useRouter();
  const gt = useGenderText();
  const [expandedWorkshops, setExpandedWorkshops] = useState<Set<string>>(new Set());
  const [needsReadMore, setNeedsReadMore] = useState<Set<string>>(new Set());
  const descriptionRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({});
  const [isMounted, setIsMounted] = useState(false);

  const getCommunityStatusLabels = (statuses: Array<string>) => {
    if (statuses.length === COMMUNITY_STATUSES.length || statuses.length === 0) {
      return 'כולם';
    }
    return statuses
      .map(status => {
        const found = COMMUNITY_STATUSES.find(cs => cs.value === status);
        return found ? found.label : status;
      })
      .join(', ');
  };

  useEffect(() => {
    setIsMounted(true);

    const needsExpansion = new Set<string>();
    workshops.forEach(workshop => {
      const element = descriptionRefs.current[workshop.id];
      if (element && element.scrollHeight > element.clientHeight + 1) {
        needsExpansion.add(workshop.id);
      }
    });
    setNeedsReadMore(needsExpansion);
  }, [workshops]);

  const toggleExpanded = (workshopId: string) => {
    setExpandedWorkshops(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workshopId)) {
        newSet.delete(workshopId);
      } else {
        newSet.add(workshopId);
      }
      return newSet;
    });
  };

  const handleUnregister = async (workshopId: string) => {
    await confirmAndExecute({
      confirmMessage: `האם את/ה בטוח/ה שברצונך לבטל את ההרשמה?`,
      action: () => unregisterFromWorkshop(workshopId),
      successMessage: 'ההרשמה בוטלה בהצלחה',
      errorMessage: 'שגיאה בביטול ההרשמה',
      onSuccess: () => router.refresh()
    });
  };

  const handleAddToCalendar = (workshop: WorkshopData) => {
    const icsContent = generateSingleEventICS({
      title: workshop.name,
      description: `${workshop.description}\n\nמנחה: ${workshop.mentor}`,
      startDate: new Date(workshop.date),
      startTime: workshop.meeting_time,
      duration: 60
    });
    
    downloadICS(icsContent, `${workshop.name.replace(/\s+/g, '-')}`);
  };

  return (
    <div className={styles.container}>
      {workshops.map((workshop) => (
        <div key={workshop.id} className={styles.wrapper}>
          
          {/* Workshop Card */}
          <div className={styles.card} style={{ backgroundImage: workshop.image_url ? `url(${workshop.image_url})` : 'none' }}>
            
            <div className={styles.meetingDetails}>
              <div className={styles.meetingTime}>
                <div>{new Date(workshop.date).toLocaleDateString('he-IL')} </div>
                <div>{formatScheduleForWorkshop(workshop.meeting_day, workshop.meeting_time)}</div>
              </div>
              <div>
                <div className={styles.host}>{workshop.mentor}</div>
              </div>
            </div>
            
            <div>
              <div className={styles.textInfo}>
                <h2 className={styles.title}>{workshop.name}</h2>
                <strong> מתאים ל{getCommunityStatusLabels(workshop.community_status)}</strong>
                <p 
                  ref={(el) => (descriptionRefs.current[workshop.id] = el)}
                  className={`${styles.description} ${expandedWorkshops.has(workshop.id) ? styles.expanded : styles.clamped}`}
                >
                  {workshop.description}
                </p>
                {needsReadMore.has(workshop.id) && (
                  <button
                    onClick={() => toggleExpanded(workshop.id)}
                    className={styles.readMoreButton}
                  >
                    {expandedWorkshops.has(workshop.id) ? gt('קרא/י פחות') : gt('קרא/י עוד')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.externalActions}>
            <Button 
              variant="primary" 
              size="md" 
              onClick={() => handleUnregister(workshop.id)}
            >
              בטל/י הרשמה
            </Button>

            <Button
              variant="secondary-light"
              size="md"
              onClick={() => handleAddToCalendar(workshop)}
              icon={isMounted ? <CalendarMonthIcon fontSize="small" /> : undefined}
            >
              הוספ/י ליומן
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}