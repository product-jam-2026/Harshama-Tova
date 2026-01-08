'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminRealtimeListener() {
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

    // Create the channel for listening to changes, for admin
    const channel = supabase.channel('admin-dashboard-changes')
      
      // Listening to the 'groups' table changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        handleRealtimeUpdate
      )

      // Listening to the 'workshops' table changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshops' },
        handleRealtimeUpdate
      )
      
      // Listening to the 'group_registrations' table changes (e.g new registrations)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_registrations' },
        handleRealtimeUpdate
      )

      // Listening to the 'workshop_registrations' table changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshop_registrations' },
        handleRealtimeUpdate
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [supabase, router]);

  return null; // This component doesn't render anything
}