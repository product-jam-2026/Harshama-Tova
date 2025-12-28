'use client';

import { registerToWorkshop } from '@/app/participants/workshop-registration/actions';
import { formatScheduleForWorkshop } from '@/lib/date-utils';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { useGenderText } from '@/components/GenderProvider';
import { COMMUNITY_STATUSES } from '@/lib/constants';

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


interface WorkshopUnregisteredProps {
  workshops: WorkshopData[];
}


export default function WorkshopUnregisteredCard({ workshops }: WorkshopUnregisteredProps) {
  const gt = useGenderText();
  const [expandedWorkshops, setExpandedWorkshops] = useState<Set<string>>(new Set());
  const [needsReadMore, setNeedsReadMore] = useState<Set<string>>(new Set());
  const descriptionRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({});

  const getCommunityStatusLabels = (statuses: Array<string>) => {
  if (statuses.length === COMMUNITY_STATUSES.length) {
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
    const comment = await new Promise<string>((resolve) => {
      let inputValue = '';
      const toastId = toast.custom(
        (t) => (
          <div className="toast-prompt-container">
            <p className="toast-prompt-message">משהו שחשוב לך שנדע? (אופציונלי)</p>
            <input
              type="text"
              onChange={(e) => inputValue = e.target.value}
              placeholder="הערה..."
              className="toast-prompt-input"
            />
            <div className="toast-confirm-buttons">
              <button
                onClick={() => {
                  toast.dismiss(t);
                  resolve('');
                }}
                className="toast-button toast-button-cancel"
              >
                דלג/י
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t);
                  resolve(inputValue);
                }}
                className="toast-button toast-button-confirm"
              >
                המשכ/י
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    const result = await registerToWorkshop(workshopId, comment || undefined);
    
    if (result.success) {
      toast.success('נרשמת לסדנה בהצלחה, מצפים לראותך!');
    } else {
      toast.error('שגיאה בהרשמה: ' + (result.error || 'נסה/י שוב מאוחר יותר'));
    }
  };


  return (
    <div>
      {workshops.map((workshop) => (
         <div key={workshop.id} className="group-card" style={{ backgroundImage: workshop.image_url ? `url(${workshop.image_url})` : 'none' }}>
          <div className="meeting-details">
            <div className="meeting-time">
              <div className="group-start-date">{new Date(workshop.date).toLocaleDateString('he-IL')}</div>
              <div className="group-time">{formatScheduleForWorkshop(workshop.meeting_day, workshop.meeting_time)}</div>
            </div>
            <div className="meeting-people-details">
              <div className="group-host">{workshop.mentor}</div>
            </div>
          </div>
          <div className="group-info">
            <div className="group-text-info">
              <h2 className="group-title">{workshop.name}</h2>
              <strong> מתאים ל{getCommunityStatusLabels(workshop.community_status)}</strong>
              <p 
                ref={(el) => descriptionRefs.current[workshop.id] = el}
                className={`group-description ${expandedWorkshops.has(workshop.id) ? 'expanded' : 'clamped'}`}
              >
                {workshop.description}
              </p>
              {needsReadMore.has(workshop.id) && (
                <button
                  onClick={() => toggleExpanded(workshop.id)}
                  className="read-more-button"
                >
                  {expandedWorkshops.has(workshop.id) ? gt('קרא/י פחות') : gt('קרא/י עוד')}
                </button>
              )}
            </div>
          </div>
          <button 
            className="register-button" 
            onClick={() => handleRegistration(workshop.id)}
          >
            הירשמ/י לסדנה
          </button>
        </div>
      ))}
    </div>
  );
}