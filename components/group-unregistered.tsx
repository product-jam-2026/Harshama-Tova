'use client';

import { registerToGroup } from '@/app/participants/group-registration/actions';
import UserNavBar from './UserNavBar';

interface GroupData {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  mentor: string;
  date: string;
  registration_end_date: string;
  max_participants: number;
  whatsapp_link: string | null;
}

interface GroupUnregisteredProps {
  groups: GroupData[];
}

export default function GroupUnregistered({ groups }: GroupUnregisteredProps) {
  
  const handleRegistration = async (groupId: string) => {
    const comment = prompt("משהו שחשוב לך שנדע? (אופציונלי)");
    const result = await registerToGroup(groupId, comment || undefined);
    
    if (result.success) {
        alert('בקשתך להירשם לקבוצה עברה לצוות הניהול, ייצרו עמך קשר בהקדם, תודה!');
    } else {
      alert('שגיאה בהרשמה: ' + (result.error || 'נסו שוב מאוחר יותר'));
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const time = isoString.split('T')[1];
    return time ? time.substring(0, 5) : '';
  };

  return (
    <div>
      <UserNavBar />  
      {groups.map((group) => (
        <div key={group.id} className="group-card">
          <div className="meeting-details">
            <div className="meeting-time">
              <div className="group-date">{formatDate(group.date)}</div>
              <div className="group-hour">{formatTime(group.date)}</div>
            </div>
            <div className="meeting-people-details">
              <div className="group-host">{group.mentor}</div>
            </div>
          </div>
          <div className="group-info">
            {group.image_url && (
              <img 
                src={group.image_url} 
                alt={group.name}
                className="group-image"
              />
            )}
            <div className="group-text-info">
              <h2 className="group-title">{group.name}</h2>
              <p className="group-description">{group.description}</p>
              <p className="registration-deadline">
                תאריך אחרון להרשמה: {formatDate(group.registration_end_date)}
              </p>
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