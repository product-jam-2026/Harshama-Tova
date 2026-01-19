import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import AdminList from './AdminList';
import BackButton from '@/components/buttons/BackButton';

export default async function ManageAdminsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Taking the current user info
  const { data: { user } } = await supabase.auth.getUser();

  // Taking the list of admins
  const { data: admins } = await supabase
    .from('admin_list')
    .select('*');

  return (
    <div>
      <div>
        <BackButton href="/admin" />
      </div>

      <AdminList 
        admins={admins || []} 
        currentUserEmail={user?.email} 
      />
    </div>
  );
}