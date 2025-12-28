'use client';

import { registerToGroup } from '@/app/participants/group-registration/actions';
import { formatSchedule } from '@/lib/date-utils';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { useGenderText } from '@/components/GenderProvider';
import { COMMUNITY_STATUSES } from '@/lib/constants';
import Button from '@/components/buttons/Button';

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

}


interface GroupUnregisteredProps {
  groups: GroupData[];
}


export default function GroupUnregisteredCard({ groups }: GroupUnregisteredProps) {
  const gt = useGenderText();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [needsReadMore, setNeedsReadMore] = useState<Set<string>>(new Set());
  const descriptionRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({});

const getCommunityStatusLabels = (statuses: Array<string>) => {
  if (statuses.length === COMMUNITY_STATUSES.length || statuses.length ===0) {
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

  const handleRegistration = async (groupId: string) => {
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

    const result = await registerToGroup(groupId, comment || undefined);
    
    if (result.success) {
      toast.success('בקשתך להירשם לקבוצה עברה לצוות הניהול, ייצרו עמך קשר בהקדם, תודה!');
    } else {
      toast.error('שגיאה בהרשמה: ' + (result.error || 'נסה/י שוב מאוחר יותר'));
    }
  };




  return (
    <div>
      {groups.map((group) => (
        <div key={group.id} className="group-card" style={{ backgroundImage: group.image_url ? `url(${group.image_url})` : 'none' }}>
          <div className="meeting-details">
            <div className="meeting-time">
              <div className="group-start-date">החל מה-{new Date(group.date).toLocaleDateString('he-IL')}</div>
              <div className="group-time">{formatSchedule(group.meeting_day, group.meeting_time)}</div>
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
                  {expandedGroups.has(group.id) ? gt('קרא/י פחות') : gt('קרא/י עוד')}
                </button>
              )}
            </div>
          </div>
          <Button 
            onClick={() => handleRegistration(group.id)}
          >
            הירשמ/י לקבוצה
          </Button>
        </div>
      ))}
    </div>
  );
}