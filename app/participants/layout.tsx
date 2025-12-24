import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserNavBar from "@/app/participants/components/UserNavBar";
import ParticipantsRealtimeListener from "@/app/participants/components/RealtimeListener";
import { GenderProvider } from "@/components/GenderProvider";
import IvritaProvider from "@/components/IvritaProvider";

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

  // Fetch user gender for Ivrita
  let userGender: string | null = null;
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('gender')
      .eq('id', user.id)
      .single();
    userGender = data?.gender || null;
  }

  // Render the participant content (children) wrapped in the layout
  return (
    <GenderProvider gender={userGender}>
      <IvritaProvider gender={userGender}>
        <div className="participants-layout">
          <ParticipantsRealtimeListener />
          <UserNavBar /> 
          <main>
              {children}
          </main>

        </div>
      </IvritaProvider>
    </GenderProvider>
  );
}
