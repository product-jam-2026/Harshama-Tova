'use server'; // Server Actions

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Function to update the status of a group (e.g., Open, Close)
export async function updateGroupStatus(groupId: string, newStatus: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { error } = await supabase
      .from('groups')
      .update({ status: newStatus })
      .eq('id', groupId);

    if (error) {
      console.error('Error updating status:', error);
      throw new Error('Failed to update group status');
    }

    // Refresh the groups page data so the user sees the change immediately
    revalidatePath('/admin/groups');
    return { success: true };
    
  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false };
  }
}

// Function to (permanently) delete a group
export async function deleteGroup(groupId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting group:', error);
      throw new Error('Failed to delete group');
    }

    // Refresh the page to remove the deleted item from the list
    revalidatePath('/admin/groups');
    return { success: true };

  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false };
  }
}

// Function to update all group details (Edit Form)
export async function updateGroupDetails(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Extract data from the form
  const id = formData.get('id') as string;
  
  const updates = {
    name: formData.get('name'),
    mentor: formData.get('mentor'),
    description: formData.get('description'),
    date: formData.get('date'), // Start Date
    registration_end_date: formData.get('registration_end_date'),
    max_participants: formData.get('max_participants'),
    whatsapp_link: formData.get('whatsapp_link'),
    image_url: formData.get('image_url'),
    meeting_day: parseInt(formData.get('meeting_day') as string), 
    meeting_time: formData.get('meeting_time'),
  };

  try {
    const { error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating group details:', error);
      throw new Error('Failed to update group');
    }

    // Refresh the groups list and the specific group page
    revalidatePath('/admin/groups');
    return { success: true };

  } catch (error) {
    console.error('Update Action Error:', error);
    return { success: false };
  }
}

// Function to create a NEW group
export async function createGroup(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Determine the initial status based on which button was clicked
  const actionType = formData.get('submitAction'); 
  const initialStatus = actionType === 'publish' ? 'open' : 'draft';

  const newGroup = {
    name: formData.get('name'),
    description: formData.get('description'),
    mentor: formData.get('mentor'),
    image_url: formData.get('image_url'), 
    date: formData.get('date'),
    registration_end_date: formData.get('registration_end_date'),
    max_participants: formData.get('max_participants'),
    whatsapp_link: formData.get('whatsapp_link'),
    status: initialStatus,
    
    // --- New Fields ---
    meeting_day: parseInt(formData.get('meeting_day') as string), 
    meeting_time: formData.get('meeting_time'),
  };

  try {
    const { error } = await supabase
      .from('groups')
      .insert([newGroup]);

    if (error) {
      console.error('Error creating group:', error);
      throw new Error('Failed to create group');
    }

    // Refresh the admin dashboard to show the new group
    revalidatePath('/admin/groups');
    return { success: true };

  } catch (error) {
    console.error('Create Action Error:', error);
    return { success: false };
  }
}