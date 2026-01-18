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
            {/* Mentor Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 10 13" fill="none">
              <path d="M4.91451 5.32283C6.24585 5.32283 7.32511 4.24211 7.32511 2.90897C7.32511 1.57584 6.24585 0.495117 4.91451 0.495117C3.58317 0.495117 2.50391 1.57584 2.50391 2.90897C2.50391 4.24211 3.58317 5.32283 4.91451 5.32283Z" stroke="#3A3A36" stroke-width="0.99" stroke-linecap="round"/>
              <path d="M9.33399 11.7597V10.1505C9.33399 7.65776 7.32917 5.32275 4.91455 5.32275C2.49993 5.32275 0.495117 7.65776 0.495117 10.1505V11.7597" stroke="#3A3A36" stroke-width="0.99" stroke-linecap="round"/>
            </svg>
            
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