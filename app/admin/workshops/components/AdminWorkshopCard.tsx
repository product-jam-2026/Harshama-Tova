'use client';

import { useRouter } from 'next/navigation';
import { updateWorkshopStatus, deleteWorkshop } from '../actions';
import { DAYS_OF_WEEK } from "@/lib/constants";
import { useRef, useState, useEffect } from 'react';
import { confirmAndExecute } from "@/lib/utils/toast-utils";
import Button from '@/components/buttons/Button';
import Badge from '@/components/Badges/Badge';
import ProgressBar from '@/components/Badges/ProgressBar';
import styles from '@/app/admin/components/AdminCard.module.css';

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
  community_status: string[];
}

interface AdminWorkshopCardProps {
  workshop: Workshop;
  onEdit?: () => void;
}

export default function AdminWorkshopCard({ workshop, onEdit }: AdminWorkshopCardProps) {
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

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  // --- Actions Handlers ---

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = workshop.status === 'open' 
      ? 'שים/י לב: הסדנה פורסמה. מחיקת הסדנה תמחק גם את כל ההרשמות של המשתתפים לסדנה. האם להמשיך?' 
      : 'האם למחוק את הסדנה? לא יהיה ניתן לשחזר פעולה זו';
      
    await confirmAndExecute({
      confirmMessage: message,
      action: async () => await deleteWorkshop(workshop.id),
      successMessage: 'הסדנה נמחקה בהצלחה',
      errorMessage: 'שגיאה במחיקת הסדנה'
    });
  };

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await confirmAndExecute({
      confirmMessage: 'האם לפרסם את הסדנה? לאחר הפרסום משתמשים יוכלו להירשם לסדנה',
      action: async () => await updateWorkshopStatus(workshop.id, 'open'),
      successMessage: 'הסדנה פורסמה בהצלחה',
      errorMessage: 'שגיאה בפרסום הסדנה'
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      router.push(`/admin/workshops/${workshop.id}/edit`);
    }
  };

  // Helper to get Day Label
  const dayLabel = DAYS_OF_WEEK.find(d => d.value === workshop.meeting_day)?.label || '';
  const currentParticipants = workshop.participants_count || 0;
  const maxParticipants = workshop.max_participants || 1;

  return (
    <div className={styles.card}>
      
      <div className={styles.topSection}>
          
          <div className={styles.imageContainer}>
              {workshop.image_url ? (
                  <img src={workshop.image_url} alt={workshop.name} className={styles.image} />
              ) : (
                  <div className={styles.noImage}>אין תמונה</div>
              )}
          </div>

          <div className={styles.textColumn}>
              <h2 className={styles.title} title={workshop.name}>
                  {workshop.name}
              </h2>

              <p 
                  ref={descriptionRef}
                  className={`sadot ${styles.description} ${isExpanded ? styles.expanded : styles.clamped}`}
              >
                  {workshop.description}
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
                        {workshop.mentor}
                    </span>
                </Badge>
                <Badge variant="white">
                    {new Date(workshop.date).toLocaleDateString('he-IL')}
                </Badge>
                <Badge variant="white">
                    {dayLabel}, {workshop.meeting_time?.slice(0, 5) || '-'}
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
            href={`/admin/workshops/${workshop.id}/participants`}
        />
      </div>

      <div className={styles.actionsWrapper}>
          
          {workshop.status === 'draft' && (
              <Button variant="primary" onClick={handlePublish}>
                  פרסום
              </Button>
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