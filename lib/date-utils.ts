export const formatSchedule = (dayIndex: number | null, timeStr: string | null) => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  
  // If day or time is not set
  if (dayIndex === undefined || dayIndex === null || !timeStr) {
    return "טרם נקבע מועד";
  }

  const dayName = days[dayIndex];
  
  // Clean time to HH:MM (remove seconds)
  const cleanTime = timeStr.slice(0, 5);

  return `ימי ${dayName} בשעה ${cleanTime}`;
};

export const formatScheduleForWorkshop = (dayIndex: number | null, timeStr: string | null) => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  
  // If day or time is not set
  if (dayIndex === undefined || dayIndex === null || !timeStr) {
    return "טרם נקבע מועד";
  }

  const dayName = days[dayIndex];
  
  // Clean time to HH:MM (remove seconds)
  const cleanTime = timeStr.slice(0, 5);

  return `יום ${dayName} בשעה ${cleanTime}`;
};
// Function to format ISO date string to 'YYYY-MM-DDTHH:MM' for datetime-local input
export const formatDateForInput = (isoString: string | null) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

// Function to format time string to 'HH:MM' for time input
export const formatTimeForInput = (timeString: string | null) => {
  if (!timeString) return '';
  return timeString.slice(0, 5);
};