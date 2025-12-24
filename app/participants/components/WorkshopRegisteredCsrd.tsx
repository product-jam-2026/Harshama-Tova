'use client';

import { formatSchedule } from '@/lib/date-utils';
import { unregisterFromWorkshop } from '@/app/participants/workshop-registration/actions';
import { useRouter } from 'next/navigation';
import { confirmAndExecute } from '@/lib/toast-utils';
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

interface WorkshopRegisteredProps {
  workshops: WorkshopData[];
}

export default function WorkshopRegisteredCard({ workshops }: WorkshopRegisteredProps) {
  const router = useRouter();
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

  const handleUnregister = async (workshopId: string) => {
    await confirmAndExecute({
      confirmMessage: 'האם את/ה בטוח/ה שברצונך לבטל את ההרשמה?',
      action: () => unregisterFromWorkshop(workshopId),
      successMessage: 'ההרשמה בוטלה בהצלחה',
      errorMessage: 'שגיאה בביטול ההרשמה',
      onSuccess: () => router.refresh()
    });
  };

  return (
    <div>
      {workshops.map((workshop) => (
        <div key={workshop.id} className="group-card">
          <div className="meeting-details">
            <div className="meeting-time">
              <div className="group-start-date"> החל מה-{new Date(workshop.date).toLocaleDateString('he-IL')} </div>
              <div className="group-meeting-time">{formatSchedule(workshop.meeting_day, workshop.meeting_time)}</div>
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
          <button onClick={() => handleUnregister(workshop.id)}>ביטול הרשמה</button>
        </div>
      ))}
    </div>
  );
}


