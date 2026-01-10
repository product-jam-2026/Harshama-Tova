'use client';

import { useRouter } from 'next/navigation';
import { updateWorkshopStatus, deleteWorkshop } from '../actions';
import { DAYS_OF_WEEK } from "@/lib/constants";
import Link from "next/link";
import { useRef, useState, useEffect } from 'react';
import { confirmAndExecute } from "@/lib/utils/toast-utils";
import Button from '@/components/buttons/Button';
import Badge from '@/components/Badges/Badge';
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

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  // --- Actions Handlers ---

  const handleDelete = async () => {
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

  const handlePublish = async () => {
    await confirmAndExecute({
      confirmMessage: 'האם לפרסם את הסדנה? לאחר הפרסום משתמשים יוכלו להירשם לסדנה',
      action: async () => await updateWorkshopStatus(workshop.id, 'open'),
      successMessage: 'הסדנה פורסמה בהצלחה',
      errorMessage: 'שגיאה בפרסום הסדנה'
    });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      router.push(`/admin/workshops/${workshop.id}/edit`);
    }
  };

  // Helper to get Day Label
  const dayLabel = DAYS_OF_WEEK.find(d => d.value === workshop.meeting_day)?.label || '';

  return (
    <div className={styles.card}>
      
      {/* Right Side: Image */}
      <div className={styles.imageContainer}>
          {workshop.image_url ? (
              <img src={workshop.image_url} alt={workshop.name} className={styles.image} />
          ) : (
              <div className={styles.noImage}>
                  אין תמונה
              </div>
          )}
      </div>

      {/* Left Side: Content */}
      <div className={styles.content}>
          
          <div>
            {/* Header: Title & Participants Badge */}
            <div className={styles.headerRow}>
                <h2 className={styles.title}>{workshop.name}</h2>

                <Link 
                    href={`/admin/workshops/${workshop.id}/participants`}
                    style={{ textDecoration: 'none' }}
                >
                    <Badge variant="white" icon={<span>👥</span>}>
                        {workshop.participants_count || 0}/{workshop.max_participants}
                    </Badge>
                </Link>
            </div>

            {/* Description */}
            <p 
                ref={descriptionRef}
                className={`${styles.description} ${isExpanded ? styles.expanded : styles.clamped}`}
            >
                {workshop.description}
            </p>
            {needsReadMore && (
                <button onClick={toggleExpanded} className={styles.readMoreBtn}>
                    {isExpanded ? 'קרא פחות' : 'קרא עוד'}
                </button>
            )}

            {/* Details List */}
            <ul className={styles.detailsList}>
                <li className={styles.detailItem}>מעביר/ה: {workshop.mentor}</li>
                <li className={styles.detailItem}>
                    {dayLabel}, {new Date(workshop.date).toLocaleDateString('he-IL')}
                </li>
                <li className={styles.detailItem}>
                     {workshop.meeting_time?.slice(0, 5) || '-'}
                </li>
            </ul>
          </div>

          {/* Actions Buttons */}
          <div className={styles.actions}>
            {/* Edit Button */}
            <Button 
                variant="primary" 
                size="sm" 
                onClick={handleEdit}
            >
                עריכה
            </Button>

            {/* Publish Button (Only for Drafts) */}
            {workshop.status === 'draft' && (
                <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handlePublish}
                >
                    פרסום
                </Button>
            )}

            {/* Delete Button */}
            <Button 
                variant="primary" 
                size="sm" 
                onClick={handleDelete}
            >
                מחיקה
            </Button>
          </div>

      </div>
    </div>
  );
}