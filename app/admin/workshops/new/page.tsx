import { redirect } from "next/navigation";
import { createWorkshop } from "../actions"; // Import the workshop create action
import { getTodayDateString, getNowDateTimeString } from "@/lib/date-utils";

export default function CreateWorkshop() {
  
  // Wrapper function to handle redirect after success
  async function performCreate(formData: FormData) {
    'use server';
    await createWorkshop(formData);
    redirect("/admin/workshops");
  }

  return (
    <div dir="rtl" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>יצירת סדנה חדשה</h1>

      {/* The form triggers the Server Action via the 'action' prop */}
      <form action={performCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Workshop Name */}
        <div>
          <label>שם הסדנה</label>
          <input required name="name" type="text" style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Description */}
        <div>
          <label>הסבר קצר על הסדנה</label>
          <textarea required name="description" rows={5} style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Mentor Name */}
        <div>
          <label>מעביר/ת הסדנה:</label>
          <input required name="mentor" type="text" style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Image Upload */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>תמונה</label>
          <input 
            name="image"
            type="file" 
            accept="image/*"
            style={{ width: '100%', padding: '10px', background: 'white' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
            {/* Date */}
            <div style={{ flex: 1 }}>
              <label>תאריך הסדנה</label>
              <input 
                required
                name="date" 
                type="date" 
                min={getTodayDateString()} // Allow only future dates
                style={{ width: '100%', padding: '8px' }} />
            </div>

            {/* Time */}
            <div style={{ flex: 1 }}>
              <label>שעת הסדנה</label>
              <input required name="meeting_time" type="time" style={{ width: '100%', padding: '8px' }} />
            </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
             {/* Registration Deadline */}
             <div style={{ flex: 1 }}>
              <label>רישום עד</label>
              <input
                required 
                name="registration_end_date" 
                type="datetime-local" 
                min={getNowDateTimeString()} // Allow only future dates
                style={{ width: '100%', padding: '8px' }} />
            </div>

            {/* Max Participants */}
            <div style={{ flex: 1 }}>
              <label>כמות משתתפים מקסימלית</label>
              <input required name="max_participants" type="number" min="1" style={{ width: '100%', padding: '8px' }} />
            </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          
          {/* Publish Button - sends value 'publish' to the server */}
          <button 
            type="submit" 
            name="submitAction" 
            value="publish"
            style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            שמירה ופרסום
          </button>

          {/* Draft Button - sends value 'draft' to the server */}
          <button 
            type="submit" 
            name="submitAction" 
            value="draft"
            style={{ padding: '10px 20px', background: '#f0f0f0', color: 'black', border: '1px solid #ccc', cursor: 'pointer' }}
          >
            שמירה כטיוטה
          </button>

          {/* Cancel Button (link back) */}
          <a 
            href="/admin/workshops" 
            style={{ padding: '10px 20px', background: 'transparent', color: 'red', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            ביטול
          </a>
        </div>

      </form>
    </div>
  );
}