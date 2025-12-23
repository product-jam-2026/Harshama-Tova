'use client';

import { formatSchedule } from '@/lib/date-utils';
import { unregisterFromWorkshop } from '@/app/participants/workshop-registration/actions';
import { useRouter } from 'next/navigation';
import { confirmAndExecute } from '@/lib/toast-utils';

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
              <p className="group-description">{workshop.description}</p>
            </div>
          </div>
          <button onClick={() => handleUnregister(workshop.id)}>ביטול הרשמה</button>
        </div>
      ))}
    </div>
  );
}


