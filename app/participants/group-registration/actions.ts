'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function registerToGroup(groupId: string, comment?: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    // Checking if user is already registered to this group
    const { data: existing } = await supabase
      .from('group_registrations')
      .select('id')
      .eq('user-id', user.id)
      .eq('group-id', groupId)
      .single();

    if (existing) {
      return { success: false, error: 'כבר נרשמת לקבוצה זו, מנחי הקבוצה ייצרו עמך קשר' };
    }

    // Insert registration record
    const { error } = await supabase
      .from('group_registrations')
      .insert([{
        'user-id': user.id,
        'group-id': groupId,
        status: 'pending',
        comment: comment || null
      }]);

    if (error) {
      console.error('Error registering to group:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/participants/group-registration');
    return { success: true };

  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Failed to register' };
  }
}
