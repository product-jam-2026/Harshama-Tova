import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use service role client to access all data
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Get today's date in YYYY-MM-DD format
    // Supabase stores dates in UTC, so we'll compare dates (not times)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
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
    
    if (!workshopsToday || workshopsToday.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No workshops today',
        notificationsCreated: 0
      });
    }
    
    let notificationsCreated = 0;
    
    // For each workshop, find registered users and create notifications
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
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', registration.user_id)
          .eq('type', 'workshop_reminder')
          .eq('related_id', workshop.id)
          .gte('created_at', todayStr)
          .maybeSingle();
        
        if (existingNotification) {
          continue; // Notification already exists, skip
        }
        
        // Format the time (assuming meeting_time is in HH:MM format)
        const timeStr = workshop.meeting_time || '';
        
        // Create notification message
        const message = `מזכירים שהיום בשעה ${timeStr} מתקיימת הסדנה ${workshop.name} מחכים לראות אותך!`;
        
        // Create notification using the action (which uses authenticated client)
        // We need to use service role for this, so we'll create it directly
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
        
        notificationsCreated++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Created ${notificationsCreated} workshop reminder notifications`,
      notificationsCreated
    });
    
  } catch (error) {
    console.error('Error in workshop reminders API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

