'use client';

import { createClient } from '@/lib/supabase/client';
import GroupUnregisteredCard from '@/app/participants/components/GroupUnregisteredCard';
import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/Button';

export default function GroupsPage() {
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Wrap fetchGroups in useCallback so it can be reused in the Realtime listener
  const fetchGroups = useCallback(async () => {

      // Getting current user data
      const { data: { user } } = await supabase.auth.getUser();

      // Get user's community status
      let userCommunityStatus: string | null = null;
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('community_status')
          .eq('id', user.id)
          .single();
        
        userCommunityStatus = userData?.community_status || null;
      }

      // Fetching open groups
      const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .eq('status', 'open')
        .gte('registration_end_date', new Date().toISOString())
        .order('date', { ascending: true });

      // Get user's registrations
      let registeredGroupIds: string[] = [];
      if (user) {
        const { data: registrations } = await supabase
          .from('group_registrations')
          .select('group_id')
          .eq('user_id', user.id);
        
        registeredGroupIds = registrations?.map(r => r.group_id) || [];
      }

      // Get all approved participants per group
      const { data: approvedRegistrations } = await supabase
        .from('group_registrations')
        .select('group_id')
        .in('status', ['approved', 'pending']);

      // Count participants per group
      const participantCounts = new Map<string, number>();
      approvedRegistrations?.forEach(reg => {
        participantCounts.set(reg.group_id, (participantCounts.get(reg.group_id) || 0) + 1);
      });

      // Filter groups
      const filtered = groups?.filter(group => {
        // Community matching logic
        let matchesCommunity = false;
        if (showAllGroups) {
          // Show all groups when toggle is on
          matchesCommunity = true;
        } else if (!userCommunityStatus) {
          // If user has no community status, show all groups
          matchesCommunity = true;
        } else if (!group.community_status || (Array.isArray(group.community_status) && group.community_status.length === 0)) {
          // If group has no community restrictions, show it to everyone
          matchesCommunity = true;
        } else if (Array.isArray(group.community_status)) {
          // Check if user's status is in the group's allowed statuses (array)
          matchesCommunity = group.community_status.includes(userCommunityStatus);
        } else if (typeof group.community_status === 'string') {
          // Handle single string value
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
    return <div>טוען...</div>;
  }

  return (
    <div>
      <Button
        onClick={() => setShowAllGroups(!showAllGroups)}
      >
        {showAllGroups ? 'הצג קבוצות המתאימות עבורי' : 'הצג את כלל הקבוצות'}
      </Button>
      
      {availableGroups.length === 0 ? (
        <div>אין כרגע קבוצות זמינות עבורך, מוזמנ/ת לעקוב ולהתעדכן</div>
      ) : (
        <GroupUnregisteredCard groups={availableGroups} />
      )}
    </div>
  );
}