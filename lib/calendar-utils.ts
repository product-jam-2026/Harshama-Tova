/**
 * Calendar utilities for generating ICS (iCalendar) files
 */

interface RecurringEvent {
  title: string;
  description: string;
  startDate: Date;
  startTime: string; // HH:MM format
  duration: number; // in minutes
  weekday: number; // 0-6 (0=Sunday, 1=Monday, etc.)
  count: number; // number of occurrences
  location?: string;
}

interface SingleEvent {
  title: string;
  description: string;
  startDate: Date;
  startTime: string; // HH:MM format
  duration: number; // in minutes
  location?: string;
}

const WEEKDAY_MAP = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * Format date to ICS format (YYYYMMDDTHHMMSS)
 */
function formatICSDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Parse time string (HH:MM) and combine with date
 */
function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

/**
 * Generate ICS content for a recurring event (for groups)
 */
export function generateRecurringEventICS(event: RecurringEvent): string {
  const startDateTime = combineDateTime(event.startDate, event.startTime);
  const endDateTime = new Date(startDateTime.getTime() + event.duration * 60000);
  
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@harshama-tova.com`;
  const weekdayCode = WEEKDAY_MAP[event.weekday];
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Harshama Tova//Calendar//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDateTime)}`,
    `DTEND:${formatICSDate(endDateTime)}`,
    `RRULE:FREQ=WEEKLY;COUNT=${event.count};BYDAY=${weekdayCode}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    event.location ? `LOCATION:${event.location}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n');
  
  return icsContent;
}

/**
 * Generate ICS content for a single event (for workshops)
 */
export function generateSingleEventICS(event: SingleEvent): string {
  const startDateTime = combineDateTime(event.startDate, event.startTime);
  const endDateTime = new Date(startDateTime.getTime() + event.duration * 60000);
  
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@harshama-tova.com`;
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Harshama Tova//Calendar//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDateTime)}`,
    `DTEND:${formatICSDate(endDateTime)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    event.location ? `LOCATION:${event.location}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n');
  
  return icsContent;
}

/**
 * Trigger download of ICS file
 */
export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
