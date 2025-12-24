/* --- Formats a recurring schedule for Groups --- */
export const formatSchedule = (dayIndex: number | null, timeStr: string | null) => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  
  // If day or time is not set
  if (dayIndex === undefined || dayIndex === null || !timeStr) {
    return "טרם נקבע מועד";
  }

  const dayName = days[dayIndex];
  
  // Clean time to HH:MM (remove seconds if present)
  const cleanTime = timeStr.slice(0, 5);

  return `ימי ${dayName} בשעה ${cleanTime}`;
};

/* --- Formats a specific schedule for Workshops --- */
export const formatScheduleForWorkshop = (dayIndex: number | null, timeStr: string | null) => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  
  // If day or time is not set
  if (dayIndex === undefined || dayIndex === null || !timeStr) {
    return "טרם נקבע מועד";
  }

  const dayName = days[dayIndex];
  
  // Clean time to HH:MM (remove seconds if present)
  const cleanTime = timeStr.slice(0, 5);

  return `יום ${dayName} בשעה ${cleanTime}`;
};


/* --- Formats an ISO date string to 'YYYY-MM-DDTHH:MM' for <input type="datetime-local"> ---
 * Handles timezone offsets to ensure the correct time is displayed in the form. */
export const formatDateForInput = (isoString: string | null) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

/* --- Formats a SQL time string (HH:MM:SS) to 'HH:MM' for <input type="time"> --- */
export const formatTimeForInput = (timeString: string | null) => {
  if (!timeString) return '';
  return timeString.slice(0, 5);
};

/* --- Checks if a given date string is in the past (before today) --- */
export const isDateInPast = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false; 

  const inputDate = new Date(dateStr);
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);   // Reset hours to 00:00:00 to compare dates only
  
  return inputDate < today;  // Returns true if the input date is strictly before today
};

/* --- Returns today's date in 'YYYY-MM-DD' format --- */
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/* --- Returns the current date and time in 'YYYY-MM-DDTHH:MM' format, adjusted for local timezone. --- */
export const getNowDateTimeString = (): string => {
   const now = new Date();
   // Adjust for timezone offset to get correct local time string
   now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
   return now.toISOString().slice(0, 16);
};