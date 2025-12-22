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

interface GroupRegisteredProps {
  groups: GroupData[];
}

export default function GroupRegisteredCard({ groups }: GroupRegisteredProps) {

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
            <div className="group-text-info">
              <h2 className="group-title">{group.name}</h2>
              <p className="group-description">{group.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


