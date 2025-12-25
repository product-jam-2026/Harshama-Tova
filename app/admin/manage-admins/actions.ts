'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Adding a new admin
export async function addAdmin(email: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Double-check user authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Normalize email: lowercase and trim spaces
  const cleanEmail = email.toLowerCase().trim();

  const { error } = await supabase
    .from('admin_list')
    .insert([{ email: cleanEmail }]);

  if (error) {
    // Handle duplicate email error
    if (error.code === '23505') return { error: 'המייל הזה כבר מוגדר כמנהלת' };
    return { error: 'שגיאה בהוספת המנהלת' };
  }

  // Revalidate the page to show the updated list
  revalidatePath('/admin/manage-admins');
  return { success: true };
}

// Removing an admin
export async function removeAdmin(adminId: string, emailToRemove: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // --- Prevent self-removal ---
  if (user.email?.toLowerCase() === emailToRemove.toLowerCase()) {
    return { error: 'לא ניתן להסיר את עצמך מניהול.' };
  }

  const { error } = await supabase
    .from('admin_list')
    .delete()
    .eq('id', adminId);

  if (error) return { error: 'שגיאה במחיקת המנהלת' };

  revalidatePath('/admin/manage-admins');
  return { success: true };
}