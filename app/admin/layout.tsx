import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Security check - regular participant should not access admin pages
  // Check 1: Is the user logged in?
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in -> Redirect to login page
    redirect("/login");
  }

  // Check 2: Is the logged-in user an admin?
  const { data: adminProfile } = await supabase
    .from('admin_list')
    .select('*')
    .eq('email', user.email)
    .single();

  if (!adminProfile) {
    // Logged in but not an admin -> Redirect to participant area
    redirect("/participants");
  }

  // If all good, render the admin content (children) wrapped in the layout
  return (
    <div className="admin-layout">
        <main>
            {children}
        </main>
    </div>
  );
}