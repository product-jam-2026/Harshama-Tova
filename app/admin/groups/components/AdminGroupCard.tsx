'use client';

import { useRouter } from 'next/navigation';
import { updateGroupStatus, deleteGroup } from '../actions';
import { formatSchedule } from '@/lib/utils/date-utils';
import { COMMUNITY_STATUSES } from "@/lib/constants";
import Link from "next/link";
import { useRef, useState, useEffect} from 'react';
import { confirmAndExecute } from "@/lib/utils/toast-utils";
import Button from '@/components/buttons/Button'; 
import Badge from '@/components/Badges/Badge';
import styles from '@/app/admin/components/AdminCard.module.css';

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
  onEdit?: () => void;
}

export default function AdminGroupCard({ group, pendingCount = 0, onEdit }: AdminGroupCardProps) {
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
    if (onEdit) {
      onEdit();
    } else {
      router.push(`/admin/groups/${group.id}/edit`);
    }
  };

  // Logic for Status Labels
  let statusDisplay = 'לא הוגדר';

  // Check if the number of selected items equals the total available items
  if (group.community_status?.length === COMMUNITY_STATUSES.length) {
      statusDisplay = "מתאים לכולם";
  } else {
      const labels = group.community_status?.map(statusValue => {
          const found = COMMUNITY_STATUSES.find(s => s.value === statusValue);
          return found ? found.label : statusValue;
      }) || [];
      if (labels.length > 0) {
          statusDisplay = labels.join(', ');
      }
  }

  return (
    <div className={styles.card}>
      
      {/* Right Side: Image */}
      <div className={styles.imageContainer}>
          {group.image_url ? (
              <img src={group.image_url} alt={group.name} className={styles.image} />
          ) : (
              <div className={styles.noImage}>
                  אין תמונה
              </div>
          )}
      </div>

      {/* Left Side: Content */}
      <div className={styles.content}>
          
          <div>
            {/* Header: Title & Participants Count */}
            <div className={styles.headerRow}>
                <h2 className={styles.title}>{group.name}</h2>

                {/* Participants Count Badge */}
                <Link 
                    href={`/admin/groups/${group.id}/participants`}
                >
                    <Badge variant="white" icon={<span>👥</span>}>
                        {group.participants_count || 0}/{group.max_participants}
                    </Badge>
                </Link>
            </div>
            
            {/* Pending Requests Badge */}
            {pendingCount > 0 && (
                <Link 
                    href={`/admin/requests/${group.id}`} 
                >
                    <Badge variant="gray" icon={<span>🔔</span>}>
                         {pendingCount} בקשות
                    </Badge>
                </Link>
            )}

            {/* Description */}
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

            {/* Details List */}
            <ul className={styles.detailsList}>
                <li className={styles.detailItem}> מנחה: {group.mentor}</li>
                <li className={styles.detailItem}>{new Date(group.date).toLocaleDateString('he-IL')}</li>
                <li className={styles.detailItem}>{formatSchedule(group.meeting_day, group.meeting_time)}</li>
            </ul>
          </div>

          {/* Actions Buttons */}
          <div className={styles.actions}>
            {/* Edit Button */}
            <Button 
              variant="primary" 
              onClick={handleEdit}>
                עריכה
            </Button>

            {/* Publish Button (Only for Drafts) */}
            {group.status === 'draft' && (
                <Button 
                  variant="primary" 
                  onClick={handlePublish}>
                    פרסום
                </Button>
            )}

            {/* Delete Button */}
            <Button 
                variant="primary"
                onClick={handleDelete}
            >
                מחיקה
            </Button>
          </div>

      </div>
    </div>
  );
}