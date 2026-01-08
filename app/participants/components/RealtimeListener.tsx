'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ParticipantsRealtimeListener() {
  const router = useRouter();
  const supabase = createClient();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Helper to debounce refresh (prevents UI freeze when many updates happen at once)
    const handleRealtimeUpdate = () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => {
        router.refresh();
      }, 1000); // Wait 1 second after last event before refreshing
    };

    // Create a unique channel for participants updates
    const channel = supabase.channel('public-site-updates')
      
      // Listen specifically to the 'groups' table
      // We want to know when a group is added (INSERT), updated (UPDATE), or removed (DELETE)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        handleRealtimeUpdate
      )

      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshops' },
        handleRealtimeUpdate
      )

      // Listen for status changes (e.g. Admin approved my request)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_registrations' },
        handleRealtimeUpdate
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshop_registrations' },
        handleRealtimeUpdate
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [supabase, router]);

  return null; // Invisible component
}