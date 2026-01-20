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
  meeting_day: number; 
  meeting_time: string; 
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
  
    const toggleExpanded = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(prev => !prev);
    };

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
      router.push(`/admin/groups/${group.id}/edit`);
    }
  };

  const currentParticipants = group.participants_count || 0;
  const maxParticipants = group.max_participants || 1; 

  return (
    <div className={`${styles.card} ${group.status === 'draft' ? styles.draftCard : ''}`}>
      
      <div className={styles.topSection}>
          
          <div className={styles.imageContainer}>
              {group.image_url ? (
                  <img src={group.image_url} alt={group.name} className={styles.image} />
              ) : (
                  <div className={styles.noImage}>אין תמונה</div>
              )}
          </div>

          <div className={styles.textColumn}>
              <h2 className={styles.title} title={group.name}>
                  {group.name}
              </h2>

              <p 
                  ref={descriptionRef}
                  className={`sadot ${styles.description} ${isExpanded ? styles.expanded : styles.clamped}`}
              >
                  {group.description}
              </p>
              {needsReadMore && (
                  <button onClick={toggleExpanded} className={`sadot ${styles.readMoreBtn}`}>
                      {isExpanded ? 'קרא פחות' : 'קרא עוד'}
                  </button>
              )}            


              <div className={styles.badgesRow}>
                <Badge>
                    <img 
                      src="/icons/BlackMentorIcon.svg" 
                      alt="מנחה" 
                      width="16" 
                      height="16" 
                    />
                    <span>
                        {group.mentor}
                    </span>
                </Badge>
                <Badge variant="white">
                    {new Date(group.date).toLocaleDateString('he-IL')}
                </Badge>
                <Badge variant="white">
                    {formatSchedule(group.meeting_day, group.meeting_time)}
                </Badge>
              </div>
          </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}> 
        <ProgressBar 
            current={currentParticipants} 
            max={maxParticipants} 
            icon={
              <img 
                src="/icons/BlackParticipantsIcon.svg" 
                alt="משתתפים" 
                width="18" 
                height="18" 
              />
            }
            href={`/admin/groups/${group.id}/participants`}
        />
      </div>

      <div className={styles.actionsWrapper}>
          
          {group.status === 'draft' ? (
              <Button variant="primary" onClick={handlePublish}>
                  פרסום
              </Button>
          ) : (
             pendingCount > 0 && (
                <div onClick={(e) => e.stopPropagation()}>
                    <Link href={`/admin/requests/${group.id}`} className={styles.pendingLink}>
                        <Badge variant="green" className={styles.requestsBadge}>
                             {pendingCount} בקשות
                        </Badge>
                    </Link>
                </div>
             )
          )}

          <div style={{ flex: 1 }}></div>

          <Button variant="secondary2" onClick={handleEdit}>
             עריכה
          </Button>

          <Button variant="secondary2" onClick={handleDelete}>
             מחיקה
          </Button>
      </div>

    </div>
  );
}