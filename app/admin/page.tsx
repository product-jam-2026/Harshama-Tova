import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './components/AdminDashboardClient'

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Double security check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // --- FETCH ALL DATA IN PARALLEL ---
  const [groupsRes, workshopsRes, groupRegsRes, workshopRegsRes] = await Promise.all([
    supabase.from("groups").select('*').order('created_at', { ascending: false }),
    supabase.from("workshops").select('*').order('created_at', { ascending: false }),
    supabase.from('group_registrations').select('*'),
    supabase.from('workshop_registrations').select('*')
  ]);

  return (
    <AdminDashboardClient 
      initialGroups={groupsRes.data || []}
      initialWorkshops={workshopsRes.data || []}
      initialGroupRegs={groupRegsRes.data || []}
      initialWorkshopRegs={workshopRegsRes.data || []}
    />
  )
}