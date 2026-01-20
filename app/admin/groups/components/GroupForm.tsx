'use client';

import { useState, useEffect, useRef } from "react";
import { createGroup, updateGroupDetails } from "../actions"; 
import { DAYS_OF_WEEK, COMMUNITY_STATUSES } from "@/lib/constants";
import { formatDateForInput, formatTimeForInput, getNowDateTimeString, getTodayDateString } from "@/lib/utils/date-utils";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import formStyles from '@/styles/Form.module.css';
import Button from '@/components/buttons/Button';
import { showThankYouToast } from '@/lib/utils/toast-utils';

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
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function GroupForm({ initialData, onSuccess, onCancel }: GroupFormProps) {
  const router = useRouter();
  
  // State management
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

  const isEditMode = !!initialData;

  const toggleStatus = (value: string) => {
    if (selectedStatuses.includes(value)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== value));
    } else {
      setSelectedStatuses([...selectedStatuses, value]);
    }
  };

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
        result = await updateGroupDetails(formData);
    } else {
        result = await createGroup(formData);
    }

    if (result?.success) {
        showThankYouToast({ 
        message: isEditMode ? 'הקבוצה עודכנה בהצלחה!' : 'הקבוצה נוצרה בהצלחה!', 
        });
        router.refresh(); 
        
        if (onSuccess) {
            onSuccess();
        } else {
            router.push('/admin/?tab=groups'); 
        }
    } else {
        toast.error('אירעה שגיאה בשמירת הקבוצה');
        setIsSubmitting(false); 
    }
  }

  return (
    <div className={formStyles.formPage}>
      
        {/* Header directly on page */}
        <div className={formStyles.formHeader}>
          <h1 className={formStyles.formTitle}>
            {isEditMode 
              ? `עריכת קבוצה: ${initialData.name}` 
              : 'יצירת קבוצה חדשה'
            }
          </h1>
        </div>

        <form action={handleSubmit} className={formStyles.formStack}>
          
          {isEditMode && (
            <>
                <input type="hidden" name="id" value={initialData.id} />
                <input type="hidden" name="existing_image_url" value={initialData.image_url || ''} />
            </>
          )}

          {/* Group Name */}
          <div className={formStyles.formField}>
            <label className={formStyles.formLabel}>שם הקבוצה</label>
            <input 
                type="text" 
                name="name" 
                defaultValue={initialData?.name} 
                required 
                className={formStyles.inputField} 
            />
          </div>

          {/* Mentor */}
          <div className={formStyles.formField}>
            <label className={formStyles.formLabel}>מנחה</label>
            <input 
                type="text" 
                name="mentor" 
                defaultValue={initialData?.mentor} 
                required 
                className={formStyles.inputField} 
            />
          </div>

          {/* Description */}
          <div className={formStyles.formTextareaContainer}>
            <label className={formStyles.formLabel}>תיאור הקבוצה</label>
            <textarea 
                name="description" 
                defaultValue={initialData?.description || ''} 
                rows={4} 
                required 
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
            <div className={formStyles.col}>
                <label className={formStyles.formLabel}>תאריך התחלה</label>
                <input
                    type="date" 
                    name="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    min={getTodayDateString()} 
                    required 
                    className={formStyles.inputField}
                />
            </div>
            <div className={formStyles.col}>
                <label className={formStyles.formLabel}>רישום עד</label>
                <input 
                    type="datetime-local" 
                    name="registration_end_date" 
                    defaultValue={initialData ? formatDateForInput(initialData.registration_end_date) : ""} 
                    min={getNowDateTimeString()}
                    required 
                    className={formStyles.inputField}
                />
            </div>
          </div>

          {/* Schedule Row */}
          <div className={formStyles.row}>
            <div className={formStyles.col}>
              <label className={formStyles.formLabel}>יום</label>
              <select 
                name="meeting_day" 
                value={meetingDay} 
                required 
                className={`${formStyles.inputField} ${formStyles.disabledSelect}`}
                disabled
              >
                <option value="" disabled>-</option>
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
              <input type="hidden" name="meeting_day" value={meetingDay} />
            </div>

            <div className={formStyles.col}>
              <label className={formStyles.formLabel}>שעת המפגשים</label>
              <input 
                type="time" 
                name="meeting_time" 
                defaultValue={initialData ? formatTimeForInput(initialData.meeting_time) : ""} 
                required 
                className={formStyles.inputField}
              />
            </div>
          </div>

          {/* Counts Row */}
          <div className={formStyles.row}>
            <div className={formStyles.col}>
                <label className={formStyles.formLabel}>מקסימום משתתפים</label>
                <input 
                  type="number" 
                  name="max_participants" 
                  defaultValue={initialData?.max_participants} 
                  required 
                  className={formStyles.inputField}
                />
            </div>
            <div className={formStyles.col}>
                <label className={formStyles.formLabel}>מספר מפגשים</label>
                <input 
                  type="number" 
                  name="meetings_count" 
                  min="1" 
                  defaultValue={initialData?.meetings_count} 
                  required 
                  className={formStyles.inputField}
                />
            </div>
          </div>

          {/* Whatsapp */}
          <div className={formStyles.formField}>
            <label className={formStyles.formLabel}>לינק לקבוצת WhatsApp</label>
            <input 
                type="url" 
                name="whatsapp_link" 
                defaultValue={initialData?.whatsapp_link || ''} 
                className={formStyles.inputField}
            />
          </div>

          {/* Image Upload */}
          <div className={formStyles.formField}>
            <label className={formStyles.formLabel}>הוספת תמונה</label>
            
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

          {/* Buttons - Make sure 'buttonsRow' is in Form.module.css */}
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
                    onClick={() => router.push('/admin/?tab=groups')}
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