'use client';

import { createClient } from '@/lib/supabase/client';
import WorkshopUnregisteredCard from '@/app/participants/components/WorkshopUnregisteredCard';
import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@/components/buttons/Button';
import Spinner from "@/components/Spinner/Spinner";

export default function WorkshopsPage() {
  const [showAllWorkshops, setShowAllWorkshops] = useState(false);
  const [availableWorkshops, setAvailableWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Wrap fetchWorkshops in useCallback so it can be reused in the Realtime listener
  const fetchWorkshops = useCallback(async () => {
      
      // Get current user authentication first
      const { data: { user } } = await supabase.auth.getUser();

      // OPTIMIZATION: Fetch all necessary data in parallel using Promise.all
      const [userDataResult, workshopsResult, userRegsResult, allRegsResult] = await Promise.all([
          // Fetch user details to get community_status (only if user exists)
          user 
            ? supabase.from('users').select('community_status').eq('id', user.id).single() 
            : Promise.resolve({ data: null }),

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
      const userData = userDataResult.data;
      const workshops = workshopsResult.data;
      const userRegistrations = userRegsResult.data;
      const approvedRegistrations = allRegsResult.data;

      // Ensure user statuses are an array (or empty array)
      const userStatuses: string[] = userData?.community_status || [];

      // Get list of workshop IDs the user is already registered for
      const registeredWorkshopIds = userRegistrations?.map((r: any) => r.workshop_id) || [];

      // Count participants per workshop
      const participantCounts = new Map<string, number>();
      approvedRegistrations?.forEach((reg: any) => {
        participantCounts.set(reg.workshop_id, (participantCounts.get(reg.workshop_id) || 0) + 1);
      });

      // Filter workshops
      const filtered = workshops?.filter((workshop: any) => {
        const workshopStatuses: string[] = workshop.community_status || [];
        
        let matchesCommunity = false;

        if (showAllWorkshops) {
            // Case 1: User explicitly asked to see all workshops
            matchesCommunity = true;
        } else if (workshopStatuses.length === 0) {
            // Case 2: Workshop has no specific target audience (Open to everyone)
            matchesCommunity = true;
        } else if (userStatuses.length === 0) {
            // Case 3: User has no status defined, we show them everything (default behavior)
            matchesCommunity = true;
        } else {
            // Check if any of the user's statuses exist in the workshop's target statuses
            matchesCommunity = userStatuses.some(userStatus => workshopStatuses.includes(userStatus));
        }

        const notRegistered = !registeredWorkshopIds.includes(workshop.id);
        const currentParticipants = participantCounts.get(workshop.id) || 0;
        const notFull = currentParticipants < workshop.max_participants;
        
        return matchesCommunity && notRegistered && notFull;
      }) || [];

      setAvailableWorkshops(filtered);
      setLoading(false);
  }, [showAllWorkshops, supabase]); 

  // UseEffect handles both initial fetch and Realtime subscription
  useEffect(() => {
    fetchWorkshops();

    // Helper to debounce updates
    const handleRealtimeUpdate = (payload: any) => {
      console.log('Realtime update received:', payload.eventType);
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(() => {
        fetchWorkshops();
      }, 1000); 
    };

    // Set up Realtime listener
    const channel = supabase.channel('workshops-page-realtime')
      // Listen for changes in 'workshops' table
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshops' },
        handleRealtimeUpdate
      )
      // Listen for changes in 'workshop_registrations' (to update participant counts dynamically)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workshop_registrations' },
        handleRealtimeUpdate
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [fetchWorkshops, supabase]);

  if (loading) {
    return (
      <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      width: '100%',
      zIndex: 9999 }}>
         <Spinner label="טוען סדנאות..." />
      </div>
    );
  }

  return (
    <div>
      {/* Added Toggle Button */}
      <Button
        className="filter-button"
        variant="secondary-light"
        size="md"
        onClick={() => setShowAllWorkshops(!showAllWorkshops)}
      >
        {showAllWorkshops ? 'הצג סדנאות המתאימות עבורי' : 'הצג את כלל הסדנאות'}
      </Button>

      {availableWorkshops.length === 0 ? (
        <p className="dark-texts">אין כרגע סדנאות זמינות, מוזמנ/ת לעקוב ולהתעדכן</p>
      ) : (
        <WorkshopUnregisteredCard workshops={availableWorkshops} />
      )}
    </div>
  );
}