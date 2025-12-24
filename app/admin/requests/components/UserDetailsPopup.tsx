'use client';

import CloseButton from "@/components/CloseButton"; 
import { COMMUNITY_STATUSES, GENDERS } from "@/lib/constants"; 

export interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  age?: number;
  gender?: string;
  city?: string;
  community_status?: string;
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

  // Find the labels for gender and community status
  const genderLabel = GENDERS.find(g => g.value === user.gender)?.label || user.gender;
  const statusLabel = COMMUNITY_STATUSES.find(s => s.value === user.community_status)?.label || user.community_status;

  return (
    <div 
      onClick={onClose} // Close modal when clicking the backdrop
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        onClick={handleContentClick}
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '30px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          textAlign: 'right',
          direction: 'rtl'
        }}
      >
        {/* Reusable Close Button with positioning */}
        <CloseButton 
          onClick={onClose} 
          style={{ position: 'absolute', top: '15px', left: '15px' }} 
        />

        {/* User Name Header */}
        <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '15px', marginBottom: '5px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#111827' }}>
              {user.first_name} {user.last_name}
            </h2>
        </div>

        {/* User Details List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <PopupRow label="גיל" value={user.age?.toString()} />
          <PopupRow label="מגדר" value={genderLabel} />
          <PopupRow label="עיר מגורים" value={user.city} />
          <PopupRow label="סטטוס קהילתי" value={statusLabel} />
          
          {/* Phone Link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '8px 12px', borderRadius: '8px' }}>
            <span style={{ color: '#6B7280', fontSize: '14px' }}>טלפון:</span>
            <a href={`tel:${formattedPhone}`} style={{ color: '#2563EB', fontWeight: 'bold', textDecoration: 'none', direction: 'ltr' }}>
                {formattedPhone}
            </a>
          </div>

          {/* Email Link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '8px 12px', borderRadius: '8px' }}>
             <span style={{ color: '#6B7280', fontSize: '14px' }}>אימייל:</span>
             <a href={`mailto:${user.email}`} style={{ color: '#2563EB', fontWeight: '500', textDecoration: 'none', fontSize: '14px' }}>
                {user.email}
             </a>
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper component for rendering a single detail row
function PopupRow({ label, value }: { label: string, value?: string }) {
    if (!value) return null; // Do not render if value is missing
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
            <span style={{ color: '#6B7280', fontSize: '15px' }}>{label}:</span>
            <span style={{ color: '#1F2937', fontWeight: '600', fontSize: '15px' }}>{value}</span>
        </div>
    );
}