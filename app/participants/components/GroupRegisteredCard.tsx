import { formatSchedule } from '@/lib/date-utils';

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
              <p className="group-description">{group.description}</p>
            </div>
            <a href={group.whatsapp_link || '#'} className="whatsappLink">
              <img src="..\icons\whatsapp icon.svg" alt="whatsapp" />
              <p>הצטרפו לקבוצת הווטסאפ</p>
              </a>
          </div>
        </div>
      ))}
    </div>
  );
}


