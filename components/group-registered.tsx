import { group } from "console";

export default function GroupRegistered() {

  const groups = [
    {
      id: 1, groupImage: '', groupTitle: 'קבוצת תמיכה רגשית', groupDescription: 'קבוצה לתמיכה רגשית למתמודדים עם אתגרים יומיומיים.', meetingTime: '17:00-18:00', meetingDate: '2023-04-10', meetingHost: 'יוסי כהן'
    },
    {
      id: 2, groupImage: '', groupTitle: 'קבוצת סדנאות יצירה', groupDescription: 'קבוצה המציעה סדנאות יצירה שונות למשתתפים.', meetingTime: '16:00-17:00', meetingDate: '2023-04-12', meetingHost: 'שרה ישראלי'
    }
  ];

    return (
        {groups.map((group:any) => (
            <div key={group.id} className="group-card">
                <div meeting-details>
                    <div id = "meeting-time">
                        <div id = "group-date"> {group.meetingDate}</div>
                        <div id = "group-hour"> {group.meetingTime}</div>
                    </div>
                    <div id = "meeting-people-details">
                        <div id = "group-host">{group.meetingHost}</div>  
                    </div>
                </div>
                <div id="group-info">
                    <div id="group-text-info">
                        <h2 id="group-title">{group.groupTitle}</h2>
                        <p id="group-description">{group.groupDescription}</p>
                    </div>
                </div>
            </div>
        ))}
    );
}


