import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Onboarding from "@/components/Onboarding";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Check if registration is fully completed
    const { data: userData } = await supabase
      .from('users')
      .select('age, gender')
      .eq('id', user.id)
      .maybeSingle();
    
    // If user has age and gender, registration is complete - redirect to participants
    if (userData && 
        userData.age !== null && 
        userData.age !== undefined && 
        userData.gender !== null && 
        userData.gender !== undefined && 
        userData.gender !== '') {
      redirect('/participants');
    }
  }
  
  // Show onboarding if user is not logged in or hasn't completed registration
  return <Onboarding />;
}
