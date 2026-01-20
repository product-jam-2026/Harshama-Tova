'use client';

import Button from "@/components/buttons/Button"; 
import { X } from "lucide-react"; 
import { COMMUNITY_STATUSES, GENDERS } from "@/lib/constants"; 
import styles from "./UserDetailsPopup.module.css";

export interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  age?: number;
  gender?: string;
  city?: string;
  community_status?: string[];
  comments?: string;
}

interface UserDetailsPopupProps {
  user: UserDetails;
  onClose: () => void;
}

export default function UserDetailsPopup({ user, onClose }: UserDetailsPopupProps) {
  
  // Prevent the modal from closing when clicking inside the content area
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const formattedPhone = user.phone_number; 

  // Find the labels for gender
  const genderLabel = GENDERS.find(g => g.value === user.gender)?.label || user.gender;
  
  // Format Age and Gender together (e.g., "35 • Female")
  const ageGenderValue = [user.age, genderLabel].filter(Boolean).join(' • ');

  // Map array of statuses to labels
  const statusLabels = user.community_status?.map(status => {
    const found = COMMUNITY_STATUSES.find(s => s.value === status);
    return found ? found.label : status;
  }) || [];
  
  const statusLabel = statusLabels.join(', ');

  return (
    <div 
      onClick={onClose} 
      className={`overlay ${styles.popupContainer}`}
    >
      <div 
        onClick={handleContentClick}
        className={styles.content}
      >
        <button 
            onClick={onClose}
            className="closeButton"
            aria-label="סגירה"
        >
            <X size={24} />
        </button>

        {/* Header: Icon + Name */}
        <div className={styles.header}>
            <h1 className={styles.title}>
              {user.first_name} {user.last_name}
            </h1>

            {/* Phone Button using the custom component and SVG to match RequestCard */}
            <Button 
                variant="blue" 
                className={styles.phoneButton} 
                title="התקשר למשתמש"
                onClick={() => window.location.href = `tel:${user.phone_number}`}
            >
                <img 
                    src="/icons/Phone.svg" 
                    alt="phone" 
                    width="20" 
                    height="20" 
                />
            </Button>
        </div>

        {/* User Details List */}
        <div className={styles.detailsList}>
          
          {/* Combined Age & Gender Row */}
          <PopupRow label="גיל ומגדר" value={ageGenderValue} />
          
          <PopupRow label="סטטוס קהילתי" value={statusLabel} />
          <PopupRow label="עיר מגורים" value={user.city} />
          
          {/* Phone Link (Styled as a row) */}
          <div className={styles.row}>
            <span className={styles.rowLabel}>טלפון</span>
            <a href={`tel:${formattedPhone}`} className={styles.phoneLink}>
                {formattedPhone}
            </a>
          </div>

          {/* Email Link (Styled as a row) */}
          <div className={styles.row}>
             <span className={styles.rowLabel}>אימייל</span>
             <a href={`mailto:${user.email}`} className={styles.emailLink}>
                {user.email}
             </a>
          </div>

          <PopupRow label="חשוב לי שתדעו" value={user.comments} />

        </div>
      </div>
    </div>
  );
}

// Helper component for rendering a single detail row
function PopupRow({ label, value }: { label: string, value?: string }) {
    if (!value) return null; 
    return (
        <div className={styles.row}>
            <span className={styles.rowLabel}>{label}</span>
            <span className={styles.rowValue}>{value}</span>
        </div>
    );
}