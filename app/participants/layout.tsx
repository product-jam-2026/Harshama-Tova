import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserNavBar from "@/app/participants/components/UserNavBar";

export default async function ParticipantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Check if the user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // If not logged in -> Redirect to login page
    redirect("/login");
  }

  // Render the participant content (children) wrapped in the layout
  return (
    <div>
      <UserNavBar /> 
      
      <main>
          {children}
      </main>

    </div>
  );
}
