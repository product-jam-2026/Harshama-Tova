export default function GroupRegistered() {

  const groups:any[] = [
    {
      id: 1, groupImage: '', groupTitle: 'קבוצת תמיכה רגשית', groupDescription: 'קבוצה לתמיכה רגשית למתמודדים עם אתגרים יומיומיים.', meetingTime: '17:00-18:00', meetingDate: '2023-04-10', meetingHost: 'יוסי כהן'
    },
    {
      id: 2, groupImage: '', groupTitle: 'קבוצת סדנאות יצירה', groupDescription: 'קבוצה המציעה סדנאות יצירה שונות למשתתפים.', meetingTime: '16:00-17:00', meetingDate: '2023-04-12', meetingHost: 'שרה ישראלי'
    }
  ];

    return (
        <div>
            {groups.map((group:any) => (
                <div key={group.id} className="group-card">
                    <div className="meeting-details">
                        <div className="meeting-time">
                            <div className= "group-date"> {group.meetingDate}</div>
                            <div className = "group-hour"> {group.meetingTime}</div>
                        </div>
                        <div className = "meeting-people-details">
                            <div className = "group-host">{group.meetingHost}</div>  
                        </div>
                    </div>
                    <div className="group-info">
                        <div className="group-text-info">
                            <h2 className="group-title">{group.groupTitle}</h2>
                            <p className="group-description">{group.groupDescription}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}


