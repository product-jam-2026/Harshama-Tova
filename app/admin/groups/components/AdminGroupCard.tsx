'use client';

import { useRouter } from 'next/navigation';
import { updateGroupStatus, deleteGroup } from '../actions'; // Import the Server Actions
import { formatSchedule } from '@/lib/date-utils';
import { COMMUNITY_STATUSES } from "@/lib/constants";
import Link from "next/link";

// Define the Group structure (match DB fields)
export interface Group {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  mentor: string;
  status: string; // 'draft' | 'open' | 'deleted'
  date: string; // Start date
  registration_end_date: string;
  created_at: string;
  whatsapp_link: string | null;
  max_participants: number;
  meeting_day: number; // 0 (Sunday) to 6 (Saturday)
  meeting_time: string; // "HH:MM" format
  meetings_count: number;
  community_status: string;
  participants_count?: number;
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
    const message = group.status === 'open' 
      ? 'שים לב: הקבוצה פורסמה. מחיקת הקבוצה תמחק גם את כל ההרשמות של המשתתפים שנרשמו אליה. האם להמשיך?' 
      : 'האם למחוק את הקבוצה? לא יהיה ניתן לשחזר פעולה זו';
      
    // We check the status to decide on the confirmation message
    if (confirm(message)) {
      await deleteGroup(group.id);
      console.log("Group deleted:", group.id);
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

  // Save the label for community status in the DB
const statusLabel = COMMUNITY_STATUSES.find(s => s.value === group.community_status)?.label || group.community_status;

  return (
    <div style={{ border: '1px solid black', padding: '20px', margin: '10px 0', borderRadius: '8px', backgroundColor: 'white' }}>
      
      {/* Header & Image */}
      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* Image Placeholder */}
        <div style={{ width: '100px', height: '100px', background: '#ccc', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            {group.image_url ? (
                <img src={group.image_url} alt={group.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                    אין תמונה
                </div>
            )}
        </div>

        {/* Details */}
        <div style={{ flex: 1 }}>
            
            {/* Header with Title and Participants Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ marginTop: 0 }}>{group.name}</h2>

                {/* Participants Count Link/Badge */}
                <Link 
                    href={`/admin/groups/${group.id}/participants`}
                    style={{ 
                        background: '#f0f0f0', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        textDecoration: 'none', 
                        color: '#333', 
                        fontSize: '14px',
                        fontWeight: 'bold',
                        border: '1px solid #ccc',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    {/* Icon and Count */}
                    <span>👥</span>
                    <span>{group.max_participants} / {group.participants_count || 0}</span>
                </Link>
            </div>
            
            {/* Description with Read More */}
            <p>
                {descriptionPreview}
                {isLongDescription && <span style={{ color: 'blue', cursor: 'pointer' }}> קרא עוד</span>}
            </p>

            <ul>
                <li><strong>מנחה:</strong> {group.mentor}</li>
                <li><strong>תאריך התחלה:</strong> {new Date(group.date).toLocaleDateString('he-IL')}</li>
                <li><strong>מספר מפגשים:</strong> {group.meetings_count}</li>
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
            </>
        )}

        {/* Delete button for all statuses */}
        <button onClick={handleDelete} style={{ cursor: 'pointer' }}>מחיקת הקבוצה</button>
      </div>

    </div>
  );
}