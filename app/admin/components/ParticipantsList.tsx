'use client';

import { useState } from 'react';
import { Phone } from "lucide-react";
import UserDetailsPopup, { UserDetails } from "@/app/admin/requests/components/UserDetailsPopup";
import { COMMUNITY_STATUSES } from "@/lib/constants";
import styles from '@/components/Cards/UserCard.module.css';

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
              className={styles.card}
            >
              
              {/* Right Side: User Info */}
              <div 
                className={styles.info}
                onClick={() => handleUserClick(user)}
              >
                  <div className={styles.name}>
                      {user.first_name} {user.last_name}
                  </div>
                  
                  {/* Status Badge (Groups only) - kept inline styles for specific badge logic */}
                  {showStatus && reg.status && (
                      <span style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: reg.status === 'approved' ? '#dcfce7' : reg.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                          color: reg.status === 'approved' ? '#166534' : reg.status === 'rejected' ? '#991b1b' : '#854d0e',
                          marginTop: '4px',
                          display: 'inline-block'
                      }}>
                          {reg.status === 'approved' ? 'אושר' : reg.status === 'rejected' ? 'נדחה' : 'ממתין'}
                      </span>
                  )}

                  {statusDisplay && (
                      <div className={styles.subtitle}>
                          {statusDisplay}
                      </div>
                  )}
                  
                  {reg.comment && (
                      <div style={{ fontSize: '12px', color: '#ccc', marginTop: '2px', fontStyle: 'italic' }}>
                          {reg.comment}
                      </div>
                  )}
              </div>

              {/* Left Side: Call Action */}
              <div className={styles.actions}>
                {user.phone_number ? (
                    <a href={`tel:${user.phone_number}`} className={styles.phoneButton}>
                        <Phone size={18} />
                    </a>
                ) : null}
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