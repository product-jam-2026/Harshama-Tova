'use client';

import { formatSchedule } from '@/lib/date-utils';
import { unregisterFromGroup } from '@/app/participants/group-registration/actions';
import { useRouter } from 'next/navigation';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { confirmAndExecute } from '@/lib/toast-utils';

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
              <p className="group-description">{group.description}</p>
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


