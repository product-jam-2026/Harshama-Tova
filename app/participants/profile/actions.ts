'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(formData: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  birthDate?: string;
  gender?: string;
  communityStatus?: string[];
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'יוזר לא מאומת' };
  }

  try {
    const updateData: any = {};

    if (formData.firstName !== undefined) updateData.first_name = formData.firstName;
    if (formData.lastName !== undefined) updateData.last_name = formData.lastName;
    if (formData.phone !== undefined) updateData.phone_number = formData.phone;
    if (formData.city !== undefined) updateData.city = formData.city;
    if (formData.birthDate !== undefined) {
      updateData.birth_date = formData.birthDate;
      
      // Calculate age from birth date
      const birth = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      updateData.age = age;
    }
    if (formData.gender !== undefined) updateData.gender = formData.gender;
    if (formData.communityStatus !== undefined) updateData.community_status = formData.communityStatus;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }

    // Refresh the profile page
    revalidatePath('/participants/profile');
    revalidatePath('/participants/profile/edit');
    revalidatePath('/participants'); // Refresh the main dashboard
    
    return { success: true };

  } catch (error) {
    console.error('Update user profile error:', error);
    return { success: false, error: 'עדכון המידע נכשל' };
  }
}