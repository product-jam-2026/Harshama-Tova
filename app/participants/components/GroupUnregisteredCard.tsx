'use client';

import { registerToGroup } from '@/app/participants/group-registration/actions';
import { formatSchedule } from '@/lib/date-utils';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';

interface GroupData {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  mentor: string;
  date: string;
  meeting_day: number;
  meeting_time: string;

}


interface GroupUnregisteredProps {
  groups: GroupData[];
}


export default function GroupUnregisteredCard({ groups }: GroupUnregisteredProps) {
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

  const handleRegistration = async (groupId: string) => {
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

    const result = await registerToGroup(groupId, comment || undefined);
    
    if (result.success) {
      toast.success('בקשתך להירשם לקבוצה עברה לצוות הניהול, ייצרו עמך קשר בהקדם, תודה!');
    } else {
      toast.error('שגיאה בהרשמה: ' + (result.error || 'נסו שוב מאוחר יותר'));
    }
  };




  return (
    <div>
      {groups.map((group) => (
        <div key={group.id} className="group-card">
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
          </div>
          <button 
            className="register-button" 
            onClick={() => handleRegistration(group.id)}
          >
            הרשמה לקבוצה
          </button>
        </div>
      ))}
    </div>
  );
}