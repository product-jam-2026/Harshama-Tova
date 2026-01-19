'use client';

import { formatSchedule } from '@/lib/utils/date-utils';
import { unregisterFromGroup } from '@/app/participants/group-registration/actions';
import { useRouter } from 'next/navigation';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {showUnregisterConfirmToast } from '@/lib/utils/toast-utils';
import { useState, useEffect, useRef } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { generateRecurringEventICS, downloadICS } from '@/lib/utils/calendar-utils';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import Button from '@/components/buttons/Button';
import { useGenderText } from '@/components/providers/GenderProvider';
import { COMMUNITY_STATUSES } from '@/lib/constants';
import styles from '@/app/participants/components/ParticipantsCards.module.css';

interface GroupData {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  mentor: string;
  date: string;
  whatsapp_link: string | null;
  meeting_day: number;
  meeting_time: string;
  meetings_count: number;
  community_status: Array<string>;
  max_participants?: number;
  registeredCount?: number;
}

interface GroupRegisteredProps {
  groups: GroupData[];
}

export default function GroupRegisteredCard({ groups }: GroupRegisteredProps) {
  const router = useRouter();
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

  const handleUnregister = async (groupId: string) => {
    await showUnregisterConfirmToast({
      confirmMessage: `האם את.ה רוצה לבטל את הרישום לקבוצה זו?`,
      action: () => unregisterFromGroup(groupId),
      successMessage: 'הרשמתך בוטלה בהצלחה',
      errorMessage: 'שגיאה בביטול ההרשמה',
      onSuccess: () => router.refresh()
    });
  };

  const handleAddToCalendar = (group: GroupData) => {
    const icsContent = generateRecurringEventICS({
      title: group.name,
      description: `${group.description}\n\nמנחה: ${group.mentor}${group.whatsapp_link ? `\nקישור לווטסאפ: ${group.whatsapp_link}` : ''}`,
      startDate: new Date(group.date),
      startTime: group.meeting_time,
      duration: 60,
      weekday: group.meeting_day,
      count: group.meetings_count
    });

    downloadICS(icsContent, `${group.name.replace(/\s+/g, '-')}`);
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
                backgroundImage: group.image_url ? `url(${group.image_url})` : 'none',
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
                    onClick={() => handleUnregister(group.id)}
                    className={styles.unregisterButton}
                  >
                    ביטול הרשמה
                  </Button>
                  <div className={styles.topRight}>
                    <button
                      type="button"
                      className={styles.whatsappLink}
                      onClick={() => handleAddToCalendar(group)}
                      title="הוספה ליומן"
                    >
                      <img src="/icons/calenderIcon-black.svg" alt="Calendar Icon" className={styles.calendarIcon} />
                    </button>
                    {isMounted && group.whatsapp_link && (
                      <a
                        href={group.whatsapp_link}
                        className={styles.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        title="הצטרפות לקבוצת הווטסאפ"
                      >
                        <WhatsAppIcon />
                      </a>
                    )}
                  </div>
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
                            מתחיל ב-
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
                          <img src="/icons/mentorIcon.svg" alt="Host Icon" className={styles.infoIcon} />
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
                            מתחיל ב-
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
                          <img src="/icons/mentorIcon.svg" alt="Host Icon" className={styles.infoIcon} />
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