'use client';

import { useState, useEffect, useRef } from "react";
import { createGroup, updateGroupDetails } from "../actions"; 
import { DAYS_OF_WEEK, COMMUNITY_STATUSES } from "@/lib/constants";
import { formatDateForInput, formatTimeForInput, getNowDateTimeString, getTodayDateString } from "@/lib/date-utils";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';

// Define the shape of the data
interface GroupData {
  id: string;
  name: string;
  mentor: string;
  description: string;
  community_status: string[];
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

  // --- Multi-select ---
  // Initialize with existing data or empty array
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialData?.community_status || []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Toggle individual status
  const toggleStatus = (value: string) => {
    if (selectedStatuses.includes(value)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== value));
    } else {
      setSelectedStatuses([...selectedStatuses, value]);
    }
  };

  // Toggle "Select All"
  const toggleSelectAll = () => {
    if (selectedStatuses.length === COMMUNITY_STATUSES.length) {
      setSelectedStatuses([]); // Deselect all
    } else {
      setSelectedStatuses(COMMUNITY_STATUSES.map(s => s.value)); // Select all
    }
  };

  const isAllSelected = selectedStatuses.length === COMMUNITY_STATUSES.length;

  // Handle Form Submission
  async function handleSubmit(formData: FormData) {
    // Validation: At least one audience must be selected
    if (selectedStatuses.length === 0) {
        toast.error("יש לבחור לפחות קהל יעד אחד");
        return;
    }

    setIsSubmitting(true); 

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

      {/* --- Multi-Select Community Status --- */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>קהל יעד (ניתן לבחור מספר אפשרויות):</label>
        
        {/* Dropdown Trigger Button */}
        <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #767676',
                borderRadius: '2px', 
                backgroundColor: 'white',
                cursor: 'pointer',
                minHeight: '38px',
                display: 'flex',
                alignItems: 'center',
                userSelect: 'none'
            }}
        >
            {selectedStatuses.length === 0 
                ? <span style={{ color: '#767676' }}>בחר/י קהל יעד...</span>
                : selectedStatuses.length === COMMUNITY_STATUSES.length 
                    ? "מתאים לכולם"
                    : `${selectedStatuses.length} אוכלוסיות נבחרו`
            }
        </div>

        {/* Dropdown List */}
        {isDropdownOpen && (
            <div style={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0, 
                border: '1px solid #ccc', 
                backgroundColor: 'white', 
                zIndex: 10, 
                maxHeight: '250px', 
                overflowY: 'auto',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                {/* Select All Option */}
                <div 
                    onClick={toggleSelectAll}
                    style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '8px', backgroundColor: '#f9f9f9' }}
                >
                    <input type="checkbox" checked={isAllSelected} readOnly style={{ pointerEvents: 'none' }} />
                    <span>בחר הכל</span>
                </div>

                {/* Status Options */}
                {COMMUNITY_STATUSES.map((status) => (
                    <div 
                        key={status.value} 
                        onClick={() => toggleStatus(status.value)}
                        style={{ padding: '10px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}
                    >
                         <input 
                            type="checkbox" 
                            checked={selectedStatuses.includes(status.value)} 
                            readOnly 
                            style={{ pointerEvents: 'none' }}
                        />
                        <span>{status.label}</span>
                    </div>
                ))}
            </div>
        )}

        {/* Hidden input: Sends the array as a JSON string to the server action */}
        <input 
            type="hidden" 
            name="community_status_json" 
            value={JSON.stringify(selectedStatuses)} 
        />
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