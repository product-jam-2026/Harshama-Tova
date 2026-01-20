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

  return ` ימי ${dayName} בשעה ${cleanTime}`;
};

// ------------------------------------------------------------

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

  return `  יום ${dayName} בשעה ${cleanTime}`;
};

// ------------------------------------------------------------

/* --- Formats an ISO date string to 'YYYY-MM-DDTHH:MM' for <input type="datetime-local"> ---
 * Handles timezone offsets to ensure the correct time is displayed in the form. */
export const formatDateForInput = (isoString: string | null) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

// ------------------------------------------------------------

/* --- Formats a SQL time string (HH:MM:SS) to 'HH:MM' for <input type="time"> --- */
export const formatTimeForInput = (timeString: string | null) => {
  if (!timeString) return '';
  return timeString.slice(0, 5);
};

// ------------------------------------------------------------

/* --- Checks if a given date string is in the past (before today) --- */
export const isDateInPast = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false; 

  const inputDate = new Date(dateStr);
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);   // Reset hours to 00:00:00 to compare dates only
  
  return inputDate < today;  // Returns true if the input date is strictly before today
};

// ------------------------------------------------------------

/* --- Returns today's date in 'YYYY-MM-DD' format --- */
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// ------------------------------------------------------------

/* --- Returns the current date and time in 'YYYY-MM-DDTHH:MM' format, adjusted for local timezone. --- */
export const getNowDateTimeString = (): string => {
   const now = new Date();
   // Adjust for timezone offset to get correct local time string
   now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
   return now.toISOString().slice(0, 16);
};

// ------------------------------------------------------------

/* --- Checks if a group has finished based on start date, meeting count AND time --- */
export const hasGroupEnded = (startDateStr: string | null, meetingCount: number | null, meetingTimeStr: string | null = null): boolean => {
  if (!startDateStr || !meetingCount) return false;

  const startDate = new Date(startDateStr);
  const now = new Date();

  // 1. Calculate many weeks to add to get to the Last Meeting
  // We subtract 1 because the start date is the first meeting.
  const weeksToAdd = Math.max(0, meetingCount - 1);
  const daysToAdd = weeksToAdd * 7;
  
  const lastMeetingDate = new Date(startDate);
  lastMeetingDate.setDate(startDate.getDate() + daysToAdd);

  // 2. Set the specific time of the last meeting (if provided)
  if (meetingTimeStr) {
      const [hours, minutes] = meetingTimeStr.split(':').map(Number);
      lastMeetingDate.setHours(hours, minutes, 0, 0);
      
      // Add a 1-hour buffer so it doesn't move to "Ended" while the meeting is ongoing
      lastMeetingDate.setHours(lastMeetingDate.getHours() + 1);
  } else {
      // If no time is set, default to the end of the day (23:59:59)
      // This ensures it stays active throughout the last day
      lastMeetingDate.setHours(23, 59, 59, 999);
  }

  // Returns true if NOW is strictly after the last meeting finished
  return now > lastMeetingDate;
};

// ------------------------------------------------------------

/* --- Checks if a recurring group is active today based on start date and meeting count --- */
export const isGroupActiveToday = (startDateStr: string | null, meetingCount: number | null): boolean => {
  if (!startDateStr || !meetingCount) return false;

  const startDate = new Date(startDateStr);
  const today = new Date();
  
  // Reset time to ignore hours/minutes difference
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);

  // Calculate duration in milliseconds (weeks * 7 days * 24h * 60m * 60s * 1000ms)
  const durationInMs = meetingCount * 7 * 24 * 60 * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationInMs);

  // Check if today is within the range [startDate, endDate)
  return today >= startDate && today < endDate;
};