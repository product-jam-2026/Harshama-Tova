import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import RequestsView from "./components/RequestsView";
import AdminNavBar from "@/app/admin/components/AdminNavBar";

export default async function RequestsDashboard() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- OPTIMIZATION: Fetch pending regs AND groups in parallel ---
  const [pendingResult, groupsResult] = await Promise.all([
    // 1. Fetch all pending registrations
    supabase
      .from('group_registrations')
      .select('*')
      .eq('status', 'pending'),

    // 2. Fetch all groups (lightweight fetch - only needed fields)
    supabase
      .from('groups')
      .select('*')
  ]);

  const { data: pendingRegs, error: pendingError } = pendingResult;
  const { data: allGroups, error: groupsError } = groupsResult;

  if (pendingError) console.error("Error fetching pending regs:", pendingError);
  if (groupsError) console.error("Error fetching groups:", groupsError);

  return (
    <div>
      <Suspense fallback={<div style={{ minHeight: 52 }} />}>
        <AdminNavBar activeTab="requests" />
      </Suspense>

      <RequestsView 
        groups={allGroups || []} 
        pendingRegistrations={pendingRegs || []} 
      />
    </div>
  );
}