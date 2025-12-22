'use client';

import { registerToGroup } from '@/app/participants/group-registration/actions';
import { formatDate, formatSchedule } from '@/lib/date-utils';

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
  
  const handleRegistration = async (groupId: string) => {
    const comment = prompt("משהו שחשוב לך שנדע? (אופציונלי)");
    const result = await registerToGroup(groupId, comment || undefined);
    
    if (result.success) {
        alert('בקשתך להירשם לקבוצה עברה לצוות הניהול, ייצרו עמך קשר בהקדם, תודה!');
    } else {
      alert('שגיאה בהרשמה: ' + (result.error || 'נסו שוב מאוחר יותר'));
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
              <p className="group-description">{group.description}</p>
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