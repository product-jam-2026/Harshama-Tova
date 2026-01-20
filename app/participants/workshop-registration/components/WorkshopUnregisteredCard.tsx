'use client';

import { registerToWorkshop } from '@/app/participants/workshop-registration/actions';
import { formatScheduleForWorkshop } from '@/lib/utils/date-utils';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { useGenderText } from '@/components/providers/GenderProvider';
import { COMMUNITY_STATUSES } from '@/lib/constants';
import Button from '@/components/buttons/Button';
import styles from '@/app/participants/components/ParticipantsCards.module.css';
import { showThankYouToast } from '@/lib/utils/toast-utils';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

interface WorkshopUnregisteredProps {
  workshops: WorkshopData[];
}

export default function WorkshopUnregisteredCard({ workshops }: WorkshopUnregisteredProps) {
  const gt = useGenderText();
  const [expandedWorkshop, setExpandedWorkshop] = useState<string | null>(null);
  const [needsReadMore, setNeedsReadMore] = useState<Set<string>>(new Set());
  const descriptionRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({});

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

  const handleRegistration = async (workshopId: string) => {
    // Show pre-confirmation toast
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.custom((t) => (
        <div className="toast-container">
          <h3 className="toast-confirm-message">האם את.ה בטוח.ה שברצונך להירשם לסדנה זו?</h3>
          <div className="toast-confirm-buttons">
            <Button
              variant="secondary2"
              onClick={() => {
                toast.dismiss(t);
                resolve(false);
              }}
              className="toast-confirm-cancel"
            >
              חזור
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                toast.dismiss(t);
                resolve(true);
              }}
              className="toast-confirm-confirm"
            >
              אני רוצה להירשם
            </Button>
          </div>
        </div>
      ), { duration: Infinity });
    });
    if (!confirmed) return;

    // Proceed to comment toast
    const comment = await new Promise<string | null>((resolve) => {
      let inputValue = '';
      toast.custom(
        (t) => (
          <div className="toast-container">
            <p className="toast-prompt-message">משהו שחשוב לך שנדע?</p>
            <input
              type="text"
              onChange={(e) => inputValue = e.target.value}
              placeholder="אנחנו כאן לכל דבר..."
              className="toast-prompt-input"
            />
            <div className="toast-confirm-buttons">
              <Button
                variant="secondary2"
                onClick={() => {
                  toast.dismiss(t);
                  resolve('');
                }}
                className="toast-button toast-button-cancel"
              >
                דלג/י
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  toast.dismiss(t);
                  resolve(inputValue);
                }}
                className="toast-button toast-button-confirm"
              >
                שלח/י
              </Button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    // If user clicked cancel, don't proceed with registration
    if (comment === null) {
      return;
    }

    const result = await registerToWorkshop(workshopId, comment || undefined);
    
    if (result.success) {
      showThankYouToast({ message: 'נרשמת בהצלחה לסדנה!\nמחכים לראותך', buttonText: 'תודה :)' });
    } else {
      toast.error('שגיאה בהרשמה: ' + (result.error || 'נסה/י שוב מאוחר יותר'));
    }
  };

  return (
    <div className={styles.container}>
      {workshops.map((workshop) => {
        const isExpanded = expandedWorkshop === workshop.id;
        return (
          <div key={workshop.id} className={styles.wrapper}>
            <div
              className={styles.card}
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
                    onClick={() => handleRegistration(workshop.id)}
                    className={styles.unregisterButton}
                  >
                    הירשמ/י לסדנה
                  </Button>
                </div>
              )}
              <div
                className={isExpanded ? `${styles.bottomSection} ${styles.expandedOverlay}` : styles.bottomSection}
              >
                <div className={styles.textInfo}>
                  <h2 className={styles.title}>{workshop.name}</h2>
                  <p className={styles.crowd}>מיועד ל{getCommunityStatusLabels(workshop.community_status)}</p>
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
                          מתחיל <br/> ב- 
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
                          מתחיל <br/> ב- 
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