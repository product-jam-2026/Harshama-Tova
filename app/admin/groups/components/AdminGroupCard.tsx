'use client';

import { useRouter } from 'next/navigation';
import { updateGroupStatus, deleteGroup } from '../actions'; // Import the Server Actions
import { formatSchedule } from '@/lib/date-utils';

// Define the Group structure (match DB fields)
export interface Group {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  mentor: string;
  status: string; // 'draft' | 'open' | 'active' | 'closed'
  date: string; // Start date
  registration_end_date: string;
  created_at: string;
  whatsapp_link: string | null;
  max_participants: number;
  meeting_day: number; // 0 (Sunday) to 6 (Saturday)
  meeting_time: string; // "HH:MM" format
}

interface AdminGroupCardProps {
  group: Group;
}

export default function AdminGroupCard({ group }: AdminGroupCardProps) {
  const router = useRouter();

  // Logic to determine if text is too long (for "Read More")
  const isLongDescription = group.description && group.description.length > 100;
  const descriptionPreview = isLongDescription 
    ? group.description.substring(0, 100) + "..." 
    : group.description;

  // Actions Handlers
  const handleDelete = async () => {
    // We check the status to decide on the confirmation message
    if (confirm('האם למחוק את הקבוצה? לא יהיה ניתן לשחזר פעולה זו')) {
      await deleteGroup(group.id);
      console.log("Group deleted:", group.id);
    }
  };
  
  const handleClose = async () => {
    if (confirm('האם לסגור את הקבוצה?')) {
      await updateGroupStatus(group.id, 'closed');
      console.log("Group closed", group.id);
    }
  };

  const handlePublish = async () => {
    if (confirm('האם לפרסם את הקבוצה? לאחר הפרסום משתמשים יוכלו להירשם לקבוצה')) {
      await updateGroupStatus(group.id, 'open');
      console.log("Group published:", group.id);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/groups/${group.id}/edit`);
    console.log("Navigate to edit page:", group.id);
  };

  return (
    <div style={{ border: '1px solid black', padding: '20px', margin: '10px 0' }}>
      
      {/* Header & Image */}
      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* Image Placeholder */}
        <div style={{ width: '100px', height: '100px', background: '#ccc' }}>
            {group.image_url ? (
                <img src={group.image_url} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <span>אין תמונה</span>
            )}
        </div>

        {/* Details */}
        <div>
            <h2>{group.name}</h2>
            
            {/* Description with Read More */}
            <p>
                {descriptionPreview}
                {isLongDescription && <span style={{ color: 'blue', cursor: 'pointer' }}> (Read More)</span>}
            </p>

            <ul>
                <li><strong>מנחה:</strong> {group.mentor}</li>
                <li><strong>תאריך התחלה:</strong> {new Date(group.date).toLocaleDateString('he-IL')}</li>
                <li>{formatSchedule(group.meeting_day, group.meeting_time)}</li>
            </ul>

            {/* Whatsapp Link */}
            {group.whatsapp_link && (
                <div style={{ marginTop: '10px' }}>
                    <a href={group.whatsapp_link} target="_blank" rel="noopener noreferrer">
                        לינק לקבוצת WhatsApp
                    </a>
                </div>
            )}
        </div>
      </div>

      {/* Actions Buttons */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        
        {/* Edit is always available */}
        <button onClick={handleEdit} style={{ cursor: 'pointer' }}>עריכה</button>

        {/* Dynamic Buttons based on Status */}
        {group.status === 'draft' && (
            <>
                <button onClick={handlePublish} style={{ cursor: 'pointer' }}>פרסום הקבוצה</button>
                <button onClick={handleDelete} style={{ cursor: 'pointer' }}>מחיקת הקבוצה</button>
            </>
        )}

        {(group.status === 'open' || group.status === 'active') && (
            <button onClick={handleClose} style={{ cursor: 'pointer' }}>סגירת קבוצה</button>
        )}

        {group.status === 'closed' && (
            <button onClick={handleDelete} style={{ cursor: 'pointer' }}>מחיקת הקבוצה</button>
        )}
      </div>

    </div>
  );
}