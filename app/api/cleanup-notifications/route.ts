import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_KEY } from '@/lib/config';

// Force dynamic to ensure this runs fresh every time (no caching)
export const dynamic = 'force-dynamic';

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
    
    // --- Clean up Notifications (Older than 24 hours) ---
    
    // Calculate the date 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Delete notifications older than 24 hours
    const { error: notifError } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', twentyFourHoursAgo.toISOString());
    
    if (notifError) {
      console.error('Error deleting old notifications:', notifError);
    }

    // --- Clean up Daily Announcements (Older than 30 days) ---

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete announcements older than 30 days (Retaining 30 days history)
    const { error: announceError } = await supabase
      .from('daily_announcements')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (announceError) {
      console.error('Error deleting old announcements:', announceError);
    }

    // Check if any critical error occurred
    if (notifError || announceError) {
      return NextResponse.json(
        { success: false, error: 'Error occurred during cleanup. Check server logs.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cleanup successful: Old Notifications (>24h) and Announcements (>30 days) removed.'
    });
    
  } catch (error) {
    console.error('Error in cleanup API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}