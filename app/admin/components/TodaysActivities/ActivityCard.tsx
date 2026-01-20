import React from 'react';
import { COMMUNITY_STATUSES } from '@/lib/constants';
import Badge from '@/components/Badges/Badge';
import styles from './ActivityCard.module.css';

interface ActivityCardProps {
  id: string;
  title: string;
  time: string;
  mentor: string | null;
  audience: string[];
  type: 'Group' | 'Workshop';
}

export default function ActivityCard({ 
  title, 
  time, 
  mentor, 
  audience, 
  type 
}: ActivityCardProps) {

  // --- Map audience values to localized Hebrew labels ---
  const formatAudience = (statuses: string[]) => {
    if (!statuses || statuses.length === 0) return '';

    if (statuses.length === COMMUNITY_STATUSES.length) {
      return 'מיועד לכולם';
    }

    return statuses.map((statusValue) => {
      const statusObj = COMMUNITY_STATUSES.find(s => s.value === statusValue);
      return statusObj ? statusObj.label : statusValue;
    }).join(', ');
  };

  const audienceLabel = formatAudience(audience);

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardContent}>
        
        {/* Right Column: Main Text Information */}
        <div className={styles.rightColumn}>
          <span className={styles.title} title={title}>
            {title}
          </span>

          <span className={`sadot ${styles.audienceLabel}`}>
            {audienceLabel}
          </span>

          <div className={styles.mentorContainer}>
            {/* Updated to use the imported MentorIcon from public/icons */}
            <img 
              src="/icons/BlackMentorIcon.svg" 
              alt="מנחה" 
              width="14" 
              height="14" 
            />
            
            <span className={`sadot ${styles.mentorName}`}>
              {mentor || ''}
            </span>
          </div>
        </div>

        {/* Left Column: Status Badge and Time stacked vertically */}
        <div className={styles.leftColumn}>
          <Badge variant={type === 'Group' ? 'green' : 'purple'}>
            {type === 'Group' ? 'קבוצה' : 'סדנה'}
          </Badge>
          
          <Badge variant="white">
              {time}
          </Badge>
        </div>

      </div>
    </div>
  );
}