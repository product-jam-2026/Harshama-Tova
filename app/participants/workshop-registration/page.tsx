'use client';

import { createClient } from '@/lib/supabase/client';
import WorkshopUnregisteredCard from '@/app/participants/components/WorkshopUnregisteredCard';
import { useState, useEffect } from 'react';

export default function WorkshopsPage() {
  const [availableWorkshops, setAvailableWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkshops() {
      const supabase = createClient();

      // Getting current user data
      const { data: { user } } = await supabase.auth.getUser();


      // Fetching open workshops
      const { data: workshops } = await supabase
        .from('workshops')
        .select('*')
        .eq('status', 'open')
        .gte('registration_end_date', new Date().toISOString())
        .order('date', { ascending: true });

      // Get user's registrations
      let registeredWorkshopIds: string[] = [];
      if (user) {
        const { data: registrations } = await supabase
          .from('workshop_registrations')
          .select('workshop_id')
          .eq('user_id', user.id);
        
        registeredWorkshopIds = registrations?.map(r => r.workshop_id) || [];
      }

      // Get all approved participants per workshop
      const { data: approvedRegistrations } = await supabase
        .from('workshop_registrations')
        .select('workshop_id');

      // Count participants per workshop
      const participantCounts = new Map<string, number>();
      approvedRegistrations?.forEach(reg => {
        participantCounts.set(reg.workshop_id, (participantCounts.get(reg.workshop_id) || 0) + 1);
      });

      // Filter workshops
      const filtered = workshops?.filter(workshop => {
        const notRegistered = !registeredWorkshopIds.includes(workshop.id);
        const currentParticipants = participantCounts.get(workshop.id) || 0;
        const notFull = currentParticipants < workshop.max_participants;
        return notRegistered && notFull;
      }) || [];

      setAvailableWorkshops(filtered);
      setLoading(false);
    }

    fetchWorkshops();
  }, []);

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <div>
      <WorkshopUnregisteredCard workshops={availableWorkshops} />
    </div>
  );
}