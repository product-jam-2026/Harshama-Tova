'use client';

import { useState } from 'react';
import { Phone } from "lucide-react";
import Button from "@/components/buttons/Button";
import UserDetailsPopup, { UserDetails } from "@/app/admin/requests/components/UserDetailsPopup"; // Adjust path if needed
import { COMMUNITY_STATUSES } from "@/lib/constants";

interface Participant {
  id: string; // registration id
  status?: string; // approved/rejected (only for groups)
  comment?: string;
  users: {
    id: string; // user id
    first_name: string;
    last_name: string;
    email: string; // Needed for user details popup
    phone_number: string;
    city?: string; // Needed for user details popup
    gender?: string; // Needed for user details popup
    age?: number; // Needed for user details popup
    community_status: string[];
  };
}

interface Props {
  registrations: Participant[];
  showStatus?: boolean; // To show approved/rejected badges (Groups only)
}

export default function ParticipantsList({ registrations, showStatus = false }: Props) {
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);

  if (!registrations || registrations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        אין נרשמים עדיין.
      </div>
    );
  }

  // Handle opening the popup
  const handleUserClick = (regUser: any) => {
    // Map the DB user structure to the Popup interface
    const userForPopup: UserDetails = {
        id: regUser.id,
        first_name: regUser.first_name,
        last_name: regUser.last_name,
        email: regUser.email || '',
        phone_number: regUser.phone_number,
        city: regUser.city,
        gender: regUser.gender,
        age: regUser.age,
        community_status: regUser.community_status
    };
    setSelectedUser(userForPopup);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {registrations.map((reg) => {
          const user = reg.users;
          
          // Format Community Status
          const userStatuses = user?.community_status || [];
          const statusLabels = userStatuses.map((val) => {
             const found = COMMUNITY_STATUSES.find(s => s.value === val);
             return found ? found.label : val;
          });
          const statusDisplay = statusLabels.length > 0 ? statusLabels.join(', ') : '';

          return (
            <div 
              key={reg.id} 
              className='userCard'
            >
              {/* Right Side: User Info (Clickable) */}
              <div 
                onClick={() => handleUserClick(user)}
                style={{ cursor: 'pointer', flex: 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', color: 'white' }}>
                        {user.first_name} {user.last_name}
                    </span>
                    {/* Status Badge (Groups only) */}
                    {showStatus && reg.status && (
                        <span style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            backgroundColor: reg.status === 'approved' ? '#dcfce7' : reg.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                            color: reg.status === 'approved' ? '#166534' : reg.status === 'rejected' ? '#991b1b' : '#854d0e'
                        }}>
                            {reg.status === 'approved' ? 'אושר' : reg.status === 'rejected' ? 'נדחה' : 'ממתין'}
                        </span>
                    )}
                </div>
                
                {statusDisplay && (
                    <div style={{ fontSize: '13px', color: 'white', marginTop: '4px' }}>
                        {statusDisplay}
                    </div>
                )}
                
                {reg.comment && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>
                        {reg.comment}
                    </div>
                )}
              </div>

              {/* Left Side: Call Action */}
              <div>
                {user.phone_number ? (
                    <a href={`tel:${user.phone_number}`} style={{ textDecoration: 'none' }}>
                        <Button variant="secondary-light" size="sm" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Phone size={18} color="#4b5563" />
                        </Button>
                    </a>
                ) : (
                    <span style={{ color: '#ccc' }}>-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup Modal */}
      {selectedUser && (
        <UserDetailsPopup 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
        />
      )}
    </>
  );
}