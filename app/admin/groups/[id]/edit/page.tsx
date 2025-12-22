import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateGroupDetails } from "../../actions"; // Import the update action
import { DAYS_OF_WEEK } from "@/lib/constants"; 
import { formatDateForInput, formatTimeForInput } from "@/lib/date-utils";

export default async function EditGroupPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch the existing group data
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !group) {
    return <div>קבוצה לא נמצאה</div>;
  }

  // Define the server action wrapper
  async function performUpdate(formData: FormData) {
    'use server';
    await updateGroupDetails(formData);
    redirect('/admin/groups'); // Go back to list after save
  }

  // Render the form pre-filled with existing data
  return (
    <div dir="rtl" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>עריכת קבוצה: {group.name}</h1>
      
      <form action={performUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Hidden input to pass the ID */}
        <input type="hidden" name="id" value={group.id} />

        <div>
          <label>שם הקבוצה:</label>
          <input type="text" name="name" defaultValue={group.name} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>מנחה:</label>
          <input type="text" name="mentor" defaultValue={group.mentor} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>תיאור הקבוצה:</label>
          <textarea name="description" defaultValue={group.description || ''} rows={4} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <label>תאריך התחלה:</label>
                <input type="date" name="date" defaultValue={group.date} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ flex: 1 }}>
                <label>תאריך אחרון להרשמה:</label>
                {/* Changed type to datetime-local and used shared helper function for defaultValue */}
                <input 
                  type="datetime-local" 
                  name="registration_end_date" 
                  defaultValue={formatDateForInput(group.registration_end_date)} 
                  required 
                  style={{ width: '100%', padding: '8px' }} 
                />
            </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <label>יום המפגש:</label>
                <select 
                    name="meeting_day" 
                    defaultValue={group.meeting_day} // load existing value
                    required 
                    style={{ width: '100%', padding: '8px' }}
                >
                    <option value="" disabled>בחר/י יום</option>
                    {DAYS_OF_WEEK.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                </select>
            </div>
            <div style={{ flex: 1 }}>
                <label>שעת המפגש:</label>
                <input 
                    type="time" 
                    name="meeting_time" 
                    defaultValue={formatTimeForInput(group.meeting_time)} // load existing time without seconds via shared helper
                    required 
                    style={{ width: '100%', padding: '8px' }} 
                />
            </div>
        </div>

        <div>
          <label>מקסימום משתתפים:</label>
          <input type="number" name="max_participants" defaultValue={group.max_participants} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>לינק לקבוצת וואטספ:</label>
          <input type="url" name="whatsapp_link" defaultValue={group.whatsapp_link || ''} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>קישור לתמונה (זמני):</label>
          <input type="url" name="image_url" defaultValue={group.image_url || ''} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
                שמור שינויים
            </button>
            {/* Temporary: Cancel Button (link back) */}
            <a href="/admin/groups" style={{ padding: '10px 20px', background: '#ccc', textDecoration: 'none', color: 'black' }}>
                ביטול
            </a>
        </div>

      </form>
    </div>
  );
}