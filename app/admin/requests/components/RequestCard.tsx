'use client';

import { useState } from "react";
import { updateRegistrationStatus } from "@/app/admin/groups/actions";
import UserDetailsPopup, { UserDetails } from "./UserDetailsPopup";
import { confirmAndExecute } from "@/lib/utils/toast-utils";
import styles from "@/components/Cards/UserCard.module.css";
import UserAvatar from "@/components/Badges/UserAvatar";
import Button from "@/components/buttons/Button";

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
        
        {/* Right Section: Grouping Avatar and Text Info */}
        <div className={styles.userDetailsWrapper}>
            
            {/* User Avatar */}
            <UserAvatar name={user.first_name} />

            {/* Text Info */}
            <div className={styles.info}>
              <div className={styles.name}>
                <span 
                  onClick={() => setIsPopupOpen(true)}
                  title="לחץ לצפייה בפרטים מלאים"
                >
                  {user.first_name} {user.last_name}
                </span>
              </div>
              
              <div className={styles.subtitle}>
                רוצה להצטרף לקבוצה
              </div>
              <div className={styles.date}>
                {new Date(createdAt).toLocaleDateString('he-IL')}
              </div>
            </div>
        </div>

        {/* Left Section: Actions */}
        <div className={styles.actions}>
          
          {/* Call button */}
          {user.phone_number && (
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
          )}

          {/* Approve button */}
          <Button 
            variant="secondary1"
            onClick={() => handleStatusUpdate('approved')}
          >
            אישור
          </Button>

          {/* Reject button */}
          <Button 
            variant="secondary2"
            onClick={() => handleStatusUpdate('rejected')}
          >
            דחייה
          </Button>
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