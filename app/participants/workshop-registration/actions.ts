'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function registerToWorkshop(workshopId: string, comment?: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'יוזר לא מאומת' };
  }

  try {
    // Checking if user is already registered to this workshop
    const { data: existing } = await supabase
      .from('workshop_registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('workshop_id', workshopId)
      .single();

    if (existing) {
      return { success: false, error: 'כבר נרשמת לסדנא זו, מצפים לראותך!' };
    }

    // Insert registration record
    const { error } = await supabase
      .from('workshop_registrations')
      .insert([{
        'user_id': user.id,
        'workshop_id': workshopId,
        comment: comment || null
      }]);

    if (error) {
      console.error('Error registering to workshop:', error);
      return { success: false, error: error.message };
    }

    // Revalidate the main dashboard path so the UI updates immediately
    revalidatePath('/participants');
    return { success: true };

  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'ההרשמה נכשלה' };
  }
}

export async function unregisterFromWorkshop(workshopId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'יוזר לא מאומת' };
  }

  try {
    // Delete registration record
    const { error } = await supabase
      .from('workshop_registrations')
      .delete()
      .eq('user_id', user.id)
      .eq('workshop_id', workshopId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate only the main dashboard path
    revalidatePath('/participants');
    return { success: true };

  } catch (error) {
    return { success: false, error: 'לא הצלחנו לבטל את הרשמתך כעת, יש לנסות שוב מאוחר יותר' };
  }
}