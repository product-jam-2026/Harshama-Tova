'use client';

import { useState } from 'react';
import UserDetailsPopup, { UserDetails } from "@/app/admin/requests/components/UserDetailsPopup";
import { COMMUNITY_STATUSES } from "@/lib/constants";
import styles from '@/components/Cards/UserCard.module.css';
import UserAvatar from "@/components/Badges/UserAvatar";
import Badge from "@/components/Badges/Badge"; 
import Button from "@/components/buttons/Button"; 

interface Participant {
  id: string; // registration id
  status?: string; // approved/rejected (only for groups)
  comment?: string;
  users: {
    id: string; // user id
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    city?: string;
    gender?: string;
    age?: number;
    community_status: string[];
    comments?: string;
  };
}

interface Props {
  registrations: Participant[];
  showStatus?: boolean; 
}

export default function ParticipantsList({ registrations, showStatus = false }: Props) {
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);

  // Helper to determine Badge variant based on status
  const getBadgeVariant = (status?: string): 'green' | 'blue' | 'purple' => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'purple';
      default: return 'blue'; // Pending
    }
  };

  // Helper for label text
  const getStatusLabel = (status?: string) => {
    switch (status) {
        case 'approved': return 'אושר';
        case 'rejected': return 'נדחה';
        default: return 'ממתין';
    }
  };

  if (!registrations || registrations.length === 0) {
    return (
      <div className={styles.emptyState}>
        אין נרשמים עדיין.
      </div>
    );
  }

  const handleUserClick = (regUser: any) => {
    const userForPopup: UserDetails = {
        id: regUser.id,
        first_name: regUser.first_name,
        last_name: regUser.last_name,
        email: regUser.email || '',
        phone_number: regUser.phone_number,
        city: regUser.city,
        gender: regUser.gender,
        age: regUser.age,
        community_status: regUser.community_status,
        comments: regUser.comments,
    };
    setSelectedUser(userForPopup);
  };

  return (
    <>
      <div className={styles.listContainer}>
        {registrations.map((reg) => {
          const user = reg.users;
          
          // Format Community Status
          const userStatuses = user?.community_status || [];
          const statusLabels = userStatuses.map((val) => {
             const found = COMMUNITY_STATUSES.find(s => s.value === val);
             return found ? found.label : val;
          });
          const statusDisplay = statusLabels.length > 0 ? statusLabels.join(' • ') : '';

          return (
            <div 
              key={reg.id} 
              className={styles.card}
              style={{ position: 'relative' }}
            >
              
              {/* Right Side: Avatar + User Info */}
              <div className={styles.userDetailsWrapper}>
                  
                  {/* Avatar Component */}
                  <UserAvatar name={user.first_name} />

                  <div 
                    className={styles.info}
                    onClick={() => handleUserClick(user)}
                  >
                      <div className={styles.name}>
                          {user.first_name} {user.last_name}
                      </div>
                      
                      {statusDisplay && (
                          <div className={styles.subtitle}>
                              {statusDisplay}
                          </div>
                      )}
                      
                      {reg.comment && (
                          <p className={`sadot ${styles.comment}`}>
                              {reg.comment}
                          </p>
                      )}
                  </div>
              </div>

              {/* Actions Row */}
              <div 
                className={styles.actions} 
                style={{ justifyContent: 'space-between', marginTop: '0.5rem' }}
              >                 
                  {/* Phone Button (Right in RTL) */}
                  {user.phone_number ? (
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
                   ) : (
                     <div /> /* Spacer if no phone, to keep badge on left */
                   )}

                  {/* Status Badge (Left in RTL) */}
                  {showStatus && reg.status && (
                    <div>
                      <Badge variant={getBadgeVariant(reg.status)}>
                          {getStatusLabel(reg.status)}
                      </Badge>
                    </div>
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