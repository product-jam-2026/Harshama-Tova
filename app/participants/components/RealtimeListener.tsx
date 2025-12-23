'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ParticipantsRealtimeListener() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Create a unique channel for participants updates
    const channel = supabase.channel('public-site-updates')
      
      // Listen specifically to the 'groups' table
      // We want to know when a group is added (INSERT), updated (UPDATE), or removed (DELETE)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        (payload) => {
          router.refresh();
        }
      )

      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshops' },
        (payload) => {
          router.refresh();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return null; // Invisible component
}