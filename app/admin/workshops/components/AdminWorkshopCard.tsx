'use client';

import { useRouter } from 'next/navigation';
import { updateWorkshopStatus, deleteWorkshop } from '../actions'; // Import the Workshop Server Actions
import { DAYS_OF_WEEK } from "@/lib/constants";
import Link from "next/link";
import { useRef, useState, useEffect } from 'react';

// Define the Workshop structure
export interface Workshop {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  mentor: string;
  status: string; // 'draft' | 'open' | 'ended'
  date: string; // Specific date
  registration_end_date: string;
  created_at: string;
  max_participants: number;
  meeting_day: number; // 0-6
  meeting_time: string; // "HH:MM"
  participants_count?: number; // Calculated field
}

interface AdminWorkshopCardProps {
  workshop: Workshop;
}

export default function AdminWorkshopCard({ workshop }: AdminWorkshopCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsReadMore, setNeedsReadMore] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const element = descriptionRef.current;
    if (element && element.scrollHeight > element.clientHeight + 1) {
      setNeedsReadMore(true);
    }
  }, [workshop.description]);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  // --- Actions Handlers ---

  const handleDelete = async () => {
    const message = workshop.status === 'open' 
      ? 'שים לב: הסדנה פורסמה. מחיקת הסדנה תמחק גם את כל ההרשמות של המשתתפים לסדנה. האם להמשיך?' 
      : 'האם למחוק את הסדנה? לא יהיה ניתן לשחזר פעולה זו';
      
    if (confirm(message)) {
      await deleteWorkshop(workshop.id);
      console.log("Workshop deleted:", workshop.id);
    }
  };

  const handlePublish = async () => {
    if (confirm('האם לפרסם את הסדנה? לאחר הפרסום משתמשים יוכלו להירשם לסדנה')) {
      await updateWorkshopStatus(workshop.id, 'open');
      console.log("Workshop published:", workshop.id);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/workshops/${workshop.id}/edit`);
    console.log("Navigate to edit page:", workshop.id);
  };

  // Helper to get Day Label (e.g., "Sunday")
  const dayLabel = DAYS_OF_WEEK.find(d => d.value === workshop.meeting_day)?.label || '';

  return (
    <div style={{ border: '1px solid black', padding: '20px', margin: '10px 0', borderRadius: '8px', backgroundColor: 'white' }}>
      
      {/* Header & Image */}
      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* Image Placeholder */}
        <div style={{ width: '100px', height: '100px', background: '#ccc', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            {workshop.image_url ? (
                <img src={workshop.image_url} alt={workshop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                <h2 style={{ marginTop: 0 }}>{workshop.name}</h2>

                {/* Participants Count Link/Badge */}
                <Link 
                    href={`/admin/workshops/${workshop.id}/participants`}
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
                    {/* Icon and Count (Registered / Max) */}
                    <span>👥</span>
                    <span>{workshop.max_participants} / {workshop.participants_count || 0}</span>
                </Link>
            </div>
            
            {/* Description with Read More */}
            <p 
                ref={descriptionRef}
                className={`group-description ${isExpanded ? 'expanded' : 'clamped'}`}
            >
                {workshop.description}
            </p>
            {needsReadMore && (
                <button
                    onClick={toggleExpanded}
                    className="read-more-button"
                >
                    {isExpanded ? 'קרא פחות' : 'קרא עוד'}
                </button>
            )}

            <ul style={{ paddingRight: '20px', lineHeight: '1.6' }}>
                <li><strong>מעביר/ת הסדנה:</strong> {workshop.mentor}</li>
                <li>
                    <strong>מועד הסדנה:</strong> {dayLabel}, {new Date(workshop.date).toLocaleDateString('he-IL')}
                </li>
                <li>
                    <strong>שעה:</strong> {workshop.meeting_time?.slice(0, 5) || '-'}
                </li>
            </ul>
        </div>
      </div>

      {/* Actions Buttons */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        
        {/* Edit is always available */}
        <button onClick={handleEdit} style={{ cursor: 'pointer', padding: '5px 10px' }}>עריכה</button>

        {/* Dynamic Buttons based on Status */}
        {workshop.status === 'draft' && (
            <>
                <button onClick={handlePublish} style={{ cursor: 'pointer', padding: '5px 10px' }}>פרסום הסדנה</button>
            </>
        )}

        {/* Delete button for all statuses */}
        <button onClick={handleDelete} style={{ cursor: 'pointer', padding: '5px 10px', borderStyle: 'solid', borderWidth: '1px' }}>מחיקת הסדנה</button>
      </div>

    </div>
  );
}