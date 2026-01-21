'use client';

import { useRouter } from 'next/navigation';
import { updateGroupStatus, deleteGroup } from '../actions';
import { formatSchedule } from '@/lib/utils/date-utils';
import Link from "next/link";
import { useRef, useState, useEffect } from 'react';
import { confirmAndExecute } from "@/lib/utils/toast-utils";
import Button from '@/components/buttons/Button'; 
import Badge from '@/components/Badges/Badge';
import ProgressBar from '@/components/Badges/ProgressBar'; 
import styles from '@/app/admin/components/AdminCard.module.css';

// Define the Group structure (match DB fields)
export interface Group {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  mentor: string;
  status: string; 
  date: string; 
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
  onEdit?: () => void;
}

// --- Helper function: Check if group has finished (all meetings passed) ---
const isGroupFinished = (group: Group) => {
  if (!group.date) return false;
  
  const now = new Date();
  const startDate = new Date(group.date);
  
  // Calculate the date of the last meeting
  // Assuming weekly meetings: Last Date = Start Date + ((Count - 1) * 7 days)
  const weeksDuration = (group.meetings_count > 0 ? group.meetings_count - 1 : 0);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (weeksDuration * 7));

  // If a specific meeting time exists, set the hours and minutes
  if (group.meeting_time) {
      const [hours, minutes] = group.meeting_time.split(':').map(Number);
      endDate.setHours(hours, minutes, 0, 0);
  } else {
      // If no time is specified, assume end of day
      endDate.setHours(23, 59, 59, 999);
  }

  // Returns true only if the current time is strictly after the last meeting start time
  return now > endDate;
};

export default function AdminGroupCard({ group, pendingCount = 0, onEdit }: AdminGroupCardProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [needsReadMore, setNeedsReadMore] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  
    // Determine if the group is effectively "ended" (either by status OR by date calculation)
    const isEnded = group.status === 'ended' || isGroupFinished(group);

    useEffect(() => {
      const element = descriptionRef.current;
      if (element && element.scrollHeight > element.clientHeight + 1) {
        setNeedsReadMore(true);
      }
    }, [group.description]);
  
    const toggleExpanded = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(prev => !prev);
    };

  // Actions Handlers
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await confirmAndExecute({
      confirmMessage: 'האם לפרסם את הקבוצה? לאחר הפרסום משתמשים יוכלו להירשם לקבוצה',
      action: async () => await updateGroupStatus(group.id, 'open'),
      successMessage: 'הקבוצה פורסמה בהצלחה',
      errorMessage: 'שגיאה בפרסום הקבוצה'
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      // If the group is ended (status or date), append ?restore=true to URL
      const url = `/admin/groups/${group.id}/edit${isEnded ? '?restore=true' : ''}`;
      router.push(url);
    }
  };

  // Calculate Participants
  const currentParticipants = group.participants_count || 0;
  const maxParticipants = group.max_participants || 1; 

  return (
    <div className={styles.card}>
      
      {/* Top Section: Image + Text Details */}
      <div className={styles.topSection}>
          
          {/* Image Block (Right side) */}
          <div className={styles.imageContainer}>
              {group.image_url ? (
                  <img src={group.image_url} alt={group.name} className={styles.image} />
              ) : (
                  <div className={styles.noImage}>אין תמונה</div>
              )}
          </div>

          {/* Text Details Column (Left side) */}
          <div className={styles.textColumn}>
              <h2 className={styles.title} title={group.name}>
                  {group.name}
              </h2>

              <p 
                  ref={descriptionRef}
                  className={`${styles.description} ${isExpanded ? styles.expanded : styles.clamped}`}
              >
                  {group.description}
              </p>
              {needsReadMore && (
                  <button onClick={toggleExpanded} className={styles.readMoreBtn}>
                      {isExpanded ? 'קרא פחות' : 'קרא עוד'}
                  </button>
              )}            

              <div className={styles.mentorContainer}>
                  <img 
                    src="/icons/BlackMentorIcon.svg" 
                    alt="מנחה" 
                    width="14" 
                    height="14" 
                  />
                  <span className={styles.mentorName}>
                      {group.mentor}
                  </span>
              </div>

              <div className={styles.badgesRow}>
                  <Badge variant="white">
                      {new Date(group.date).toLocaleDateString('he-IL')}
                  </Badge>
                  <Badge variant="white">
                      {formatSchedule(group.meeting_day, group.meeting_time)}
                  </Badge>
              </div>
          </div>
      </div>

      {/* Middle Section: Progress Bar (Using Component) */}
      {/* Added margin-top style to create spacing from top section similar to CSS class */}
      <div style={{ marginTop: '0.5rem' }}> 
        <ProgressBar 
            current={currentParticipants} 
            max={maxParticipants} 
            href={`/admin/groups/${group.id}/participants`}
        />
      </div>

      {/* Bottom Section: Actions */}
      <div className={styles.actionsWrapper}>
          
          {/* Special Actions: Publish or Pending Requests */}
          {group.status === 'draft' ? (
              <Button variant="primary" onClick={handlePublish}>
                  פרסום
              </Button>
          ) : (
             /* If there are pending requests, show a link (Far Right/Start) */
             pendingCount > 0 && (
                <div onClick={(e) => e.stopPropagation()}>
                    <Link href={`/admin/requests/${group.id}`} className={styles.pendingLink}>
                        <Badge variant="green" className={styles.pendingBadgeCustom}>
                             {pendingCount} בקשות
                        </Badge>
                    </Link>
                </div>
             )
          )}

          {/* Spacer to push edit/delete to the left (end) */}
          <div style={{ flex: 1 }}></div>

          {/* Standard Actions */}
          <Button variant="secondary2" onClick={handleEdit}>
              {/* Display "Restore" if ended, otherwise "Edit" */}
              {isEnded ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  שחזור
                </span>
              ) : (
                'עריכה'
              )}
          </Button>

          <Button variant="secondary2" onClick={handleDelete}>
             מחיקה
          </Button>
      </div>

    </div>
  );
}