'use client';

import { registerToGroup } from '@/app/participants/group-registration/actions';
import { formatSchedule } from '@/lib/utils/date-utils';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { useGenderText } from '@/components/providers/GenderProvider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Button from '@/components/buttons/Button';
import { COMMUNITY_STATUSES } from '@/lib/constants';
import styles from '@/app/participants/components/ParticipantsCards.module.css';
import { showThankYouToast } from '@/lib/utils/toast-utils';

interface GroupData {
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
  meetings_count: number;
}

interface GroupUnregisteredProps {
  groups: GroupData[];
}

export default function GroupUnregisteredCard({ groups }: GroupUnregisteredProps) {
  const gt = useGenderText();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
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
    groups.forEach(group => {
      const element = descriptionRefs.current[group.id];
      if (element && element.scrollHeight > element.clientHeight + 1) {
        needsExpansion.add(group.id);
      }
    });
    setNeedsReadMore(needsExpansion);
  }, [groups]);

  const handleExpand = (groupId: string) => setExpandedGroup(groupId);
  const handleCollapse = () => setExpandedGroup(null);

  const handleRegistration = async (groupId: string) => {
    // Show pre-confirmation toast
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.custom((t) => (
        <div className="toast-container">
          <h3 className="toast-confirm-message">האם את.ה בטוח.ה שברצונך להרשם לקבוצה זו?</h3>
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
                המשכ/י
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

    const result = await registerToGroup(groupId, comment || undefined);
    
    if (result.success) {
      showThankYouToast({ message: 'הרישום בוצע בהצלחה!', paragraph: 'הבקשה נשלחה לצוות וממתינה לאישור', buttonText: 'תודה :)' });
        } else {
      toast.error('שגיאה בהרשמה: ' + (result.error || 'נסה/י שוב מאוחר יותר'));
    }
  };

  return (
    <div className={styles.container}>
      {groups.map((group) => {
        const isExpanded = expandedGroup === group.id;
        return (
          <div key={group.id} className={styles.wrapper}>
            <div
              className={styles.card}
              style={{
                backgroundImage: group.image_url ? `url(${group.image_url})` : 'var(--group-color)',
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
                    onClick={() => handleRegistration(group.id)}
                    className={styles.unregisterButton}
                  >
                    הירשמ/י לקבוצה
                  </Button>
                </div>
              )}
              <div
                className={isExpanded ? `${styles.bottomSection} ${styles.expandedOverlay}` : styles.bottomSection}
              >
                <div className={styles.textInfo}>
                  <h2 className={styles.title}>{group.name}</h2>
                  <p className={styles.crowd}>מיועד ל{getCommunityStatusLabels(group.community_status)} • {group.meetings_count} מפגשים</p>
                  <p
                    ref={(el) => (descriptionRefs.current[group.id] = el)}
                    className={
                      isExpanded
                        ? `${styles.description} ${styles.expanded}`
                        : `${styles.description} ${styles.clamped}`
                    }
                  >
                    {group.description}
                  </p>
                  {!isExpanded && needsReadMore.has(group.id) && (
                    <button
                      onClick={() => handleExpand(group.id)}
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
                              const d = new Date(group.date);
                              const day = d.getDate().toString().padStart(2, '0');
                              const month = (d.getMonth() + 1).toString().padStart(2, '0');
                              return `${day}/${month}`;
                            })()
                          }
                        </div>
                      </div>
                      <div className={styles.meetingTime}>
                        <img src="/icons/timeIcon.svg" alt="Clock Icon" className={styles.infoIcon} />
                        {formatSchedule(group.meeting_day, group.meeting_time)}
                      </div>
                    </div>
                    <div className={styles.row2}>
                      <div className={styles.host}>
                        <img src="/icons/mentor-icon.svg" alt="Host Icon" className={styles.infoIcon} />
                        <div className={styles.hostText}>{group.mentor}</div>
                      </div>
                      <div className={styles.participantCount}>
                        <img src="/icons/participantsIcon.svg" alt="Participants Icon" className={styles.participantsIcon} />
                        {typeof group.registeredCount === 'number' && typeof group.max_participants === 'number' ? (
                          <span>
                            {group.max_participants} / {group.registeredCount}
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
                              const d = new Date(group.date);
                              const day = d.getDate().toString().padStart(2, '0');
                              const month = (d.getMonth() + 1).toString().padStart(2, '0');
                              return `${day}/${month}`;
                            })()
                          }
                        </div>
                      </div>
                      <div className={styles.meetingTime}>
                        <img src="/icons/timeIcon.svg" alt="Clock Icon" className={styles.infoIcon} />
                        {formatSchedule(group.meeting_day, group.meeting_time)}
                      </div>
                    </div>
                    <div className={styles.row2}>
                      <div className={styles.host}>
                        <img src="/icons/mentor-icon.svg" alt="host icon" className={styles.infoIcon} />
                        <div className={styles.hostText}>{group.mentor}</div>
                      </div>
                      <div className={styles.participantCount}>
                        <img src="/icons/participantsIcon.svg" alt="Participants Icon" className={styles.participantsIcon} />
                        {typeof group.registeredCount === 'number' && typeof group.max_participants === 'number' ? (
                          <span>
                            {group.max_participants} / {group.registeredCount}
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