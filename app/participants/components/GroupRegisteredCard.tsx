'use client';

import { formatSchedule } from '@/lib/date-utils';
import { unregisterFromGroup } from '@/app/participants/group-registration/actions';
import { useRouter } from 'next/navigation';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { confirmAndExecute } from '@/lib/toast-utils';
import { useState, useEffect, useRef } from 'react';

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
}

interface GroupRegisteredProps {
  groups: GroupData[];
}

export default function GroupRegisteredCard({ groups }: GroupRegisteredProps) {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [needsReadMore, setNeedsReadMore] = useState<Set<string>>(new Set());
  const descriptionRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({});

  useEffect(() => {
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
      confirmMessage: 'האם את/ה בטוח/ה שברצונך לבטל את ההרשמה?',
      action: () => unregisterFromGroup(groupId),
      successMessage: 'ההרשמה בוטלה בהצלחה',
      errorMessage: 'שגיאה בביטול ההרשמה',
      onSuccess: () => router.refresh()
    });
  };

  return (
    <div>
      {groups.map((group) => (
        <div key={group.id} className="group-card">
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
              <p 
                ref={(el) => descriptionRefs.current[group.id] = el}
                className={`group-description ${expandedGroups.has(group.id) ? 'expanded' : 'clamped'}`}
              >
                {group.description}
              </p>
              {needsReadMore.has(group.id) && (
                <button
                  onClick={() => toggleExpanded(group.id)}
                  className="read-more-button"
                >
                  {expandedGroups.has(group.id) ? 'קרא פחות' : 'קרא עוד'}
                </button>
              )}
            </div>
            <a href={group.whatsapp_link || '#'} className="whatsappLink">
              <WhatsAppIcon />
              <p>הצטרפו לקבוצת הווטסאפ</p>
            </a>
          </div>
          <button onClick={() => handleUnregister(group.id)}>ביטול הרשמה</button>
        </div>
      ))}
    </div>
  );
}


