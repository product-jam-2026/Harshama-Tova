import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
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

