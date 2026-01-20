
'use client';

import { formatScheduleForWorkshop } from '@/lib/utils/date-utils';
import { unregisterFromWorkshop } from '@/app/participants/workshop-registration/actions';
import { useRouter } from 'next/navigation';
import { showUnregisterConfirmToast } from '@/lib/utils/toast-utils';
import { useState, useEffect, useRef } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { generateSingleEventICS, downloadICS } from '@/lib/utils/calendar-utils';
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
  max_participants?: number;
  registeredCount?: number;
}

interface WorkshopRegisteredProps {
  workshops: WorkshopData[];
}

export default function WorkshopRegisteredCard({ workshops }: WorkshopRegisteredProps) {
  const router = useRouter();
  const gt = useGenderText();
  const [expandedWorkshop, setExpandedWorkshop] = useState<string | null>(null);
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

  const handleExpand = (workshopId: string) => setExpandedWorkshop(workshopId);
  const handleCollapse = () => setExpandedWorkshop(null);

  const handleUnregister = async (workshopId: string) => {
    await showUnregisterConfirmToast({
      confirmMessage: `האם את.ה רוצה לבטל את הרישום לסדנה זו?`,
      action: () => unregisterFromWorkshop(workshopId),
      successMessage: 'ההרשמה בוטלה בהצלחה',
      errorMessage: 'שגיאה בביטול ההרשמה',
      onSuccess: () => router.refresh()
    });
  };
    // Restore add to calendar logic
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
      {workshops.map((workshop) => {
        const isExpanded = expandedWorkshop === workshop.id;
        return (
          <div key={workshop.id} className={styles.wrapper}>
            <div
              className={styles.workshopCard}
              style={{
                backgroundImage: workshop.image_url ? `url(${workshop.image_url})` : 'none',
                minHeight: isExpanded ? undefined : '500px',
                zIndex: isExpanded ? 10 : undefined,
                boxShadow: isExpanded ? '0 4px 32px 0 rgba(0,0,0,0.18)' : undefined,
                position: 'relative',
              }}
            >
              {!isExpanded && (
                <div className={styles.Actions}>
                  <Button
                    variant="bright"
                    onClick={() => handleUnregister(workshop.id)}
                    className={styles.unregisterButton}
                  >
                    ביטול הרשמה
                  </Button>
                  <div className={styles.topRight}>
                    <button
                      type="button"
                      className={styles.whatsappLink}
                      onClick={() => handleAddToCalendar(workshop)}
                      title="הוספה ליומן"
                    >
                      <img src="/icons/calenderIcon-black.svg" alt="Calendar Icon" className={styles.calendarIcon} />
                    </button>
                  </div>
                </div>
              )}
              <div
                className={isExpanded ? `${styles.bottomSection} ${styles.expandedOverlay}` : styles.bottomSection}
              >
                <div className={styles.textInfo}>
                  <h2 className={styles.title}>{workshop.name}</h2>
                  <p className={styles.crowd}>מיועד ל{getCommunityStatusLabels(workshop.community_status)}{typeof workshop.max_participants === 'number' && typeof workshop.registeredCount === 'number' ? '' : ''}</p>
                  <p
                    ref={(el) => (descriptionRefs.current[workshop.id] = el)}
                    className={
                      isExpanded
                        ? `${styles.description} ${styles.expanded}`
                        : `${styles.description} ${styles.clamped}`
                    }
                  >
                    {workshop.description}
                  </p>
                  {!isExpanded && needsReadMore.has(workshop.id) && (
                    <button
                      onClick={() => handleExpand(workshop.id)}
                      className={styles.readMoreButton}
                    >
                      קרא.י עוד
                    </button>
                  )}
                </div>
                {isExpanded ? (
                  <>
                    <div className={styles.row1}>
                      <div className={styles.startDate}>
                        <img src="/icons/calenderIcon.svg" alt="Calendar Icon" className={styles.infoIcon} />
                        <div>
                          מתחיל ב- 
                          {
                            (() => {
                              const d = new Date(workshop.date);
                              const day = d.getDate().toString().padStart(2, '0');
                              const month = (d.getMonth() + 1).toString().padStart(2, '0');
                              return `${day}/${month}`;
                            })()
                          }
                        </div>
                      </div>
                      <div className={styles.meetingTime}>
                        <img src="/icons/timeIcon.svg" alt="Clock Icon" className={styles.infoIcon} />
                        {formatScheduleForWorkshop(workshop.meeting_day, workshop.meeting_time)}
                      </div>
                    </div>
                    <div className={styles.row2}>
                      <div className={styles.host}>
                        <img src="/icons/mentor-icon.svg" alt="Host Icon" className={styles.infoIcon} />
                        <div className={styles.hostText}>{workshop.mentor}</div>
                      </div>
                      <div className={styles.participantCount}>
                        <img src="/icons/participantsIcon.svg" alt="Participants Icon" className={styles.participantsIcon} />
                        {typeof workshop.registeredCount === 'number' && typeof workshop.max_participants === 'number' ? (
                          <span>
                            {workshop.max_participants} / {workshop.registeredCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className={styles.collapseButtonContainer}>
                      <button
                        onClick={handleCollapse}
                        className={styles.collapseButton}
                        aria-label="סגור תיאור"
                      >
                        <ExpandMoreIcon/>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.row1}>
                      <div className={styles.startDate}>
                        <img src="/icons/calenderIcon.svg" alt="Calendar Icon" className={styles.infoIcon} />
                        <div>
                          מתחיל ב-                           {
                            (() => {
                              const d = new Date(workshop.date);
                              const day = d.getDate().toString().padStart(2, '0');
                              const month = (d.getMonth() + 1).toString().padStart(2, '0');
                              return `${day}/${month}`;
                            })()
                          }
                        </div>
                      </div>
                      <div className={styles.meetingTime}>
                        <img src="/icons/timeIcon.svg" alt="Clock Icon" className={styles.infoIcon} />
                        {formatScheduleForWorkshop(workshop.meeting_day, workshop.meeting_time)}
                      </div>
                    </div>
                    <div className={styles.row2}>
                      <div className={styles.host}>
                        <img src="/icons/mentor-icon.svg" alt="host icon" className={styles.infoIcon} />
                        <div className={styles.hostText}>{workshop.mentor}</div>
                      </div>
                      <div className={styles.participantCount}>
                        <img src="/icons/participantsIcon.svg" alt="Participants Icon" className={styles.participantsIcon} />
                        {typeof workshop.registeredCount === 'number' && typeof workshop.max_participants === 'number' ? (
                          <span>
                            {workshop.max_participants} / {workshop.registeredCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}