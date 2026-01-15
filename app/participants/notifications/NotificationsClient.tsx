'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getNotifications, markNotificationAsRead, markAllAsRead, getUnreadCount } from './actions';
import NotificationBell from '../components/NotificationBell';
import styles from './Notifications.module.css';
import navbarStyles from '@/components/Navbar/Navbar.module.css';

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
}

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    loadUnreadCount();
  }, []);

  // Refresh notifications periodically
  useEffect(() => {
    if (mounted) {
      const interval = setInterval(() => {
        loadNotifications();
        loadUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [mounted]);

  const loadNotifications = async () => {
    setLoading(true);
    const result = await getNotifications();
    if (result.success) {
      setNotifications(result.notifications);
    }
    setLoading(false);
  };

  const loadUnreadCount = async () => {
    const result = await getUnreadCount();
    if (result.success) {
      setUnreadCount(result.count);
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Mark as read if not already read
    if (!notification.is_read) {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    }

    // Navigate to home page (participants page)
    router.push('/participants');
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await loadNotifications();
    await loadUnreadCount();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.notificationsPage}>
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
      <div className={styles.notificationsContent}>
        {/* Header with title */}
        <div className={styles.notificationsHeader}>
        <h3 className={styles.title}>התראות חדשות</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className={styles.markAllButton}
          >
            סמן הכל כנקרא
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {loading ? (
          <div className={styles.loading}>
            טוען...
          </div>
        ) : notifications.length === 0 ? (
          <p className={`p4 ${styles.empty}`}>
            אין התראות חדשות
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              className={`${styles.notificationItem} ${notification.is_read ? styles.notificationItemRead : styles.notificationItemUnread}`}
            >
              <div className={styles.notificationContent}>
                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className={styles.unreadIndicator} />
                )}
                
                {/* Message */}
                <div className={styles.messageContainer}>
                  <p className={`p4 ${styles.message} ${notification.is_read ? styles.messageRead : styles.messageUnread}`}>
                    {notification.message}
                  </p>
                  <p className={styles.time}>
                    {new Date(notification.created_at).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
}
