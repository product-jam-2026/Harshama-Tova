import { redirect } from "next/navigation";
import { createGroup } from "../actions"; // Import the create action

export default function CreateGroup() {
  
  // Wrapper function to handle redirect after success
  async function performCreate(formData: FormData) {
    'use server';
    await createGroup(formData);
    redirect("/admin/groups");
  }

  return (
    <div dir="rtl" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>יצירת קבוצה חדשה</h1>

      {/* The form triggers the Server Action via the 'action' prop */}
      <form action={performCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Group Name */}
        <div>
          <label>שם הקבוצה</label>
          <input required name="name" type="text" style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Description */}
        <div>
          <label>הסבר קצר</label>
          <textarea required name="description" rows={3} style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Mentor Name */}
        <div>
          <label>שם המנחה</label>
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
            {/* Start Date */}
            <div style={{ flex: 1 }}>
              <label>תאריך התחלה</label>
              <input required name="date" type="date" style={{ width: '100%', padding: '8px' }} />
            </div>

            {/* Registration Deadline */}
            <div style={{ flex: 1 }}>
              <label>תאריך אחרון להרשמה</label>
              {/* Using datetime-local to allow specific time selection */}
              <input required name="registration_end_date" type="datetime-local" style={{ width: '100%', padding: '8px' }} />
            </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
            {/* Max Participants */}
            <div style={{ flex: 1 }}>
              <label>כמות משתתפים מקסימלית</label>
              <input required name="max_participants" type="number" min="1" style={{ width: '100%', padding: '8px' }} />
            </div>

            {/* WhatsApp Link */}
            <div style={{ flex: 1 }}>
              <label>לינק לקבוצת WhatsApp</label>
              <input name="whatsapp_link" type="url" style={{ width: '100%', padding: '8px' }} />
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
            שמירה בלבד
          </button>

          {/* Temporary: Cancel Button (link back) */}
          <a 
            href="/admin/groups" 
            style={{ padding: '10px 20px', background: 'transparent', color: 'red', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            ביטול
          </a>
        </div>

      </form>
    </div>
  );
}