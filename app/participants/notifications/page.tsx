import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NotificationsClient from './NotificationsClient';

export default async function NotificationsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch notifications
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
  }

  return (
    <div>
      <Suspense
        fallback={
          <div className="loading-container">
            <div className="loading-spinner-simple" />
            <p style={{ marginTop: 12, fontFamily: 'var(--font-body)', color: 'var(--text-dark-2)' }}>טוען...</p>
          </div>
        }
      >
        <NotificationsClient initialNotifications={notifications || []} />
      </Suspense>
    </div>
  );
}
