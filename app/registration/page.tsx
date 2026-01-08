import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RegistrationFlow from './components/RegistrationFlow';

export default async function RegistrationPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get existing user data (Load ONCE)
  const { data: userData } = await supabase
    .from('users')
    .select('first_name, last_name, phone_number, city, birth_date, gender, community_status')
    .eq('id', user.id)
    .single();

  return (
    <div>
      <RegistrationFlow initialData={userData} />
    </div>
  );
}