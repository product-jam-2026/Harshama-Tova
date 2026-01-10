import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Validation: Ensure keys exist
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error('VAPID keys are missing from .env.local');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase Service Role keys are missing from .env.local');
}

// Configure VAPID details (Required by push services)
webpush.setVapidDetails(
  'mailto:noam.maoz1@mail.huji.ac.il',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Create Supabase Admin Client
// We use the SERVICE_ROLE_KEY to bypass RLS because this runs on the server and needs to access ALL users' devices.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SendPushOptions {
  userId: string;
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification({ userId, title, body, url = '/participants' }: SendPushOptions) {
  console.log(`[Push] Attempting to send to user: ${userId}`);

  // 1. Fetch all devices for this user
  const { data: devices, error } = await supabaseAdmin
    .from('user_devices')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error(`[Push] Error fetching devices:`, error.message);
    return;
  }

  if (!devices || devices.length === 0) {
    console.log(`[Push] No devices found for user.`);
    return;
  }

  // 2. Send to all devices in parallel
  const notifications = devices.map(async (device) => {
    const pushSubscription = {
      endpoint: device.endpoint,
      keys: {
        p256dh: device.p256dh,
        auth: device.auth
      }
    };

    const payload = JSON.stringify({
      title,
      body,
      url
    });

    try {
      await webpush.sendNotification(pushSubscription, payload);
      console.log(`[Push] Sent to device ${device.id}`);
      
    } catch (error: any) {
      console.error(`[Push] Failed to send to device ${device.id}:`, error.statusCode);

      // 3. Cleanup dead tokens (410 Gone / 404 Not Found)
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log(`[Push] Device ${device.id} is dead, removing from DB.`);
        await supabaseAdmin
          .from('user_devices')
          .delete()
          .eq('id', device.id);
      }
    }
  });

  await Promise.all(notifications);
}