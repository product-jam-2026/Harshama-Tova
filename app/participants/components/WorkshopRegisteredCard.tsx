'use client';

import { formatScheduleForWorkshop } from '@/lib/date-utils';
import { unregisterFromWorkshop } from '@/app/participants/workshop-registration/actions';
import { useRouter } from 'next/navigation';
import { confirmAndExecute } from '@/lib/toast-utils';
import { useState, useEffect, useRef } from 'react';
import { generateSingleEventICS, downloadICS } from '@/lib/calendar-utils';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Button from '@/components/buttons/Button';
import { useGenderText } from '@/components/providers/GenderProvider';
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

interface WorkshopRegisteredProps {
  workshops: WorkshopData[];
}

export default function WorkshopRegisteredCard({ workshops }: WorkshopRegisteredProps) {
  const router = useRouter();
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

  // State to track if component is mounted on client to fix Hydration Error
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true only on client side
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
      duration: 60 // 1 hour default
    });
    
    downloadICS(icsContent, `${workshop.name.replace(/\s+/g, '-')}`);
  };

  return (
    <div>
      {workshops.map((workshop) => (
        <div key={workshop.id} className="group-card" style={{ backgroundImage: workshop.image_url ? `url(${workshop.image_url})` : 'none' }}>
          <div className="meeting-details">
            <div className="meeting-time">
              <div className="group-start-date">{new Date(workshop.date).toLocaleDateString('he-IL')} </div>
              <div className="group-meeting-time">{formatScheduleForWorkshop(workshop.meeting_day, workshop.meeting_time)}</div>
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
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={() => handleAddToCalendar(workshop)}>
              {/* Render CalendarMonthIcon only when mounted to prevent hydration error */}
              {isMounted && <CalendarMonthIcon fontSize="small" />}
              הוספ/י ליומן
            </Button>
            <Button onClick={() => handleUnregister(workshop.id)}>בטל/י הרשמה</Button>
          </div>
        </div>
      ))}
    </div>
  );
}