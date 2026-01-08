'use client';

import { createClient } from '@/lib/supabase/client';
import GroupUnregisteredCard from '@/app/participants/components/GroupUnregisteredCard';
import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@/components/buttons/Button';
import Spinner from "@/components/Spinner/Spinner";

export default function GroupsPage() {
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Wrap fetchGroups in useCallback so it can be reused in the Realtime listener
  const fetchGroups = useCallback(async () => {

      // Get current user authentication first
      const { data: { user } } = await supabase.auth.getUser();

      // OPTIMIZATION: Fetch all necessary data in parallel using Promise.all
      const [userDataResult, groupsResult, userRegsResult, allRegsResult] = await Promise.all([
          // Fetch user details (only if user exists)
          user 
            ? supabase.from('users').select('community_status').eq('id', user.id).single() 
            : Promise.resolve({ data: null }),

          // Fetch open groups
          supabase
            .from('groups')
            .select('*')
            .eq('status', 'open')
            .gte('registration_end_date', new Date().toISOString())
            .order('date', { ascending: true }),

          // Fetch current user's registrations (only if user exists)
          user 
            ? supabase.from('group_registrations').select('group_id').eq('user_id', user.id) 
            : Promise.resolve({ data: [] }),

          // Fetch all approved/pending registrations (for calculating remaining spots)
          supabase
            .from('group_registrations')
            .select('group_id')
            .in('status', ['approved', 'pending'])
      ]);

      // Extract data from results
      const userData = userDataResult.data;
      const groups = groupsResult.data;
      const userRegistrations = userRegsResult.data;
      const approvedRegistrations = allRegsResult.data;

      // Ensure user statuses are an array (or empty array)
      const userStatuses: string[] = userData?.community_status || [];

      // Get list of group IDs the user is already registered for
      const registeredGroupIds = userRegistrations?.map((r: any) => r.group_id) || [];

      // Count participants per group
      const participantCounts = new Map<string, number>();
      approvedRegistrations?.forEach((reg: any) => {
        participantCounts.set(reg.group_id, (participantCounts.get(reg.group_id) || 0) + 1);
      });

      // Filter groups
      const filtered = groups?.filter((group: any) => {
        const groupStatuses: string[] = group.community_status || [];
        
        let matchesCommunity = false;

        if (showAllGroups) {
            // Case 1: User explicitly asked to see all groups
            matchesCommunity = true;
        } else if (groupStatuses.length === 0) {
            // Case 2: Group has no specific target audience (Open to everyone)
            matchesCommunity = true;
        } else if (userStatuses.length === 0) {
            // Case 3: User has no status defined, we show them everything (default behavior)
            matchesCommunity = true;
        } else {
            // Check if any of the user's statuses exist in the group's target statuses
            matchesCommunity = userStatuses.some(userStatus => groupStatuses.includes(userStatus));
        }
        
        // Check registration and capacity
        const notRegistered = !registeredGroupIds.includes(group.id);
        const currentParticipants = participantCounts.get(group.id) || 0;
        const notFull = currentParticipants < group.max_participants;
        
        return matchesCommunity && notRegistered && notFull;
      }) || [];

      setAvailableGroups(filtered);
      setLoading(false);
  }, [showAllGroups, supabase]); // Dependencies for useCallback

  // UseEffect handles both initial fetch and Realtime subscription
  useEffect(() => {
    fetchGroups();

    // Helper to debounce updates (prevents UI freeze when many updates happen at once)
    const handleRealtimeUpdate = (payload: any) => {
      console.log('Realtime update received:', payload.eventType);
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(() => {
        fetchGroups();
      }, 1000); // Wait 1 second after last event before refetching
    };

    // Set up Realtime listener
    const channel = supabase.channel('groups-page-realtime')
      // Listen for changes in 'groups' table (Insert/Update/Delete)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        handleRealtimeUpdate
      )
      // Listen for changes in 'group_registrations' (to update participant counts dynamically)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_registrations' },
        handleRealtimeUpdate
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [fetchGroups, supabase]); // Re-run if fetchGroups changes

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
         <Spinner label="טוען קבוצות..." />
      </div>
    );
  }

  return (
    <div className="groups-page-container">
      <Button
        className="filter-button"
        variant="secondary-light"
        size="md"
        onClick={() => setShowAllGroups(!showAllGroups)}
      >
        {showAllGroups ? 'הצג קבוצות המתאימות עבורי' : 'הצג את כלל הקבוצות'}
      </Button>
      
      {availableGroups.length === 0 ? (
        <p className="dark-texts">אין כרגע קבוצות זמינות עבורך, מוזמנ/ת לעקוב ולהתעדכן</p>
      ) : (
        <GroupUnregisteredCard groups={availableGroups} />
      )}
    </div>
  );
}