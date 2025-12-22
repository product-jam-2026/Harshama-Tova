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
        
        {/* Hidden input to pass the ID, and for the existing image URL */}
        <input type="hidden" name="id" value={group.id} />
        <input type="hidden" name="existing_image_url" value={group.image_url || ''} />

        {/* Group Name */}
        <div>
          <label>שם הקבוצה:</label>
          <input type="text" name="name" defaultValue={group.name} required style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Mentor */}
        <div>
          <label>מנחה:</label>
          <input type="text" name="mentor" defaultValue={group.mentor} required style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Description */}
        <div>
          <label>תיאור הקבוצה:</label>
          <textarea name="description" defaultValue={group.description || ''} rows={4} required style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Date Row */}
        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
                <label>תאריך התחלה:</label>
                <input type="date" name="date" defaultValue={group.date} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ flex: 1 }}>
                <label>רישום עד:</label>
                {/* Using shared helper function to format DB timestamp for input */}
                <input 
                  type="datetime-local" 
                  name="registration_end_date" 
                  defaultValue={formatDateForInput(group.registration_end_date)} 
                  required 
                  style={{ width: '100%', padding: '8px' }} 
                />
            </div>
        </div>

        {/* Schedule Row */}
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
                    defaultValue={formatTimeForInput(group.meeting_time)} // load existing time without seconds
                    required 
                    style={{ width: '100%', padding: '8px' }} 
                />
            </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
             {/* Meetings Count */}
             <div style={{ flex: 1 }}>
                <label>מספר מפגשים:</label>
                <input 
                  type="number" 
                  name="meetings_count" 
                  min="1" 
                  defaultValue={group.meetings_count} // load existing value
                  required 
                  style={{ width: '100%', padding: '8px' }} 
                />
            </div>

            {/* Max Participants */}
            <div style={{ flex: 1 }}>
                <label>מקסימום משתתפים:</label>
                <input 
                  type="number" 
                  name="max_participants" 
                  defaultValue={group.max_participants} 
                  required 
                  style={{ width: '100%', padding: '8px' }} 
                />
            </div>
        </div>

        {/* Whatsapp Link */}
        <div>
          <label>לינק לקבוצת וואטספ:</label>
          <input type="url" name="whatsapp_link" defaultValue={group.whatsapp_link || ''} style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Image Upload Area */}
        <div style={{ margin: '20px 0', border: '1px dashed #ccc', padding: '15px', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>תמונה</label>
          
          {/* For displaying the current image*/}
          {group.image_url && (
            <div style={{ margin: '10px 0' }}>
                <img 
                  src={group.image_url} 
                  alt="Current" 
                  style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} 
                />
                <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>זו התמונה הנוכחית</p>
            </div>
          )}

          <input 
            name="image" 
            type="file" 
            accept="image/*"
          />
        </div>

        {/* Submit Buttons */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
                שמור שינויים
            </button>
            {/* Cancel Link */}
            <a href="/admin/groups" style={{ padding: '10px 20px', background: '#ccc', textDecoration: 'none', color: 'black' }}>
                ביטול
            </a>
        </div>

      </form>
    </div>
  );
}