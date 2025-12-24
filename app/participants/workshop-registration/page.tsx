'use client';

import { createClient } from '@/lib/supabase/client';
import WorkshopUnregisteredCard from '@/app/participants/components/WorkshopUnregisteredCard';
import { useState, useEffect, useCallback } from 'react';
import Spinner from "@/components/Spinner";

export default function WorkshopsPage() {
  const [availableWorkshops, setAvailableWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Wrap fetchWorkshops in useCallback so it can be reused in the Realtime listener
  const fetchWorkshops = useCallback(async () => {
      
      // Get current user authentication first
      const { data: { user } } = await supabase.auth.getUser();

      // OPTIMIZATION: Fetch all necessary data in parallel using Promise.all
      const [workshopsResult, userRegsResult, allRegsResult] = await Promise.all([
          // Fetch open workshops
          supabase
            .from('workshops')
            .select('*')
            .eq('status', 'open')
            .gte('registration_end_date', new Date().toISOString())
            .order('date', { ascending: true }),

          // Fetch current user's registrations (only if user exists)
          user 
            ? supabase.from('workshop_registrations').select('workshop_id').eq('user_id', user.id) 
            : Promise.resolve({ data: [] }),

          // Fetch all registrations (for calculating remaining spots)
          supabase
            .from('workshop_registrations')
            .select('workshop_id')
      ]);

      // Extract data from results
      const workshops = workshopsResult.data;
      const userRegistrations = userRegsResult.data;
      const approvedRegistrations = allRegsResult.data;

      // Get list of workshop IDs the user is already registered for
      const registeredWorkshopIds = userRegistrations?.map((r: any) => r.workshop_id) || [];

      // Count participants per workshop
      const participantCounts = new Map<string, number>();
      approvedRegistrations?.forEach((reg: any) => {
        participantCounts.set(reg.workshop_id, (participantCounts.get(reg.workshop_id) || 0) + 1);
      });

      // Filter workshops
      const filtered = workshops?.filter((workshop: any) => {
        const notRegistered = !registeredWorkshopIds.includes(workshop.id);
        const currentParticipants = participantCounts.get(workshop.id) || 0;
        const notFull = currentParticipants < workshop.max_participants;
        return notRegistered && notFull;
      }) || [];

      setAvailableWorkshops(filtered);
      setLoading(false);
  }, [supabase]); // Dependencies for useCallback

  // UseEffect handles both initial fetch and Realtime subscription
  useEffect(() => {
    fetchWorkshops();

    // Set up Realtime listener
    const channel = supabase.channel('workshops-page-realtime')
      // Listen for changes in 'workshops' table
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshops' },
        (payload) => {
          console.log('Realtime update: Workshops table changed', payload);
          fetchWorkshops(); // Re-fetch data
        }
      )
      // Listen for changes in 'workshop_registrations' (to update participant counts dynamically)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshop_registrations' },
        (payload) => {
          console.log('Realtime update: Workshop registrations changed', payload);
          fetchWorkshops(); // Re-fetch data
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWorkshops, supabase]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
         <Spinner label="טוען סדנאות..." />
      </div>
    );
  }

  if (availableWorkshops.length === 0) {
    return <div>אין כרגע סדנאות זמינות, מוזמנ/ת לעקוב ולהתעדכן</div>;
  }

  return (
    <div>
      <WorkshopUnregisteredCard workshops={availableWorkshops} />
    </div>
  );
}