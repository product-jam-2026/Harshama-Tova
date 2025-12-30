'use client';

import { formatSchedule } from '@/lib/date-utils';
import { unregisterFromGroup } from '@/app/participants/group-registration/actions';
import { useRouter } from 'next/navigation';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { confirmAndExecute } from '@/lib/toast-utils';
import { useState, useEffect, useRef } from 'react';
import { generateRecurringEventICS, downloadICS } from '@/lib/calendar-utils';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Button from '@/components/buttons/Button';
import { useGenderText } from '@/components/providers/GenderProvider';
import { COMMUNITY_STATUSES } from '@/lib/constants';

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
}

interface GroupRegisteredProps {
  groups: GroupData[];
}

export default function GroupRegisteredCard({ groups }: GroupRegisteredProps) {
  const router = useRouter();
  const gt = useGenderText();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
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

  const toggleExpanded = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleUnregister = async (groupId: string) => {
    await confirmAndExecute({
      confirmMessage: `האם את/ה בטוח/ה שברצונך לבטל את ההרשמה?`,
      action: () => unregisterFromGroup(groupId),
      successMessage: 'ההרשמה בוטלה בהצלחה',
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
    <div className="groups-container">
      {groups.map((group) => (
        <div key={group.id} className="group-wrapper" style={{ marginBottom: '24px' }}>
          {/* כרטיסיית הקבוצה - ללא פעולות בתחתיתה */}
          <div className="group-card" style={{ backgroundImage: group.image_url ? `url(${group.image_url})` : 'none' }}>
            <div className="meeting-details">
              <div className="meeting-time">
                <div className="group-start-date"> החל מה-{new Date(group.date).toLocaleDateString('he-IL')} </div>
                <div className="group-meeting-time">{formatSchedule(group.meeting_day, group.meeting_time)}</div>
              </div>
              <div className="meeting-people-details">
                <div className="group-host">{group.mentor}</div>
              </div>
            </div>
            
            <div className="group-info">
              <div className="group-text-info">
                <h2 className="group-title">{group.name}</h2>
                <strong> מתאים ל{getCommunityStatusLabels(group.community_status)}</strong>
                <p
                  ref={(el) => (descriptionRefs.current[group.id] = el)}
                  className={`group-description ${expandedGroups.has(group.id) ? 'expanded' : 'clamped'}`}
                >
                  {group.description}
                </p>
                {needsReadMore.has(group.id) && (
                  <button
                    onClick={() => toggleExpanded(group.id)}
                    className="read-more-button"
                  >
                    {expandedGroups.has(group.id) ? gt('קרא/י פחות') : gt('קרא/י עוד')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="group-external-actions" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginTop: '12px' 
          }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleUnregister(group.id)}
            >
              בטל/י הרשמה
            </Button>

            <Button
              variant="secondary-light"
              size="md"
              onClick={() => handleAddToCalendar(group)}
              icon={isMounted ? <CalendarMonthIcon fontSize="small" /> : undefined}
            >
              הוספ.י ליומן
            </Button>

            {isMounted && group.whatsapp_link && (
              <a
                href={group.whatsapp_link}
                className="whatsappLink"
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
      ))}
    </div>
  );
}