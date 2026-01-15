'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import NotificationBell from '../components/NotificationBell';
import NotificationSettings from './NotificationSettings';
import styles from './Profile.module.css';
import navbarStyles from '@/components/Navbar/Navbar.module.css';

interface UserData {
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  gender: string | null;
  phone_number: string | null;
  city: string | null;
  community_status: string[] | null;
  comments: string | null;
  genderLabel?: string;
  communityStatusLabel?: string;
  email?: string | null;
}

interface ProfileClientProps {
  userData: UserData;
}

export default function ProfileClient({ userData }: ProfileClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.profilePage}>
      {/* Icons and back arrow */}
      <div className={styles.topBar}>
        <div className={navbarStyles.iconsContainer}>
          <NotificationBell />
          <Link 
            href="/participants/profile" 
            className={`${navbarStyles.profileIconLink} ${pathname === '/participants/profile' ? navbarStyles.active : ''}`}
          >
            {mounted && <img src="/icons/profile.svg" alt="Profile" className={navbarStyles.profileIcon} />}
          </Link>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            router.push('/participants');
          }}
          className={styles.backArrow}
        >
          <img src="/icons/back.svg" alt="Back" className={styles.backIcon} />
        </button>
      </div>

      {/* Content */}
      <div className={styles.profileContent}>
        {/* Name */}
        <div className={styles.nameContainer}>
          <h1 className={styles.name}>
            {userData.first_name || ''} {userData.last_name || ''}
          </h1>
        </div>

        {/* Personal Details Header */}
        <div className={styles.personalDetailsHeader}>
          <p className={`p4 ${styles.personalDetailsTitle}`}>
            פרטים אישיים
          </p>
          <Link href="/participants/profile/edit" className={styles.editorIconLink}>
            <img src="/icons/editor.svg" alt="Edit" className={styles.editorIcon} />
          </Link>
        </div>

        {/* Information Card */}
        <div className={styles.infoCard}>
          {/* גיל ומגדר */}
          {(userData.age !== null || userData.genderLabel) && (
            <>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>גיל ומגדר</p>
                <p className={styles.infoSectionValue}>
                  {userData.age !== null ? userData.age : ''} {userData.age !== null && userData.genderLabel ? '•' : ''} {userData.genderLabel || ''}
                </p>
              </div>
              {(userData.communityStatusLabel || userData.city || userData.phone_number || userData.email) && (
                <hr className={styles.infoDivider} />
              )}
            </>
          )}

          {/* סטטוס קהילתי */}
          {userData.communityStatusLabel && (
            <>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>סטטוס קהילתי</p>
                <p className={styles.infoSectionValue}>{userData.communityStatusLabel}</p>
              </div>
              {(userData.city || userData.phone_number || userData.email) && (
                <hr className={styles.infoDivider} />
              )}
            </>
          )}

          {/* עיר מגורים */}
          {userData.city && (
            <>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>עיר מגורים</p>
                <p className={styles.infoSectionValue}>{userData.city}</p>
              </div>
              {(userData.phone_number || userData.email) && (
                <hr className={styles.infoDivider} />
              )}
            </>
          )}

          {/* טלפון */}
          {userData.phone_number && (
            <>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>טלפון</p>
                <p className={styles.infoSectionValue}>{userData.phone_number}</p>
              </div>
              {userData.email && (
                <hr className={styles.infoDivider} />
              )}
            </>
          )}

          {/* אימייל */}
          {userData.email && (
            <div className={styles.infoSection}>
              <p className={styles.infoSectionTitle}>אימייל</p>
              <p className={styles.infoSectionValue}>{userData.email}</p>
            </div>
          )}
        </div>

        {/* Important to Know Section */}
        <p className={`p4 ${styles.importantSection}`}>
          חשוב לי שתדעו
        </p>
        {userData.comments ? (
          <div className={styles.commentsCard}>
            <p className={styles.commentsText}>
              {userData.comments}
            </p>
          </div>
        ) : (
          <div className={styles.commentsCard}>
            <p className={styles.emptyCommentsText}>
              רוצה לשתף משהו שחשוב שנדע עלייך? אפשר לערוך בכל רגע
            </p>
          </div>
        )}

        {/* Notification Settings Section */}
        <p className={`p4 ${styles.notificationSectionTitle}`}>
          קבלת התראות לפלאפון
        </p>
        <NotificationSettings />

        {/* Logout Button */}
        <div className={styles.logoutContainer}>
          <Link
            href="/logout"
            className={styles.logoutButton}
          >
            התנתקות
          </Link>
        </div>
      </div>
    </div>
  );
}
