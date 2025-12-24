'use client';

import { registerToWorkshop } from '@/app/participants/workshop-registration/actions';
import { formatScheduleForWorkshop } from '@/lib/date-utils';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';

interface WorkshopData {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  mentor: string;
  date: string;
  meeting_day: number;
  meeting_time: string;

}


interface WorkshopUnregisteredProps {
  workshops: WorkshopData[];
}


export default function WorkshopUnregisteredCard({ workshops }: WorkshopUnregisteredProps) {
  const [expandedWorkshops, setExpandedWorkshops] = useState<Set<string>>(new Set());
  const [needsReadMore, setNeedsReadMore] = useState<Set<string>>(new Set());
  const descriptionRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({});

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
    // בקש הערה מהמשתמש דרך toast
    const comment = await new Promise<string>((resolve) => {
      let inputValue = '';
      const toastId = toast(
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
                  toast.dismiss(t.id);
                  resolve('');
                }}
                className="toast-button toast-button-cancel"
              >
                דלג
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(inputValue);
                }}
                className="toast-button toast-button-confirm"
              >
                המשך
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
      toast.error('שגיאה בהרשמה: ' + (result.error || 'נסו שוב מאוחר יותר'));
    }
  };


  return (
    <div>
      {workshops.map((workshop) => (
        <div key={workshop.id} className="group-card">
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
                  {expandedWorkshops.has(workshop.id) ? 'קרא פחות' : 'קרא עוד'}
                </button>
              )}
            </div>
          </div>
          <button 
            className="register-button" 
            onClick={() => handleRegistration(workshop.id)}
          >
            הרשמה לסדנה
          </button>
        </div>
      ))}
    </div>
  );
}