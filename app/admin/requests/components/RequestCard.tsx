'use client';

import { useState } from "react";
import { updateRegistrationStatus } from "@/app/admin/groups/actions";
import UserDetailsPopup, { UserDetails } from "./UserDetailsPopup";
import { confirmAndExecute } from "@/lib/toast-utils";
import ActionCircleButton from "@/components/Buttons/ActionCircleButton";

interface RequestCardProps {
  registrationId: string;
  user: UserDetails;
  createdAt: string;
}

export default function RequestCard({ registrationId, user, createdAt }: RequestCardProps) {
  
  // State to manage popup visibility
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // State to hide the card after successful action
  const [isVisible, setIsVisible] = useState(true);

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    const actionText = newStatus === 'approved' ? 'לאשר' : 'לדחות';
    const actionPastTense = newStatus === 'approved' ? 'אושרה' : 'נדחתה';
    
    await confirmAndExecute({
        confirmMessage: `האם את/ה בטוח/ה שברצונך ${actionText} את הבקשה של ${user.first_name}?`,
        action: async () => await updateRegistrationStatus(registrationId, newStatus),
        successMessage: `הבקשה ${actionPastTense} בהצלחה!`,
        errorMessage: `שגיאה בעת ניסיון ${actionText} את הבקשה`,
        onSuccess: () => setIsVisible(false) // Hide the card immediately upon success
    });
  };

  // If card was approved/rejected, don't render it anymore
  if (!isVisible) return null;

  // Guard against null user
  if (!user) return null;

  return (
    <>
      <div style={{
        background: '#E2E8F0',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        
        {/* User Details */}
        <div>
          {/* Made the name clickable to open the popup */}
          <h3 
            onClick={() => setIsPopupOpen(true)}
            style={{ 
              margin: '0 0 5px 0', 
              fontSize: '18px', 
              fontWeight: 'bold',
              cursor: 'pointer', // Show pointer cursor
              textDecoration: 'underline', 
              textDecorationColor: '#94A3B8',
              textUnderlineOffset: '4px'
            }}
            title="Click to view full details"
          >
            {user.first_name} {user.last_name}
          </h3>
          
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
            רוצה להצטרף לקבוצה
          </p>
          <p style={{ margin: '5px 0 0 0', color: '#94A3B8', fontSize: '12px' }}>
            {new Date(createdAt).toLocaleDateString('he-IL')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          
          {/* Approve Button */}
          <ActionCircleButton 
            icon="✓"
            color="#22c55e"
            title="אשר בקשה"
            onClick={() => handleStatusUpdate('approved')}
          />

          {/* Call Button */}
          <ActionCircleButton 
            icon="📞"
            color="#64748B"
            title="התקשר למשתמש"
            href={`tel:${user.phone_number}`}
          />

          {/* Reject Button */}
          <ActionCircleButton 
            icon="✕"
            color="#ef4444"
            title="דחה בקשה"
            onClick={() => handleStatusUpdate('rejected')}
          />

        </div>
      </div>

      {/* Conditionally render the popup */}
      {isPopupOpen && (
        <UserDetailsPopup 
          user={user} 
          onClose={() => setIsPopupOpen(false)} 
        />
      )}
    </>
  );
}