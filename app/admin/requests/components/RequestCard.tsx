'use client';

import { useState } from "react";
import { updateRegistrationStatus } from "@/app/admin/groups/actions";
import UserDetailsPopup, { UserDetails } from "./UserDetailsPopup";
import { confirmAndExecute } from "@/lib/toast-utils";
import { Phone } from "lucide-react"; 
import styles from "@/components/Cards/UserCard.module.css";

interface RequestCardProps {
  registrationId: string;
  user: UserDetails;
  createdAt: string;
}

export default function RequestCard({ registrationId, user, createdAt }: RequestCardProps) {
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    const actionText = newStatus === 'approved' ? 'לאשר' : 'לדחות';
    const actionPastTense = newStatus === 'approved' ? 'אושרה' : 'נדחתה';
    
    await confirmAndExecute({
        confirmMessage: `האם את/ה בטוח/ה שברצונך ${actionText} את הבקשה של ${user.first_name}?`,
        action: async () => await updateRegistrationStatus(registrationId, newStatus),
        successMessage: `הבקשה ${actionPastTense} בהצלחה!`,
        errorMessage: `שגיאה בעת ניסיון ${actionText} את הבקשה`,
        onSuccess: () => setIsVisible(false)
    });
  };

  if (!isVisible || !user) return null;

  return (
    <>
      <div className={styles.card}>
        
        {/* User Details */}
        <div className={styles.info}>
          <div 
            onClick={() => setIsPopupOpen(true)}
            className={styles.name}
            title="לחץ לצפייה בפרטים מלאים"
          >
            {user.first_name} {user.last_name}
          </div>
          
          <div className={styles.subtitle}>
            רוצה להצטרף לקבוצה
          </div>
          <div className={styles.date}>
            {new Date(createdAt).toLocaleDateString('he-IL')}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          
          {/* Call button (Icon) */}
          {user.phone_number && (
             <a href={`tel:${user.phone_number}`} className={styles.phoneButton} title="התקשר למשתמש">
               <Phone size={18} />
             </a>
          )}

          {/* Approve button */}
          <button 
            className={`${styles.actionButton} ${styles.approveBtn}`}
            onClick={() => handleStatusUpdate('approved')}
          >
            אישור
          </button>


          {/* Reject button */}
          <button 
            className={`${styles.actionButton} ${styles.rejectBtn}`}
            onClick={() => handleStatusUpdate('rejected')}
          >
            דחייה
          </button>
        </div>
      </div>

      {isPopupOpen && (
        <UserDetailsPopup 
          user={user} 
          onClose={() => setIsPopupOpen(false)} 
        />
      )}
    </>
  );
}