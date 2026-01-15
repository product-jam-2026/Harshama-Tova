export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_KEY } from '@/lib/config';
import { sendPushNotification } from '@/lib/sendPush';

export async function GET() {
  try {
    // Validate environment variables
    if (!PUBLIC_SUPABASE_URL || !PRIVATE_SUPABASE_SERVICE_KEY) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { success: false, error: 'Missing Supabase configuration.' },
        { status: 500 }
      );
    }

    // Use service role client
    const supabase = createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
        
    // 1. Get accurate Date String for Israel Timezone
    const now = new Date();
    const israelFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jerusalem',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false
    });
    
    const parts = israelFormatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const todayStr = `${year}-${month}-${day}`; // Format: YYYY-MM-DD
    
    // 2. Calculate Day of Week Safely
    // We create a UTC date at NOON (12:00) based on the string. 
    const safeDateForDayCalculation = new Date(`${todayStr}T12:00:00Z`);
    const todayDayOfWeek = safeDateForDayCalculation.getUTCDay(); // 0 = Sunday, 4 = Thursday
    
    console.log(`Cron running for date: ${todayStr}, Day index: ${todayDayOfWeek}`);

    // 3. Define Start/End of day for DB queries
    // Using a broad range based on the string to ensure we catch notifications created "today"
    const todayStartISO = `${todayStr}T00:00:00`; 
    const todayEndISO = `${todayStr}T23:59:59`;
    
    // Find all workshops happening today
    const { data: workshopsToday, error: workshopsError } = await supabase
      .from('workshops')
      .select('id, name, meeting_time, date')
      .eq('date', todayStr)
      .eq('status', 'open'); 
    
    if (workshopsError) {
      console.error('Error fetching workshops:', workshopsError);
      return NextResponse.json({ success: false, error: workshopsError.message }, { status: 500 });
    }
    
    let notificationsCreated = 0;
    let workshopNotifications = 0;
    let groupNotifications = 0;
    
    // ========== WORKSHOPS ==========
    if (workshopsToday && workshopsToday.length > 0) {
      for (const workshop of workshopsToday) {
        const { data: registrations, error: regError } = await supabase
          .from('workshop_registrations')
          .select('user_id')
          .eq('workshop_id', workshop.id);
        
        if (regError || !registrations || registrations.length === 0) continue;
        
        for (const registration of registrations) {
          // Check for duplicates using the string-based comparison
          const { data: existingNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', registration.user_id)
            .eq('type', 'workshop_reminder')
            .eq('related_id', workshop.id)
            .gte('created_at', new Date(todayStartISO).toISOString()) // Compare against UTC conversion
            .lte('created_at', new Date(todayEndISO).toISOString())
            .maybeSingle();
          
          if (existingNotification) continue;
          
          const timeStr = workshop.meeting_time ? workshop.meeting_time.split(':').slice(0, 2).join(':') : '';
          const message = `מזכירים שהיום בשעה ${timeStr} מתקיימת הסדנה "${workshop.name}" מחכים לראות אותך!`;
          
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
    const { data: allGroups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, meeting_time, date, meeting_day, meetings_count, status')
      .eq('status', 'open'); 
    
    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
    } else if (allGroups && allGroups.length > 0) {
      for (const group of allGroups) {
        
        // Compare correct calculated day
        if (group.meeting_day !== todayDayOfWeek) {
          continue; 
        }
        
        // We use string comparison YYYY-MM-DD which is timezone safe
        if (todayStr < group.date) {
            continue; // Group hasn't started yet
        }
        
        // Calculate week number safely
        // We normalize both dates to UTC Noon to avoid offset issues
        const startDateObj = new Date(group.date + 'T12:00:00Z');
        const todayDateObj = new Date(todayStr + 'T12:00:00Z');
        
        const daysDiff = Math.floor((todayDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysDiff / 7);
        
        // Verify we are correctly landing on a meeting cycle (sanity check)
        // If daysDiff is not a multiple of 7, something is weird, but we trust meeting_day check above.

        if (weekNumber >= (group.meetings_count || 0)) {
          continue; // Group has ended
        }
        
        const { data: registrations, error: regError } = await supabase
          .from('group_registrations')
          .select('user_id')
          .eq('group_id', group.id)
          .eq('status', 'approved');
        
        if (regError || !registrations || registrations.length === 0) continue;
        
        for (const registration of registrations) {
          const { data: existingNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', registration.user_id)
            .eq('type', 'group_reminder')
            .eq('related_id', group.id)
            .gte('created_at', new Date(todayStartISO).toISOString())
            .lte('created_at', new Date(todayEndISO).toISOString())
            .maybeSingle();
          
          if (existingNotification) continue;
          
          const timeStr = group.meeting_time ? group.meeting_time.split(':').slice(0, 2).join(':') : '';
          const message = `מזכירים שהיום בשעה ${timeStr} מתקיימת הקבוצה "${group.name}" מחכים לראות אותך!`;
          
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
      message: `Created ${notificationsCreated} reminder notifications`,
      debug: { todayStr, todayDayOfWeek } // Added debug info
    });
    
  } catch (error: any) {
    console.error('Error in cron API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}