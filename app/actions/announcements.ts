'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Create a new announcement
export async function createAnnouncement(content: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated' };

  try {
    const { error } = await supabase
      .from('daily_announcements')
      .insert([{ 
        content,
        user_id: user.id
      }]);

    if (error) {
      console.error('Error creating announcement:', error);
      return { success: false, error: 'Failed to create announcement.' };
    }

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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    const { data, error } = await supabase
      .from('daily_announcements')
      .select('id, content, created_at') 
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString())
      // Newest first
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