'use client';

import { useState } from "react";
import { updateRegistrationStatus } from "@/app/admin/groups/actions";
import UserDetailsPopup, { UserDetails } from "./UserDetailsPopup";
import { confirmAndExecute } from "@/lib/toast-utils";
import Button from "@/components/buttons/Button";
import { Phone } from "lucide-react"; 
import styles from "./RequestCard.module.css";

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
      <div className="userCard">
        
        {/* User Details */}
        <div className={styles.info}>
          <h3 
            onClick={() => setIsPopupOpen(true)}
            className={styles.name}
            title="לחץ לצפייה בפרטים מלאים"
          >
            {user.first_name} {user.last_name}
          </h3>
          
          <p className={styles.subtitle}>
            רוצה להצטרף לקבוצה
          </p>
          <p className={styles.date}>
            {new Date(createdAt).toLocaleDateString('he-IL')}
          </p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          
          {/* Call button (Icon) */}
          <a href={`tel:${user.phone_number}`}>
            <Button 
              variant="icon" 
              size="sm"
              icon={<Phone size={20} />} 
              title="התקשר למשתמש"
            />
          </a>

          {/* Approve button (Primary) */}
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => handleStatusUpdate('approved')}
          >
            אישור
          </Button>

          {/* Reject button (Secondary) */}
          <Button 
            variant="secondary-gray"
            size="sm"
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