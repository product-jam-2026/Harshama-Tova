'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Define the structure of PushSubscriptionJSON
interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime?: number | null;
  keys?: {
    p256dh: string;
    auth: string;
  };
}

// save subscription (enabling notifications)
export async function saveSubscription(subscription: PushSubscriptionJSON) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. identify the user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  // 2. save the subscription to the database
  try {
    const { error } = await supabase
      .from('user_devices')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
      }, { onConflict: 'user_id, endpoint' }); // if the device already exists - just update it

    if (error) {
      console.error('Error saving subscription to DB:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Server action internal error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Delete subscription (disabling notifications)
export async function deleteSubscription(endpoint: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No user' };

  try {
    const { error } = await supabase
      .from('user_devices')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return { success: false, error: 'Failed to delete' };
  }
}