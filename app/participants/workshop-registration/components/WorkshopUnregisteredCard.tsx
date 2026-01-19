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
  const [expandedWorkshops, setExpandedWorkshops] = useState<Set<string>>(new Set());
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
      {workshops.map((workshop) => (
        <div key={workshop.id} className={styles.wrapper}>
          
          {/* Workshop Card */}
          <div className={styles.card} style={{ backgroundImage: workshop.image_url ? `url(${workshop.image_url})` : 'none' }}>
            <div className={styles.participantCount}>
              {typeof workshop.registeredCount === 'number' && typeof workshop.max_participants === 'number' ? (
                <span>
                   {workshop.max_participants} / {workshop.registeredCount}
                </span>
              ) : null}
            </div>
            <div className={styles.meetingDetails}>
              <div className={styles.meetingTime}>
                <div>החל מה-{new Date(workshop.date).toLocaleDateString('he-IL')}</div>
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
              onClick={() => handleRegistration(workshop.id)}
            >
              הירשמ/י לסדנה
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}