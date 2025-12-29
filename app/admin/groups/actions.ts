'use server'; // Server Actions

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isDateInPast, hasGroupEnded } from "@/lib/date-utils";

// --- Function to update the status of a group (e.g., Open, Ended) ---
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

// ---------------------------------------------------------------

// --- Function to (permanently) delete a group AND its image ---
export async function deleteGroup(groupId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Fetch the group first to get the image URL
    // We select only the 'image_url' field to be efficient
    const { data: group, error: fetchError } = await supabase
      .from('groups')
      .select('image_url')
      .eq('id', groupId)
      .single();

    if (fetchError) {
      console.error('Error fetching group before delete:', fetchError);
    }

    // Delete all registrations associated with this group
    const { error: registrationError } = await supabase
      .from('group_registrations') 
      .delete()
      .eq('group_id', groupId);

    if (registrationError) {
        console.error('Error deleting group registrations:', registrationError);
    }
    
    // If the group has an image, delete it from Storage
    if (group?.image_url) {
      console.log("Deleting associated image...", group.image_url);
      await deleteImage(group.image_url);
    }

    // Delete the group record from the Database
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

// ---------------------------------------------------------------

// --- Function to update all group details (Edit Form) ---
export async function updateGroupDetails(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- Prevent past dates ---
  const dateStr = formData.get('date') as string;
  
  if (isDateInPast(dateStr)) {
      return { success: false };
  }

  // --- Calculate meeting_day automatically from the date ---
  const startDateObj = new Date(dateStr);
  const calculatedMeetingDay = startDateObj.getDay(); // Returns 0 (Sunday) - 6 (Saturday)

  // --- Parse the community_status_json to an array ---
  const communityStatusJson = formData.get('community_status_json') as string;
  let communityStatusArray: string[] = [];
  try {
    if (communityStatusJson) {
        communityStatusArray = JSON.parse(communityStatusJson);
    }
  } catch (e) {
      console.error("Error parsing community_status_json", e);
      // Fallback to empty array if parsing fails
      communityStatusArray = []; 
  }

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
  
  const updates = {
    name: formData.get('name'),
    mentor: formData.get('mentor'),
    description: formData.get('description'),
    date: formData.get('date'), // Start Date
    registration_end_date: formData.get('registration_end_date'),
    max_participants: formData.get('max_participants'),
    whatsapp_link: formData.get('whatsapp_link'),
    image_url: finalImageUrl, // Use the updated (or existing) URL
    meeting_day: calculatedMeetingDay,
    meeting_time: formData.get('meeting_time'),
    meetings_count: parseInt(formData.get('meetings_count') as string),
    community_status: communityStatusArray,
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

// ---------------------------------------------------------------

// --- Function to create a NEW group ---
export async function createGroup(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // --- Prevent past dates ---
  const dateStr = formData.get('date') as string;
  
  if (isDateInPast(dateStr)) {
      return { success: false };
  }

  // --- Calculate meeting_day automatically from the date ---
  const startDateObj = new Date(dateStr);
  const calculatedMeetingDay = startDateObj.getDay(); // Returns 0 (Sunday) - 6 (Saturday)

  // --- Parse the community_status_json to an array ---
  const communityStatusJson = formData.get('community_status_json') as string;
  let communityStatusArray: string[] = [];
  try {
    if (communityStatusJson) {
        communityStatusArray = JSON.parse(communityStatusJson);
    }
  } catch (e) {
      console.error("Error parsing community_status_json", e);
      // Fallback to empty array if parsing fails
      communityStatusArray = []; 
  }

  // Determine the initial status based on which button was clicked
  const actionType = formData.get('submitAction'); 
  const initialStatus = actionType === 'publish' ? 'open' : 'draft';

  // For uploading image file (if any)
  const imageFile = formData.get('image') as File;
  const imageUrl = await uploadImage(imageFile);

  const newGroup = {
    name: formData.get('name'),
    description: formData.get('description'),
    mentor: formData.get('mentor'),
    image_url: imageUrl,
    date: formData.get('date'),
    registration_end_date: formData.get('registration_end_date'),
    max_participants: formData.get('max_participants'),
    whatsapp_link: formData.get('whatsapp_link'),
    status: initialStatus,
    meeting_day: calculatedMeetingDay,
    meeting_time: formData.get('meeting_time'),
    meetings_count: parseInt(formData.get('meetings_count') as string),
    community_status: communityStatusArray,
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

// ---------------------------------------------------------------

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
        .from('group-images')
        .upload(fileName, file);

    if (error) {
        console.error('Image upload failed:', error);
        return null;
    }
    const { data } = supabase
        .storage
        .from('group-images')
        .getPublicUrl(fileName);

  return data.publicUrl;
}

// ---------------------------------------------------------------

// --- Helper Function to delete an old image ---
async function deleteImage(imageUrl: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Extract the filename from the full URL
    // URL format example: .../group-images/123456-image.png
    const parts = imageUrl.split('/');
    const fileName = parts[parts.length - 1]; // Get the last part

    if (!fileName) return;

    const { error } = await supabase
      .storage
      .from('group-images')
      .remove([fileName]);
      
    if (error) {
      console.error('Error deleting old image:', error);
    }
    
  } catch (err) {
    console.error('Delete image exception:', err);
  }
}

// ---------------------------------------------------------------

// --- Function: Check for expired groups and update status to 'ended' ---
export async function checkAndCloseExpiredGroups() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch all groups that are currently 'open'
  const { data: activeGroups, error } = await supabase
    .from('groups')
    .select('*')
    .in('status', ['open']);

  if (error || !activeGroups) return;

  const expiredGroupIds: string[] = [];

  // 2. Iterate and check dates using the shared utility function
  for (const group of activeGroups) {
    // We use the same logic as the frontend to determine if a group has ended
    if (hasGroupEnded(group.date, group.meetings_count)) {
       expiredGroupIds.push(group.id);
    }
  }

  // 3. Perform the update in the Database
  if (expiredGroupIds.length > 0) {
    console.log(`Auto-ending ${expiredGroupIds.length} groups...`);
    
    const { error: updateError } = await supabase
      .from('groups')
      .update({ status: 'ended' }) // Update status to 'ended'
      .in('id', expiredGroupIds);

    if (updateError) {
      console.error('Error auto-ending groups:', updateError);
    } else {
      // Refresh the cache to show updated statuses immediately
      revalidatePath('/admin/groups');
    }
  }
}

// ---------------------------------------------------------------

// --- Function to update registration status (Approve/Reject) ---
export async function updateRegistrationStatus(registrationId: string, newStatus: 'approved' | 'rejected') {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // First, get the registration details to find user_id and group_id
    const { data: registration, error: fetchError } = await supabase
      .from('group_registrations')
      .select('user_id, group_id')
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      console.error('Error fetching registration:', fetchError);
      throw new Error('Failed to fetch registration details');
    }

    // Update the registration status
    const { error } = await supabase
      .from('group_registrations')
      .update({ status: newStatus })
      .eq('id', registrationId);

    if (error) {
      console.error('Error updating registration status:', error);
      throw new Error('Failed to update registration status');
    }

    // Get group name for notification
    const { data: group } = await supabase
      .from('groups')
      .select('name')
      .eq('id', registration.group_id)
      .single();

    const groupName = group?.name || 'הקבוצה';

    // Create notification based on status
    if (newStatus === 'approved') {
      const notificationMessage = `הבקשה שלך להצטרף לקבוצה ${groupName} אושרה`;

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: registration.user_id,
          type: 'group_approved',
          message: notificationMessage,
          related_id: registration.group_id,
          is_read: false
        }]);

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the whole operation if notification fails
      }
    }

    // Refresh the specific page to show the updated list immediately
    // We use a wildcard to refresh any page under admin/requests
    revalidatePath('/admin/requests/[id]', 'page'); 
    revalidatePath('/participants'); // Also refresh participants page to show new notifications
    return { success: true };

  } catch (error) {
    console.error('Action Error:', error);
    return { success: false };
  }
}