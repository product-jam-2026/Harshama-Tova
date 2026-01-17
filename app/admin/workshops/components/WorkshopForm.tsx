'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createWorkshop, updateWorkshopDetails } from "../actions";
import { DAYS_OF_WEEK, COMMUNITY_STATUSES } from "@/lib/constants";
import { formatDateForInput, formatTimeForInput, getNowDateTimeString, getTodayDateString } from "@/lib/utils/date-utils";
import { toast } from 'sonner';
import formStyles from '@/styles/Form.module.css';
import Button from '@/components/buttons/Button';

// Define the shape of the data based on DB schema
interface WorkshopData {
  id: string;
  name: string;
  description: string;
  mentor: string;
  image_url: string;
  community_status: string[];
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
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WorkshopForm({ initialData, onSuccess, onCancel }: WorkshopFormProps) {
  const router = useRouter();
  
  // State for managing Date -> Day calculation
  const [startDate, setStartDate] = useState(initialData?.date || "");
  const [meetingDay, setMeetingDay] = useState(initialData?.meeting_day?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Multi-select ---
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
    if (selectedStatuses.length === 0) {
        toast.error("יש לבחור לפחות קהל יעד אחד");
        return;
    }

    setIsSubmitting(true);
    let result;

    if (isEditMode) {
        result = await updateWorkshopDetails(formData);
    } else {
        result = await createWorkshop(formData);
    }

    if (result?.success) {
        toast.success(isEditMode ? 'הסדנה עודכנה בהצלחה!' : 'הסדנה נוצרה בהצלחה!');
        router.refresh(); 
        
        if (onSuccess) {
            onSuccess();
        } else {
            router.push('/admin/?tab=workshops'); 
        }
    } else {
        toast.error('אירעה שגיאה בשמירת הסדנה');
        setIsSubmitting(false);
    }
  }

  return (
    <div className={formStyles.formPage}>
      
      {/* Header directly on page */}
      <div className={formStyles.formHeader}>
        <h1 className={formStyles.formTitle}>
          {isEditMode 
            ? `עריכת סדנה: ${initialData.name}` 
            : 'יצירת סדנה חדשה'
          }
        </h1>
      </div>

      <form action={handleSubmit} className={formStyles.formStack}>
        
        {/* Hidden inputs for Edit Mode */}
        {isEditMode && (
          <>
              <input type="hidden" name="id" value={initialData.id} />
              <input type="hidden" name="existing_image_url" value={initialData.image_url || ''} />
          </>
        )}

        {/* Workshop Name */}
        <div className={formStyles.formField}>
          <label className={formStyles.formLabel}>שם הסדנה</label>
          <input 
            required 
            name="name" 
            type="text" 
            defaultValue={initialData?.name}
            className={formStyles.inputField} 
          />
        </div>

        {/* Description */}
        <div className={formStyles.formTextareaContainer}>
          <label className={formStyles.formLabel}>הסבר קצר על הסדנה</label>
          <textarea 
            required 
            name="description" 
            rows={5} 
            defaultValue={initialData?.description}
            className={formStyles.inputField}
          />
        </div>

        {/* Mentor Name */}
        <div className={formStyles.formField}>
          <label className={formStyles.formLabel}>מעביר/ת הסדנה:</label>
          <input 
            required 
            name="mentor" 
            type="text" 
            defaultValue={initialData?.mentor}
            className={formStyles.inputField}
          />
        </div>

        {/* --- Multi-Select --- */}
        <div className={formStyles.formField} ref={dropdownRef}>
            <label className={formStyles.formLabel}>קהל יעד (ניתן לבחור מספר אפשרויות)</label>
            
            <div className={formStyles.dropdownContainer}>
                <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={formStyles.dropdownTrigger}
                >
                    {selectedStatuses.length === 0 
                        ? <span className={formStyles.placeholder}>בחר/י קהל יעד...</span>
                        : selectedStatuses.length === COMMUNITY_STATUSES.length 
                            ? "מתאים לכולם"
                            : `${selectedStatuses.length} אוכלוסיות נבחרו`
                    }
                </div>

                {isDropdownOpen && (
                    <div className={formStyles.dropdownMenu}>
                        <div 
                            onClick={toggleSelectAll}
                            className={`${formStyles.dropdownOption} ${formStyles.selectAllOption}`}
                        >
                            <input type="checkbox" checked={isAllSelected} readOnly className={formStyles.checkbox} />
                            <span>בחר הכל</span>
                        </div>

                        {COMMUNITY_STATUSES.map((status) => (
                            <div 
                                key={status.value} 
                                onClick={() => toggleStatus(status.value)}
                                className={formStyles.dropdownOption}
                            >
                                <input 
                                    type="checkbox" 
                                    checked={selectedStatuses.includes(status.value)} 
                                    readOnly 
                                    className={formStyles.checkbox}
                                />
                                <span>{status.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <input 
                type="hidden" 
                name="community_status_json" 
                value={JSON.stringify(selectedStatuses)} 
            />
        </div>

        {/* Date Row */}
        <div className={formStyles.row}>
            
            {/* Date */}
            <div className={formStyles.col}>
              <label className={formStyles.formLabel}>תאריך הסדנה</label>
              <input 
                required
                name="date" 
                type="date" 
                min={getTodayDateString()} 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className={formStyles.inputField}
              />
            </div>

            {/* Day of Week */}
            <div className={formStyles.col}>
                <label className={formStyles.formLabel}>יום</label>
                <select 
                    name="meeting_day" 
                    value={meetingDay}
                    disabled 
                    className={`${formStyles.inputField} ${formStyles.disabledSelect}`}
                >
                    <option value="" disabled>-</option>
                    {DAYS_OF_WEEK.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                </select>
                <input type="hidden" name="meeting_day" value={meetingDay} />
            </div>

            {/* Time */}
            <div className={formStyles.col}>
              <label className={formStyles.formLabel}>שעת הסדנה</label>
              <input 
                required 
                name="meeting_time" 
                type="time" 
                defaultValue={initialData ? formatTimeForInput(initialData.meeting_time) : ""}
                className={formStyles.inputField}
              />
            </div>
        </div>

        {/* Registration & Count Row */}
        <div className={formStyles.row}>
             {/* Registration Deadline */}
             <div className={formStyles.col}>
              <label className={formStyles.formLabel}>רישום עד</label>
              <input
                required 
                name="registration_end_date" 
                type="datetime-local" 
                min={getNowDateTimeString()} 
                defaultValue={initialData ? formatDateForInput(initialData.registration_end_date) : ""}
                className={formStyles.inputField}
              />
            </div>

            {/* Max Participants */}
            <div className={formStyles.col}>
              <label className={formStyles.formLabel}>מקסימום משתתפים</label>
              <input 
                required 
                name="max_participants" 
                type="number" 
                min="1" 
                defaultValue={initialData?.max_participants}
                className={formStyles.inputField}
              />
            </div>
        </div>

        {/* Image Upload */}
        <div className={formStyles.formField}>
          <label className={formStyles.formLabel}>תמונה</label>
          
          {initialData?.image_url && (
            <div className={formStyles.imagePreview}>
                <img 
                  src={initialData.image_url} 
                  alt="Current" 
                  className={formStyles.currentImage}
                />
                <p className={formStyles.imageHelpText}>זו התמונה הנוכחית</p>
            </div>
          )}

          <div className={formStyles.imageUploadContainer}>
              <label htmlFor="image-upload" className={formStyles.uploadButton}>
                בחירת קובץ
              </label>
              <input 
                id="image-upload"
                name="image"
                type="file" 
                accept="image/*"
                style={{ display: 'none' }} 
              />
          </div>
        </div>

        {/* Action Buttons */}
        <div className={formStyles.buttonsRow}>
          
          {isEditMode ? (
            <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
            >
                שמור שינויים
            </Button>
          ) : (
            <>
                <Button 
                    variant="primary" 
                    type="submit" 
                    name="submitAction" 
                    value="publish"
                    disabled={isSubmitting}
                >
                    שמירה ופרסום
                </Button>
                
                <Button 
                    variant="secondary1" 
                    type="submit" 
                    name="submitAction" 
                    value="draft"
                    disabled={isSubmitting}
                >
                    שמירה כטיוטה
                </Button>
            </>
          )}

          {onCancel ? (
            <Button 
                variant="secondary2" 
                type="button" 
                onClick={onCancel}
                disabled={isSubmitting}
            >
                ביטול
            </Button>
          ) : (
            <Button 
                variant="secondary2" 
                type="button"
                onClick={() => router.push('/admin/?tab=workshops')}
                disabled={isSubmitting}
            >
                ביטול
            </Button>
          )}
        </div>

      </form>
    </div>
  );
}