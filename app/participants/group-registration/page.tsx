'use client';

import { createClient } from '@/lib/supabase/client';
import GroupUnregisteredCard from '@/app/participants/components/GroupUnregisteredCard';
import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/Button';
import Spinner from "@/components/Spinner";

export default function GroupsPage() {
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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

      // Determine user's community status
      const userCommunityStatus = userData?.community_status || null;

      // Get list of group IDs the user is already registered for
      const registeredGroupIds = userRegistrations?.map((r: any) => r.group_id) || [];

      // Count participants per group
      const participantCounts = new Map<string, number>();
      approvedRegistrations?.forEach((reg: any) => {
        participantCounts.set(reg.group_id, (participantCounts.get(reg.group_id) || 0) + 1);
      });

      // Filter groups
      const filtered = groups?.filter((group: any) => {
        // Community matching logic
        let matchesCommunity = false;
        if (showAllGroups) {
          matchesCommunity = true;
        } else if (!userCommunityStatus) {
          matchesCommunity = true;
        } else if (!group.community_status || (Array.isArray(group.community_status) && group.community_status.length === 0)) {
          matchesCommunity = true;
        } else if (Array.isArray(group.community_status)) {
          matchesCommunity = group.community_status.includes(userCommunityStatus);
        } else if (typeof group.community_status === 'string') {
          matchesCommunity = group.community_status === userCommunityStatus;
        }
        
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

    // Set up Realtime listener
    const channel = supabase.channel('groups-page-realtime')
      // Listen for changes in 'groups' table (Insert/Update/Delete)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        (payload) => {
          console.log('Realtime update: Groups table changed', payload);
          fetchGroups(); // Re-fetch data
        }
      )
      // Listen for changes in 'group_registrations' (to update participant counts dynamically)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_registrations' },
        (payload) => {
          console.log('Realtime update: Registrations changed', payload);
          fetchGroups(); // Re-fetch data
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGroups, supabase]); // Re-run if fetchGroups changes

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
         <Spinner label="טוען קבוצות..." />
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={() => setShowAllGroups(!showAllGroups)}
      >
        {showAllGroups ? 'הצג קבוצות המתאימות עבורי' : 'הצג את כלל הקבוצות'}
      </Button>
      
      {availableGroups.length === 0 ? (
        <div>אין כרגע קבוצות זמינות עבורכם, מוזמנים לעקוב ולהתעדכן</div>
      ) : (
        <GroupUnregisteredCard groups={availableGroups} />
      )}
    </div>
  );
}