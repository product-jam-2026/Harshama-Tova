'use client';

import { useRouter } from 'next/navigation';
import { updateGroupStatus, deleteGroup } from '../actions'; // Import the Server Actions
import { formatSchedule } from '@/lib/date-utils';
import { COMMUNITY_STATUSES } from "@/lib/constants";
import Link from "next/link";
import { useRef, useState, useEffect} from 'react';
import { confirmAndExecute } from "@/lib/toast-utils";

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
  community_status: string[];
  participants_count?: number;
  pending_count?: number;
}

interface AdminGroupCardProps {
  group: Group;
  pendingCount?: number;
}

export default function AdminGroupCard({ group, pendingCount = 0 }: AdminGroupCardProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [needsReadMore, setNeedsReadMore] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  
    useEffect(() => {
      const element = descriptionRef.current;
      if (element && element.scrollHeight > element.clientHeight + 1) {
        setNeedsReadMore(true);
      }
    }, [group.description]);
  
    const toggleExpanded = () => {
      setIsExpanded(prev => !prev);
    };

  // Actions Handlers
  const handleDelete = async () => {
    // Determine the warning message based on group status
    const message = group.status === 'open' 
      ? 'שים/י לב: הקבוצה פורסמה. מחיקת הקבוצה תמחק גם את כל ההרשמות של המשתתפים שנרשמו אליה. האם להמשיך?' 
      : 'האם למחוק את הקבוצה? לא יהיה ניתן לשחזר פעולה זו';
      
    await confirmAndExecute({
      confirmMessage: message,
      action: async () => await deleteGroup(group.id),
      successMessage: 'הקבוצה נמחקה בהצלחה',
      errorMessage: 'שגיאה במחיקת הקבוצה'
    });
  };

  const handlePublish = async () => {
    await confirmAndExecute({
      confirmMessage: 'האם לפרסם את הקבוצה? לאחר הפרסום משתמשים יוכלו להירשם לקבוצה',
      action: async () => await updateGroupStatus(group.id, 'open'),
      successMessage: 'הקבוצה פורסמה בהצלחה',
      errorMessage: 'שגיאה בפרסום הקבוצה'
    });
  };

  const handleEdit = () => {
    router.push(`/admin/groups/${group.id}/edit`);
    console.log("Navigate to edit page:", group.id);
  };

  // Handle array of community statuses
  // Save the label for community status (mapped from array to comma-separated string)
  const statusLabels = group.community_status?.map(statusValue => {
      const found = COMMUNITY_STATUSES.find(s => s.value === statusValue);
      return found ? found.label : statusValue;
  }) || [];
  
  let statusDisplay = 'לא הוגדר';

  // Check if the number of selected items equals the total available items
  if (group.community_status?.length === COMMUNITY_STATUSES.length) {
      statusDisplay = "מתאים לכולם";
  } else {
      // Map and join logic as before
      const statusLabels = group.community_status?.map(statusValue => {
          const found = COMMUNITY_STATUSES.find(s => s.value === statusValue);
          return found ? found.label : statusValue;
      }) || [];
      
      if (statusLabels.length > 0) {
          statusDisplay = statusLabels.join(', ');
      }
  }

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
            
            {/* --- Pending Requests Badge (Only visible if count > 0) --- */}
            {pendingCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                    <Link 
                        href={`/admin/requests/${group.id}`} 
                        style={{ textDecoration: 'none' }}
                    >
                        <div style={{ 
                            background: '#FFF4E5',
                            color: '#B45309',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            border: '1px solid #FCD34D',
                            display: 'inline-block'
                        }}>
                            🔔 {pendingCount} בקשות ממתינות לאישור ←
                        </div>
                    </Link>
                </div>
            )}

            {/* Description with Read More */}
            <p 
                ref={descriptionRef}
                className={`group-description ${isExpanded ? 'expanded' : 'clamped'}`}
            >
                {group.description}
            </p>
            {needsReadMore && (
                <button
                    onClick={toggleExpanded}
                    className="read-more-button"
                >
                    {isExpanded ? 'קרא פחות' : 'קרא עוד'}
                </button>
            )}

            <ul>
                <li><strong>מנחה:</strong> {group.mentor}</li>
                <li><strong>תאריך התחלה:</strong> {new Date(group.date).toLocaleDateString('he-IL')}</li>
                <li><strong>מספר מפגשים:</strong> {group.meetings_count}</li>
                <li>{formatSchedule(group.meeting_day, group.meeting_time)}</li>
                <li><strong>קהל יעד:</strong> {statusDisplay}</li>
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