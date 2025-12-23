import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateWorkshopDetails } from "../../actions";
import { DAYS_OF_WEEK } from "@/lib/constants"; 
import { formatDateForInput, formatTimeForInput } from "@/lib/date-utils";

export default async function EditWorkshopPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch the existing workshop data
  const { data: workshop, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !workshop) {
    return <div>סדנה לא נמצאה</div>;
  }

  // Define the server action wrapper
  async function performUpdate(formData: FormData) {
    'use server';
    await updateWorkshopDetails(formData);
    redirect('/admin/workshops'); // Go back to list after save
  }

  return (
    <div dir="rtl" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>עריכת סדנה: {workshop.name}</h1>
      
      <form action={performUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Hidden inputs */}
        <input type="hidden" name="id" value={workshop.id} />
        <input type="hidden" name="existing_image_url" value={workshop.image_url || ''} />

        {/* Workshop Name */}
        <div>
          <label>שם הסדנה:</label>
          <input type="text" name="name" defaultValue={workshop.name} required style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Mentor */}
        <div>
          <label>מעביר/ת הסדנה:</label>
          <input type="text" name="mentor" defaultValue={workshop.mentor} required style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Description */}
        <div>
          <label>תיאור הסדנה:</label>
          <textarea name="description" defaultValue={workshop.description || ''} rows={5} required style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Date, Day, and Time Row */}
        <div style={{ display: 'flex', gap: '10px' }}>
             
             {/* Date */}
            <div style={{ flex: 1 }}>
                <label>תאריך:</label>
                <input 
                    type="date" 
                    name="date" 
                    defaultValue={formatDateForInput(workshop.date).split('T')[0]} 
                    required 
                    style={{ width: '100%', padding: '8px' }} 
                />
            </div>

            {/* Day of Week (Read Only) */}
            <div style={{ flex: 1 }}>
                <label>יום:</label>
                <select 
                    disabled // User cannot change this manually
                    defaultValue={workshop.meeting_day} 
                    style={{ width: '100%', padding: '8px', background: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed' }}
                >
                    <option value="" disabled>לא ידוע</option>
                    {DAYS_OF_WEEK.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                </select>
            </div>

            {/* Time */}
            <div style={{ flex: 1 }}>
                <label>שעה:</label>
                <input 
                    type="time" 
                    name="meeting_time" 
                    defaultValue={formatTimeForInput(workshop.meeting_time)} 
                    required 
                    style={{ width: '100%', padding: '8px' }} 
                />
            </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
             {/* Registration Deadline */}
             <div style={{ flex: 1 }}>
                <label>רישום עד:</label>
                <input 
                  type="datetime-local" 
                  name="registration_end_date" 
                  defaultValue={formatDateForInput(workshop.registration_end_date)} 
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
                  defaultValue={workshop.max_participants} 
                  required 
                  style={{ width: '100%', padding: '8px' }} 
                />
            </div>
        </div>

        {/* Image Upload Area */}
        <div style={{ margin: '20px 0', border: '1px dashed #ccc', padding: '15px', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>תמונה</label>
          
          {workshop.image_url && (
            <div style={{ margin: '10px 0' }}>
                <img 
                  src={workshop.image_url} 
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
            <a href="/admin/workshops" style={{ padding: '10px 20px', background: '#ccc', textDecoration: 'none', color: 'black' }}>
                ביטול
            </a>
        </div>

      </form>
    </div>
  );
}