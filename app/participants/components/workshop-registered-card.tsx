export default function WorkshopsRegistered() {

  const workshops:any[] = [
    {
id: 1, workshopImage: '', workshopTitle: 'סדנת תמיכה רגשית', workshopDescription: 'סדנת לתמיכה רגשית למתמודדים עם אתגרים יומיומיים.', meetingTime: '17:00-18:00', meetingDate: '2023-04-10', meetingHost: 'יוסי כהן'
    },
    {
      id: 2, workshopImage: '', workshopTitle: 'סדנת יצירה', workshopDescription: 'סדנת המציעה אופציות יצירה שונות למשתתפים.', meetingTime: '16:00-17:00', meetingDate: '2023-04-12', meetingHost: 'שרה ישראלי'
    }
  ];

    return (
        <div>
            {workshops.map((workshop:any) => (
                <div key={workshop.id} className="workshop-card">
                    <div className="meeting-details">
                        <div className="meeting-time">
                            <div className= "workshop-date"> {workshop.meetingDate}</div>
                            <div className = "workshop-hour"> {workshop.meetingTime}</div>
                        </div>
                        <div className = "meeting-people-details">
                            <div className = "workshop-host">{workshop.meetingHost}</div>  
                        </div>
                    </div>
                    <div className="workshop-info">
                        <div className="workshop-text-info">
                            <h2 className="workshop-title">{workshop.workshopTitle}</h2>
                            <p className="workshop-description">{workshop.workshopDescription}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}


