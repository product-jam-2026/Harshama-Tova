'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminRealtimeListener() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Create the channel for listening to changes, for admin
    const channel = supabase.channel('admin-dashboard-changes')
      
      // Listening to the 'groups' table changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        (payload) => {
          router.refresh();
        }
      )

      // Listening to the 'workshops' table changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshops' },
        (payload) => {
          router.refresh();
        }
      )
      
      // Listening to the 'group_registrations' table changes (e.g new registrations)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_registrations' },
        (payload) => {
          router.refresh();
        }
      )

      // Listening to the 'workshop_registrations' table changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshop_registrations' },
        (payload) => {
          router.refresh();
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return null; // This component doesn't render anything
}