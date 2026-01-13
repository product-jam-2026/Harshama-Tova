'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Interface for all registration data
interface RegistrationData {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  birthDate: string;
  gender: string;
  communityStatus: string[];
  comments?: string;
}

export async function completeRegistration(data: RegistrationData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'יוזר לא מאומת' };
  }

  try {
    // Calculate age
    const birth = new Date(data.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    // Prepare update object
    const updates = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.phone,
      city: data.city,
      birth_date: data.birthDate,
      gender: data.gender,
      community_status: data.communityStatus,
      age: age,
      email: user.email,
      comments: data.comments || ''
    };

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    let error;

    if (existingUser) {
      // Update
      const res = await supabase.from('users').update(updates).eq('id', user.id);
      error = res.error;
    } else {
      // Insert
      const res = await supabase.from('users').insert([{ id: user.id, ...updates }]);
      error = res.error;
    }

    if (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }

    // Revalidate the main participants page so data appears instantly
    revalidatePath('/participants');
    return { success: true };

  } catch (error) {
    console.error('Complete registration error:', error);
    return { success: false, error: 'שמירת המידע נכשלה' };
  }
}