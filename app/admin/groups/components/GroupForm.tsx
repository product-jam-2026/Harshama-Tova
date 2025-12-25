'use client';

import { useState, useEffect } from "react";
import { createGroup, updateGroupDetails } from "../actions"; // Import BOTH actions
import { DAYS_OF_WEEK, COMMUNITY_STATUSES } from "@/lib/constants";
import { formatDateForInput, formatTimeForInput, getNowDateTimeString, getTodayDateString } from "@/lib/date-utils";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

// Define the shape of the data
interface GroupData {
  id: string;
  name: string;
  mentor: string;
  description: string;
  community_status: string;
  date: string;
  registration_end_date: string;
  meeting_day: number;
  meeting_time: string;
  meetings_count: number;
  max_participants: number;
  whatsapp_link: string;
  image_url: string;
}

// 'initialData' is optional. If provided, we are in EDIT mode.
interface GroupFormProps {
  initialData?: GroupData;
}

export default function GroupForm({ initialData }: GroupFormProps) {
  const router = useRouter();
  
  // State management
  const [startDate, setStartDate] = useState(initialData?.date || "");
  const [meetingDay, setMeetingDay] = useState(initialData?.meeting_day?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate day of week
  useEffect(() => {
    if (startDate) {
      const dateObj = new Date(startDate);
      const dayIndex = dateObj.getDay();
      setMeetingDay(dayIndex.toString());
    } else {
        setMeetingDay("");
    }
  }, [startDate]);

  // Determine if we are in Edit Mode
  const isEditMode = !!initialData;

  // Handle Form Submission
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true); // Disable the button to prevent multiple submissions

    let result;
    
    // Call the appropriate action based on mode
    if (isEditMode) {
        result = await updateGroupDetails(formData);
    } else {
        result = await createGroup(formData);
    }

    // Handle result
    if (result?.success) {
        toast.success(isEditMode ? 'הקבוצה עודכנה בהצלחה!' : 'הקבוצה נוצרה בהצלחה!');
        router.refresh(); // refresh the data on the page
        router.push('/admin/groups'); // Navigate back to groups list
    } else {
        toast.error('אירעה שגיאה בשמירת הקבוצה');
        setIsSubmitting(false); // Re-enable the button in case of error
    }
  }

  return (
    <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* Hidden inputs for Edit Mode */}
      {isEditMode && (
        <>
            <input type="hidden" name="id" value={initialData.id} />
            <input type="hidden" name="existing_image_url" value={initialData.image_url || ''} />
        </>
      )}

      {/* Group Name */}
      <div>
        <label>שם הקבוצה:</label>
        <input type="text" name="name" defaultValue={initialData?.name} required style={{ width: '100%', padding: '8px' }} />
      </div>

      {/* Mentor */}
      <div>
        <label>מנחה:</label>
        <input type="text" name="mentor" defaultValue={initialData?.mentor} required style={{ width: '100%', padding: '8px' }} />
      </div>

      {/* Description */}
      <div>
        <label>תיאור הקבוצה:</label>
        <textarea name="description" defaultValue={initialData?.description || ''} rows={4} required style={{ width: '100%', padding: '8px' }} />
      </div>

      {/* Community Status */}
      <div>
        <label>קהל יעד:</label>
        <select 
          name="community_status" 
          defaultValue={initialData?.community_status || ""}
          required 
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="" disabled>בחר/י קהל יעד</option>
          {COMMUNITY_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Row */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <label>תאריך התחלה:</label>
          <input
            type="date" 
            name="date" 
            value={startDate} // Controlled by state
            onChange={(e) => setStartDate(e.target.value)}
            min={getTodayDateString()} 
            required 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>רישום עד:</label>
          <input 
            type="datetime-local" 
            name="registration_end_date" 
            defaultValue={initialData ? formatDateForInput(initialData.registration_end_date) : ""} 
            min={getNowDateTimeString()}
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
            value={meetingDay} // Controlled by state
            required 
            style={{ width: '100%', padding: '8px', backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
            disabled
          >
            <option value="" disabled>בחר/י יום</option>
            {DAYS_OF_WEEK.map(day => (
              <option key={day.value} value={day.value}>{day.label}</option>
            ))}
          </select>
          {/* Ensure value is sent */}
          <input type="hidden" name="meeting_day" value={meetingDay} />
        </div>

        <div style={{ flex: 1 }}>
          <label>שעת המפגש:</label>
          <input 
            type="time" 
            name="meeting_time" 
            defaultValue={initialData ? formatTimeForInput(initialData.meeting_time) : ""} 
            required 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>
      </div>

      {/* Counts Row */}
      <div style={{ display: 'flex', gap: '20px' }}>
         <div style={{ flex: 1 }}>
            <label>מספר מפגשים:</label>
            <input 
              type="number" 
              name="meetings_count" 
              min="1" 
              defaultValue={initialData?.meetings_count} 
              required 
              style={{ width: '100%', padding: '8px' }} 
            />
        </div>
        <div style={{ flex: 1 }}>
            <label>מקסימום משתתפים:</label>
            <input 
              type="number" 
              name="max_participants" 
              defaultValue={initialData?.max_participants} 
              required 
              style={{ width: '100%', padding: '8px' }} 
            />
        </div>
      </div>

      {/* Whatsapp */}
      <div>
        <label>לינק לקבוצת וואטספ:</label>
        <input type="url" name="whatsapp_link" defaultValue={initialData?.whatsapp_link || ''} style={{ width: '100%', padding: '8px' }} />
      </div>

      {/* Image Upload */}
      <div style={{ margin: '20px 0', border: '1px dashed #ccc', padding: '15px', borderRadius: '8px' }}>
        <label style={{ fontWeight: 'bold' }}>תמונה</label>
        
        {initialData?.image_url && (
          <div style={{ margin: '10px 0' }}>
            <img 
              src={initialData.image_url} 
              alt="Current" 
              style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} 
            />
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>זו התמונה הנוכחית</p>
          </div>
        )}
        
        <input name="image" type="file" accept="image/*" />
      </div>

      {/* Dynamic Buttons based on Mode */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        
        {isEditMode ? (
            // --- EDIT MODE BUTTON ---
            <button type="submit" style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
                שמור שינויים
            </button>
        ) : (
            // --- CREATE MODE BUTTONS ---
            <>
                <button 
                    type="submit" 
                    name="submitAction" 
                    value="publish"
                    style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    שמירה ופרסום
                </button>
                <button 
                    type="submit" 
                    name="submitAction" 
                    value="draft"
                    style={{ padding: '10px 20px', background: '#f0f0f0', color: 'black', border: '1px solid #ccc', cursor: 'pointer' }}
                >
                    שמירה כטיוטה
                </button>
            </>
        )}

        <a href="/admin/groups" style={{ padding: '10px 20px', background: '#ccc', textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center' }}>
          ביטול
        </a>
      </div>

    </form>
  );
}