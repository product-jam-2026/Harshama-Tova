'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function saveUserNames(firstName: string, lastName: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'יוזר לא מאומת' };
  }

  try {
    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Create new user record
      const { error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          email: user.email,
        }]);

      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/registration');
    return { success: true };

  } catch (error) {
    console.error('Save user names error:', error);
    return { success: false, error: 'שמירת המידע נכשלה' };
  }
}

export async function saveUserPhone(phone: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'יוזר לא מאומת' };
  }

  try {
    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({
          phone_number: phone,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user phone:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Create new user record
      const { error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          phone_number: phone,
          email: user.email,
        }]);

      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/registration');
    return { success: true };

  } catch (error) {
    console.error('Save user phone error:', error);
    return { success: false, error: 'שמירת המידע נכשלה' };
  }
}

export async function saveUserCity(city: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'יוזר לא מאומת' };
  }

  try {
    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({
          city: city,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user city:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Create new user record
      const { error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          city: city,
          email: user.email,
        }]);

      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/registration');
    return { success: true };

  } catch (error) {
    console.error('Save user city error:', error);
    return { success: false, error: 'שמירת המידע נכשלה' };
  }
}

export async function saveUserCommunityStatus(communityStatus: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'יוזר לא מאומת' };
  }

  try {
    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({
          community_status: communityStatus,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user community status:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Create new user record
      const { error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          community_status: communityStatus,
          email: user.email,
        }]);

      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/registration');
    return { success: true };

  } catch (error) {
    console.error('Save user community status error:', error);
    return { success: false, error: 'שמירת המידע נכשלה' };
  }
}

export async function saveUserAgeAndGender(birthDate: string, gender: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { success: false, error: 'יוזר לא מאומת' };
  }

  try {
    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    // Calculate age from birth date
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust age if birthday hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({
          birth_date: birthDate,
          age: age,
          gender: gender,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user age and gender:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Create new user record
      const { error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          birth_date: birthDate,
          age: age,
          gender: gender,
          email: user.email,
        }]);

      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }
    }

    revalidatePath('/registration');
    return { success: true };

  } catch (error) {
    console.error('Save user age and gender error:', error);
    return { success: false, error: 'שמירת המידע נכשלה' };
  }
}

