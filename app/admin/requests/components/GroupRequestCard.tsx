import Link from "next/link";
import Badge from "@/components/Badges/Badge"; 
import { COMMUNITY_STATUSES } from '@/lib/constants';
import styles from "./GroupRequestCard.module.css";

interface GroupRequestCardProps {
  groupId: string;
  groupName: string;
  imageUrl: string | null;
  requestCount: number;
  mentor: string | null;
  audience: string[];
}

export default function GroupRequestCard({ 
  groupId, 
  groupName, 
  imageUrl, 
  requestCount,
  mentor,
  audience
}: GroupRequestCardProps) {

  // --- Map audience values to localized Hebrew labels ---
  const formatAudience = (statuses: string[]) => {
    if (!statuses || statuses.length === 0) return '';
    if (statuses.length === COMMUNITY_STATUSES.length) return 'מיועד לכולם';

    return statuses.map((statusValue) => {
      const statusObj = COMMUNITY_STATUSES.find(s => s.value === statusValue);
      return statusObj ? statusObj.label : statusValue;
    }).join(', ');
  };

  const audienceLabel = formatAudience(audience);
  
  return (
    <Link 
      href={`/admin/requests/${groupId}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className={styles.card}>
        
        {/* Right Section: Image + Text Info */}
        <div className={styles.rightSection}>
          
          {/* Image Block */}
          <div className={styles.imageContainer}>
            {imageUrl ? (
                <img src={imageUrl} alt={groupName} className={styles.image} />
            ) : (
                <div className={styles.noImage}>
                   אין תמונה
                </div>
            )}
          </div>
          
          {/* Text Details Column */}
          <div className={styles.textColumn}>
            <span className={styles.groupName} title={groupName}>
              {groupName}
            </span>

            <span className={`sadot ${styles.audienceLabel}`}>
              {audienceLabel}
            </span>

            <div className={styles.mentorContainer}>
              <img 
                src="/icons/BlackMentorIcon.svg" 
                alt="מנחה" 
                width="13" 
                height="13" 
              />
              <span className={`sadot ${styles.mentorName}`}>
                {mentor || ''}
              </span>
            </div>
          </div>

        </div>

        {/* Left Section: Badge (Now absolutely positioned via CSS) */}
        <div className={styles.badgeWrapper}>
          <Badge variant="blue">
              <span className={styles.requestBadge}>
                {requestCount} בקשות ממתינות
                <ArrowIconSvg className={styles.arrowIcon} />
              </span>
          </Badge>
        </div>

      </div>
    </Link>
  );
}

// --- Separate component for the SVG to keep main code clean ---
function ArrowIconSvg({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="6" 
      height="10" 
      viewBox="0 0 4 7" 
      fill="none"
      className={className}
    >
      <path 
        d="M3.50024 0.499983L0.500058 3.25951L3.50024 6.01904" 
        // Changed to currentColor so it inherits the text color automatically
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}