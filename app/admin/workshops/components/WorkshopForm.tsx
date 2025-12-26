'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWorkshop, updateWorkshopDetails } from "../actions";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { formatDateForInput, formatTimeForInput, getNowDateTimeString, getTodayDateString } from "@/lib/date-utils";
import { toast } from 'sonner';

// Define the shape of the data based on DB schema
interface WorkshopData {
  id: string;
  name: string;
  description: string;
  mentor: string;
  image_url: string;
  date: string;
  meeting_time: string;
  meeting_day?: number;
  registration_end_date: string;
  max_participants: number;
  status?: string;
}

// Props interface
interface WorkshopFormProps {
  initialData?: WorkshopData;
}

export default function WorkshopForm({ initialData }: WorkshopFormProps) {
  const router = useRouter();
  
  // State for managing Date -> Day calculation
  const [startDate, setStartDate] = useState(initialData?.date || "");
  const [meetingDay, setMeetingDay] = useState(initialData?.meeting_day?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate day of week when date changes
  useEffect(() => {
    if (startDate) {
      const dateObj = new Date(startDate);
      const dayIndex = dateObj.getDay();
      setMeetingDay(dayIndex.toString());
    } else {
        setMeetingDay("");
    }
  }, [startDate]);

  const isEditMode = !!initialData;

  // Handle Form Submission
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    let result;

    if (isEditMode) {
        result = await updateWorkshopDetails(formData);
    } else {
        result = await createWorkshop(formData);
    }

    if (result?.success) {
        toast.success(isEditMode ? 'הסדנה עודכנה בהצלחה!' : 'הסדנה נוצרה בהצלחה!');
        router.refresh(); // Refresh data
        router.push('/admin/workshops'); // Redirect
    } else {
        toast.error('אירעה שגיאה בשמירת הסדנה');
        setIsSubmitting(false);
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

        {/* Workshop Name */}
        <div>
          <label>שם הסדנה</label>
          <input 
            required 
            name="name" 
            type="text" 
            defaultValue={initialData?.name}
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>

        {/* Description */}
        <div>
          <label>הסבר קצר על הסדנה</label>
          <textarea 
            required 
            name="description" 
            rows={5} 
            defaultValue={initialData?.description}
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>

        {/* Mentor Name */}
        <div>
          <label>מעביר/ת הסדנה:</label>
          <input 
            required 
            name="mentor" 
            type="text" 
            defaultValue={initialData?.mentor}
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>

        {/* Date Row */}
        <div style={{ display: 'flex', gap: '10px' }}>
            
            {/* Date */}
            <div style={{ flex: 1 }}>
              <label>תאריך הסדנה</label>
              <input 
                required
                name="date" 
                type="date" 
                min={getTodayDateString()} 
                value={startDate} // Controlled by state
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '8px' }} 
              />
            </div>

            {/* Day of Week (Calculated Automatically) */}
            <div style={{ flex: 1 }}>
                <label>יום:</label>
                <select 
                    name="meeting_day" 
                    value={meetingDay}
                    disabled // User cannot change manually
                    style={{ width: '100%', padding: '8px', background: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed' }}
                >
                    <option value="" disabled>לא ידוע</option>
                    {DAYS_OF_WEEK.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                </select>
                <input type="hidden" name="meeting_day" value={meetingDay} />
            </div>

            {/* Time */}
            <div style={{ flex: 1 }}>
              <label>שעת הסדנה</label>
              <input 
                required 
                name="meeting_time" 
                type="time" 
                defaultValue={initialData ? formatTimeForInput(initialData.meeting_time) : ""}
                style={{ width: '100%', padding: '8px' }} 
              />
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
                min={getNowDateTimeString()} 
                defaultValue={initialData ? formatDateForInput(initialData.registration_end_date) : ""}
                style={{ width: '100%', padding: '8px' }} 
              />
            </div>

            {/* Max Participants */}
            <div style={{ flex: 1 }}>
              <label>כמות משתתפים מקסימלית</label>
              <input 
                required 
                name="max_participants" 
                type="number" 
                min="1" 
                defaultValue={initialData?.max_participants}
                style={{ width: '100%', padding: '8px' }} 
              />
            </div>
        </div>

        {/* Image Upload */}
        <div style={{ margin: '20px 0', border: '1px dashed #ccc', padding: '15px', borderRadius: '8px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>תמונה</label>
          
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

          <input 
            name="image"
            type="file" 
            accept="image/*"
            style={{ width: '100%', padding: '10px', background: 'white' }} 
          />
        </div>

        {/* Action Buttons */}
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

          <button 
            type="button"
            onClick={() => router.push('/admin/workshops')}
            style={{ padding: '10px 20px', background: 'transparent', color: 'red', textDecoration: 'none', display: 'flex', alignItems: 'center', border: 'none', cursor: 'pointer' }}
          >
            ביטול
          </button>
        </div>

      </form>
  );
}