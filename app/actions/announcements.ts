'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/app/participants/notifications/actions';

// Create a new announcement
export async function createAnnouncement(content: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated' };

  try {
    // 1. Insert the announcement into the DB
    // We added .select().single() to retrieve the created record (we need its ID)
    const { data: announcementData, error } = await supabase
      .from('daily_announcements')
      .insert([{ 
        content,
        user_id: user.id
      }])
      .select() 
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return { success: false, error: 'Failed to create announcement.' };
    }

    // --- Send Push Notifications to all users with devices ---
    
    // A. Fetch all users who have a registered device
    const { data: devices } = await supabase
        .from('user_devices')
        .select('user_id');

    if (devices && devices.length > 0) {
        // B. Create a unique list of user IDs
        const uniqueUserIds = Array.from(new Set(devices.map(d => d.user_id)));

        // C. Send the notification to all unique users in parallel
        await Promise.all(uniqueUserIds.map(targetUserId => 
            createNotification(
                targetUserId,
                'daily_announcement', 
                content, 
                announcementData.id // Link to the specific announcement
            )
        ));
    }
    // -------------------------------------------------------------------

    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get ALL announcements for the current day (Returns an Array)
export async function getDailyAnnouncements() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- Use UTC Midnight to ensure proper clearing of previous day's data ---
  const now = new Date();
  
  // Create Date object representing 00:00:00 UTC of the current day.
  const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  
  try {
    const { data, error } = await supabase
      .from('daily_announcements')
      .select('id, content, created_at') 
      // Filter: Only items created AFTER 00:00 UTC today
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false }); 

    if (error) {
      console.error('Error fetching announcements:', error);
      return []; 
    }

    return data || [];
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

// Delete announcement
export async function deleteAnnouncement(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated' };

  try {
    const { error } = await supabase
      .from('daily_announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      return { success: false, error: 'Failed to delete announcement.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error during deletion:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}