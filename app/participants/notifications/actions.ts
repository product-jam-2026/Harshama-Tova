'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Create a new notification
export async function createNotification(
  userId: string,
  type: 'group_approved' | 'workshop_approved' | 'group_rejected',
  message: string,
  relatedId?: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type: type,
        message: message,
        related_id: relatedId || null,
        is_read: false
      }]);

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/participants');
    return { success: true };
  } catch (error) {
    console.error('Notification creation error:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}

// Get all notifications for current user
export async function getNotifications() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, notifications: [], error: 'User not authenticated' };
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, notifications: [], error: error.message };
    }

    return { success: true, notifications: data || [] };
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return { success: false, notifications: [], error: 'Failed to fetch notifications' };
  }
}

// Get unread notifications count
export async function getUnreadCount() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, count: 0 };
  }

  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error counting unread notifications:', error);
      return { success: false, count: 0 };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Count notifications error:', error);
    return { success: false, count: 0 };
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id); // Ensure user can only mark their own notifications

    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/participants');
    return { success: true };
  } catch (error) {
    console.error('Mark as read error:', error);
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

// Mark all notifications as read
export async function markAllAsRead() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/participants');
    return { success: true };
  } catch (error) {
    console.error('Mark all as read error:', error);
    return { success: false, error: 'Failed to mark all notifications as read' };
  }
}

