'use client';

import { updateRegistrationStatus } from "@/app/admin/groups/actions";

interface RequestCardProps {
  registrationId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdAt: string;
}

export default function RequestCard({ registrationId, firstName, lastName, phoneNumber, createdAt }: RequestCardProps) {

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    const actionText = newStatus === 'approved' ? 'לאשר' : 'לדחות';
    
    // Confirmation Dialog
    const isConfirmed = window.confirm(`האם את/ה בטוח/ה שברצונך ${actionText} את הבקשה של ${firstName}?`);
    
    if (!isConfirmed) return;

    // Server Action
    await updateRegistrationStatus(registrationId, newStatus);
  };

  return (
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
        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
          {firstName} {lastName}
        </h3>
        <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
          רוצה להצטרף לקבוצה
        </p>
        <p style={{ margin: '5px 0 0 0', color: '#94A3B8', fontSize: '12px' }}>
          {new Date(createdAt).toLocaleDateString('he-IL')}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        
        {/* Approve Button */}
        <button 
          onClick={() => handleStatusUpdate('approved')}
          style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            color: '#22c55e',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
          title="אשר בקשה"
        >
          ✓
        </button>

        {/* Call Button */}
        <a 
          href={`tel:${phoneNumber}`}
          style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: 'white',
            color: '#64748B',
            fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
          title="התקשר למשתמש"
        >
          📞
        </a>

        {/* Reject Button */}
        <button 
          onClick={() => handleStatusUpdate('rejected')}
          style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            color: '#ef4444',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
          title="דחה בקשה"
        >
          ✕
        </button>

      </div>
    </div>
  );
}