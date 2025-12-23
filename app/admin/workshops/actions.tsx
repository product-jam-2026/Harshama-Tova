'use server'; // Server Actions

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// --- Helper to calculate day of week (0=Sunday, 6=Saturday) ---
function getDayOfWeek(dateString: string): number {
  const date = new Date(dateString);
  return date.getDay();
}

// --- Function to update the status of a workshop ---
export async function updateWorkshopStatus(workshopId: string, newStatus: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { error } = await supabase
      .from('workshops')
      .update({ status: newStatus })
      .eq('id', workshopId);

    if (error) {
      console.error('Error updating status:', error);
      throw new Error('Failed to update workshop status');
    }

    // Refresh the workshops page data so the user sees the change immediately
    revalidatePath('/admin/workshops');
    return { success: true };
    
  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false };
  }
}

// --- Function to (permanently) delete a workshop AND its image ---
export async function deleteWorkshop(workshopId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Fetch the workshop first to get the image URL
    // We select only the 'image_url' field to be efficient
    const { data: workshop, error: fetchError } = await supabase
      .from('workshops')
      .select('image_url')
      .eq('id', workshopId)
      .single();

    if (fetchError) {
      console.error('Error fetching workshop before delete:', fetchError);
    }

    // Delete all registrations associated with this workshop
    const { error: registrationError } = await supabase
      .from('workshop_registrations') 
      .delete()
      .eq('workshop_id', workshopId);

    if (registrationError) {
        console.error('Error deleting workshop registrations:', registrationError);
    }
    
    // If the workshop has an image, delete it from Storage
    if (workshop?.image_url) {
      console.log("Deleting associated image...", workshop.image_url);
      await deleteImage(workshop.image_url);
    }

    // Delete the workshop record from the Database
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', workshopId);

    if (error) {
      console.error('Error deleting workshop:', error);
      throw new Error('Failed to delete workshop');
    }

    // Refresh the page to remove the deleted item from the list
    revalidatePath('/admin/workshops');
    return { success: true };

  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false };
  }
}

// --- Function to update all workshop details (Edit Form) ---
export async function updateWorkshopDetails(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Extract data from the form
  const id = formData.get('id') as string;
  const existingImageUrl = formData.get('existing_image_url') as string;
  const imageFile = formData.get('image') as File;

  // Logic to handle image update
  let finalImageUrl = existingImageUrl; // Default to the existing image

  // Try to upload the new image
  const newUploadedUrl = await uploadImage(imageFile);

  // If a new image was successfully uploaded
  if (newUploadedUrl) {
      finalImageUrl = newUploadedUrl;

      // Delete the old image from storage to save space
      if (existingImageUrl) {
          await deleteImage(existingImageUrl);
      }
  }

  // --- AUTOMATIC DAY CALCULATION ---
  const rawDate = formData.get('date') as string;
  const calculatedDay = getDayOfWeek(rawDate); // Returns 0-6
  
  const updates = {
    name: formData.get('name'),
    mentor: formData.get('mentor'),
    description: formData.get('description'),
    date: rawDate, 
    meeting_day: calculatedDay, // Automatically updated based on the date
    meeting_time: formData.get('meeting_time'), 
    registration_end_date: formData.get('registration_end_date'),
    max_participants: formData.get('max_participants'),
    image_url: finalImageUrl, 
  };

  try {
    const { error } = await supabase
      .from('workshops')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating workshop details:', error);
      throw new Error('Failed to update workshop');
    }

    // Refresh the workshops list
    revalidatePath('/admin/workshops');
    return { success: true };

  } catch (error) {
    console.error('Update Action Error:', error);
    return { success: false };
  }
}

// --- Function to create a NEW workshop ---
export async function createWorkshop(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Determine the initial status based on which button was clicked
  const actionType = formData.get('submitAction'); 
  const initialStatus = actionType === 'publish' ? 'open' : 'draft';

  // For uploading image file (if any)
  const imageFile = formData.get('image') as File;
  const imageUrl = await uploadImage(imageFile);

  // --- AUTOMATIC DAY CALCULATION ---
  const rawDate = formData.get('date') as string;
  const calculatedDay = getDayOfWeek(rawDate); // Returns 0-6

  const newWorkshop = {
    name: formData.get('name'),
    description: formData.get('description'),
    mentor: formData.get('mentor'),
    image_url: imageUrl,
    date: rawDate, 
    meeting_day: calculatedDay, // Automatically saved
    meeting_time: formData.get('meeting_time'), 
    registration_end_date: formData.get('registration_end_date'),
    max_participants: formData.get('max_participants'),
    status: initialStatus,
  };

  try {
    const { error } = await supabase
      .from('workshops')
      .insert([newWorkshop]);

    if (error) {
      console.error('Error creating workshop:', error);
      throw new Error('Failed to create workshop');
    }

    // Refresh the admin dashboard to show the new workshop
    revalidatePath('/admin/workshops');
    return { success: true };

  } catch (error) {
    console.error('Create Action Error:', error);
    return { success: false };
  }
}

// --- Helper Function to upload image ---
async function uploadImage(file: File) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check if the file is valid
    if (!file || file.size === 0 || file.name === 'undefined') return null;

    // create a unique filename (add a date to avoid duplicates)
    const fileName = `${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { error } = await supabase
        .storage
        .from('workshop-images') 
        .upload(fileName, file);

    if (error) {
        console.error('Image upload failed:', error);
        return null;
    }
    const { data } = supabase
        .storage
        .from('workshop-images')
        .getPublicUrl(fileName);

  return data.publicUrl;
}

// --- Helper Function to delete an old image ---
async function deleteImage(imageUrl: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Extract the filename from the full URL
    const parts = imageUrl.split('/');
    const fileName = parts[parts.length - 1]; // Get the last part

    if (!fileName) return;

    const { error } = await supabase
      .storage
      .from('workshop-images')
      .remove([fileName]);
      
    if (error) {
      console.error('Error deleting old image:', error);
    }
    
  } catch (err) {
    console.error('Delete image exception:', err);
  }
}

// --- Function: Check for expired workshops and update status to 'ended' ---
export async function checkAndCloseExpiredWorkshops() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const now = new Date();

  // 1. Fetch all workshops that are currently 'open'
  const { data: activeWorkshops, error } = await supabase
    .from('workshops')
    .select('*')
    .in('status', ['open']);

  if (error || !activeWorkshops) return;

  const expiredWorkshopIds: string[] = [];

  // 2. Iterate and check the dates
  for (const workshop of activeWorkshops) {
    if (workshop.date) {
      const workshopDate = new Date(workshop.date);
      
      // 3. If the date has passed, it's ended.
      if (now > workshopDate) {
        expiredWorkshopIds.push(workshop.id);
      }
    }
  }

  // 4. Perform the update in the Database
  if (expiredWorkshopIds.length > 0) {
    console.log(`Auto-ending ${expiredWorkshopIds.length} workshops...`);
    
    const { error: updateError } = await supabase
      .from('workshops')
      .update({ status: 'ended' }) // Update status to 'ended'
      .in('id', expiredWorkshopIds);

    if (updateError) {
      console.error('Error auto-ending workshops:', updateError);
    } else {
      // Refresh the cache to show updated statuses immediately
      revalidatePath('/admin/workshops');
    }
  }
}