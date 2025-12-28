import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTodayDateString, formatTimeForInput, isGroupActiveToday } from '@/lib/date-utils'
import ActivityCard from '@/app/admin/components/ActivityCard' 

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Double security check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // --- SETUP DATE VARIABLES ---
  const now = new Date()
  const todayIsoString = getTodayDateString() 
  const todayDayOfWeek = now.getDay()

  // --- FETCH DATA ---

  // Fetch Groups: Only those scheduled for this day of the week
  const { data: potentialGroups } = await supabase
    .from('groups')
    .select('id, name, meeting_time, date, meetings_count, mentor, community_status') 
    .eq('meeting_day', todayDayOfWeek)
    .eq('status', 'open')

  // Fetch Workshops: Only those happening specifically today
  const { data: todayWorkshops } = await supabase
    .from('workshops')
    .select('id, name, meeting_time, date, mentor, community_status')
    .eq('date', todayIsoString)


  // Filter active groups logic (checking dates)
  const activeGroups = potentialGroups?.filter(g => 
    isGroupActiveToday(g.date, g.meetings_count)
  ) || [];

  // Create a unified list for the UI
  const combinedActivities = [
    ...activeGroups.map(g => {
      return {
        id: g.id,
        name: g.name,
        audience: g.community_status || [], 
        time: formatTimeForInput(g.meeting_time) || '00:00',
        mentor: g.mentor,
        type: 'Group' as const
      }
    }),
    ...(todayWorkshops?.map(w => ({
      id: w.id,
      name: w.name,
      audience: w.community_status || [], 
      time: formatTimeForInput(w.meeting_time) || '??:??', 
      mentor: w.mentor,
      type: 'Workshop' as const
    })) || [])
  ];

  // Sort by time
  combinedActivities.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>אדמה טובה</h1>
        <p style={{ color: '#666', marginTop: '5px' }}>
          {new Intl.DateTimeFormat('he-IL', { weekday: 'long' }).format(now)}, {new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(now)}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        
        {/* --- PANEL 1: Activities Today --- */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #eee' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📅 הפעילות היום במרחב
            </h2>
            <span style={{ fontSize: '12px', background: '#f3f4f6', padding: '4px 10px', borderRadius: '20px', color: '#555' }}>
              {combinedActivities.length} פעילויות
            </span>
          </div>
          
          <div>
            {combinedActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed #ddd', borderRadius: '12px', background: '#fafafa' }}>
                <p style={{ color: '#888', fontSize: '16px' }}>אין פעילויות מתוכננות להיום.</p>
                <p style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>יום שקט במרחב ☕</p>
              </div>
            ) : (
              combinedActivities.map((activity, idx) => (
                <ActivityCard 
                  key={`${activity.type}-${activity.id}-${idx}`}
                  id={activity.id}
                  title={activity.name}
                  time={activity.time}
                  mentor={activity.mentor}
                  audience={activity.audience}
                  type={activity.type}
                />
              ))
            )}
          </div>
        </div>

        {/* --- PANEL 2: Pending Requests Placeholder --- */}
        <div style={{ border: '2px dashed #e5e7eb', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#9ca3af' }}>
          כאן יהיה החלק השני: עדכונים לגבי מי שממתין לאישור
        </div>

      </div>
    </div>
  )
}