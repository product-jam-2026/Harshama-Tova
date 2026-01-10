export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_KEY } from '@/lib/config';
import { sendPushNotification } from '@/lib/sendPush';

export async function GET() {
  try {
    // Validate environment variables
    if (!PUBLIC_SUPABASE_URL || !PRIVATE_SUPABASE_SERVICE_KEY) {
      console.error('Missing Supabase credentials:', {
        hasUrl: !!PUBLIC_SUPABASE_URL,
        hasServiceKey: !!PRIVATE_SUPABASE_SERVICE_KEY
      });
      return NextResponse.json(
        { success: false, error: 'Missing Supabase configuration. Please check PRIVATE_SUPABASE_SERVICE_KEY in .env.local' },
        { status: 500 }
      );
    }

    // Use service role client to access all data (no cookies needed for cron job)
    const supabase = createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Get today's date in Israel timezone (UTC+2 or UTC+3)
    // This ensures we check the correct day regardless of when the cron runs
    const now = new Date();
    
    // Convert to Israel timezone using Intl.DateTimeFormat (more reliable in build environments)
    const israelFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jerusalem',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = israelFormatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const todayStr = `${year}-${month}-${day}`; // Format: YYYY-MM-DD
    
    // Create a date object for today in Israel timezone for day of week calculation
    const israelDate = new Date(`${todayStr}T00:00:00+02:00`);
    const todayDayOfWeek = israelDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // For duplicate prevention: get start and end of today in UTC (for database comparison)
    const todayStart = new Date(`${todayStr}T00:00:00+02:00`);
    const todayEnd = new Date(`${todayStr}T23:59:59+02:00`);
    
    // Find all workshops happening today
    const { data: workshopsToday, error: workshopsError } = await supabase
      .from('workshops')
      .select('id, name, meeting_time, date')
      .eq('date', todayStr)
      .eq('status', 'open'); // Only open workshops
    
    if (workshopsError) {
      console.error('Error fetching workshops:', workshopsError);
      return NextResponse.json(
        { success: false, error: workshopsError.message },
        { status: 500 }
      );
    }
    
    let notificationsCreated = 0;
    let workshopNotifications = 0;
    let groupNotifications = 0;
    
    // ========== WORKSHOPS ==========
    // For each workshop, find registered users and create notifications
    if (workshopsToday && workshopsToday.length > 0) {
      for (const workshop of workshopsToday) {
        // Get all users registered to this workshop
        const { data: registrations, error: regError } = await supabase
          .from('workshop_registrations')
          .select('user_id')
          .eq('workshop_id', workshop.id);
        
        if (regError) {
          console.error(`Error fetching registrations for workshop ${workshop.id}:`, regError);
          continue;
        }
        
        if (!registrations || registrations.length === 0) {
          continue; // No registrations for this workshop
        }
        
        // For each registered user, check if notification already exists and create if not
        for (const registration of registrations) {
          // Check if notification already exists for this user and workshop today
          // Using date range to prevent duplicates even if cron runs multiple times
          const { data: existingNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', registration.user_id)
            .eq('type', 'workshop_reminder')
            .eq('related_id', workshop.id)
            .gte('created_at', todayStart.toISOString())
            .lte('created_at', todayEnd.toISOString())
            .maybeSingle();
          
          if (existingNotification) {
            continue; // Notification already exists, skip
          }
          
          // Format the time (remove seconds if present, keep only HH:MM)
          const timeStr = workshop.meeting_time 
            ? workshop.meeting_time.split(':').slice(0, 2).join(':')
            : '';
          
          // Create notification message
          const message = `מזכירים שהיום בשעה ${timeStr} מתקיימת הסדנה "${workshop.name}" מחכים לראות אותך!`;
          
          // Create notification using the service role client
          const { error: notifError } = await supabase
            .from('notifications')
            .insert([{
              user_id: registration.user_id,
              type: 'workshop_reminder',
              message: message,
              related_id: workshop.id,
              is_read: false
            }]);
          
          if (notifError) {
            console.error(`Error creating notification for user ${registration.user_id}:`, notifError);
            continue;
          }

          // === Send Push Notification ===
          // Send a push to the user's device in parallel
          await sendPushNotification({
            userId: registration.user_id,
            title: 'תזכורת לסדנה היום',
            body: message,
            url: '/participants'
          });
          
          notificationsCreated++;
          workshopNotifications++;
        }
      }
    }
    
    // ========== GROUPS ==========
    // Find all open groups (only 'open' status, exclude 'draft', 'ended', 'deleted')
    const { data: allGroups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, meeting_time, date, meeting_day, meetings_count, status')
      .eq('status', 'open'); // Only open groups, not draft/ended/deleted
    
    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
    } else if (allGroups && allGroups.length > 0) {
      // For each group, check if today is a meeting day
      for (const group of allGroups) {
        // Check if today matches the meeting day
        if (group.meeting_day !== todayDayOfWeek) {
          continue; // Not the right day of week
        }
        
        // Parse the start date (in Israel timezone)
        const startDate = new Date(group.date + 'T00:00:00+02:00'); // Assume Israel time
        startDate.setHours(0, 0, 0, 0);
        const todayDate = new Date(todayStr + 'T00:00:00+02:00');
        todayDate.setHours(0, 0, 0, 0);
        
        // Check if today is before the start date
        if (todayDate < startDate) {
          continue; // Group hasn't started yet
        }
        
        // Calculate which week this is (0-based)
        const daysDiff = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysDiff / 7);
        
        // Check if we're within the meeting count
        if (weekNumber >= (group.meetings_count || 0)) {
          continue; // Group has ended
        }
        
        // Get all approved users registered to this group
        const { data: registrations, error: regError } = await supabase
          .from('group_registrations')
          .select('user_id')
          .eq('group_id', group.id)
          .eq('status', 'approved');
        
        if (regError) {
          console.error(`Error fetching registrations for group ${group.id}:`, regError);
          continue;
        }
        
        if (!registrations || registrations.length === 0) {
          continue; // No approved registrations for this group
        }
        
        // For each registered user, check if notification already exists and create if not
        for (const registration of registrations) {
          // Check if notification already exists for this user and group today
          // Using date range to prevent duplicates even if cron runs multiple times
          const { data: existingNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', registration.user_id)
            .eq('type', 'group_reminder')
            .eq('related_id', group.id)
            .gte('created_at', todayStart.toISOString())
            .lte('created_at', todayEnd.toISOString())
            .maybeSingle();
          
          if (existingNotification) {
            continue; // Notification already exists, skip
          }
          
          // Format the time (remove seconds if present, keep only HH:MM)
          const timeStr = group.meeting_time 
            ? group.meeting_time.split(':').slice(0, 2).join(':')
            : '';
          
          // Create notification message
          const message = `מזכירים שהיום בשעה ${timeStr} מתקיימת הקבוצה "${group.name}" מחכים לראות אותך!`;
          
          // Create notification
          const { error: notifError } = await supabase
            .from('notifications')
            .insert([{
              user_id: registration.user_id,
              type: 'group_reminder',
              message: message,
              related_id: group.id,
              is_read: false
            }]);
          
          if (notifError) {
            console.error(`Error creating notification for user ${registration.user_id}:`, notifError);
            continue;
          }

          // === Send Push Notification ===
          // Send a push to the user's device in parallel
          await sendPushNotification({
            userId: registration.user_id,
            title: 'תזכורת למפגש קבוצה היום',
            body: message,
            url: '/participants'
          });
          
          notificationsCreated++;
          groupNotifications++;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Created ${notificationsCreated} reminder notifications (${workshopNotifications} workshops, ${groupNotifications} groups)`,
      notificationsCreated,
      workshopNotifications,
      groupNotifications
    });
    
  } catch (error) {
    console.error('Error in workshop reminders API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}