import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_KEY } from '@/lib/config';

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
    
    // Calculate the date 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const cutoffDate = twentyFourHoursAgo.toISOString();
    
    // Delete notifications older than 24 hours
    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate);
    
    if (error) {
      console.error('Error deleting old notifications:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Old notifications cleaned up (older than 24 hours)'
    });
    
  } catch (error) {
    console.error('Error in cleanup notifications API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

