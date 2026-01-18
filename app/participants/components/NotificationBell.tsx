'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUnreadCount } from '../notifications/actions';

interface NotificationBellProps {
  /** כשמועבר מעמוד ההתראות – התצוגה מתעדכנת מיד עם "סמן הכל כנקרא" */
  unreadCountOverride?: number;
}

export default function NotificationBell({ unreadCountOverride }: NotificationBellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const isNotificationsPage = pathname === '/participants/notifications';

  const displayCount = unreadCountOverride !== undefined ? unreadCountOverride : unreadCount;

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load unread count (רק כשאין override מעמוד ההתראות)
  useEffect(() => {
    if (mounted && unreadCountOverride === undefined) {
      loadUnreadCount();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [mounted, unreadCountOverride]);

  const loadUnreadCount = async () => {
    const result = await getUnreadCount();
    if (result.success) {
      setUnreadCount(result.count);
    }
  };

  const handleBellClick = () => {
    router.push('/participants/notifications');
  };

  return (
    <div className="notification-bell-container">
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className={`notification-bell-button ${isNotificationsPage ? 'active' : ''}`}
      >
        {mounted && <img src="/icons/bell.svg" alt="Notification Bell" className="notification-bell-icon" />}
        
        {/* Badge with unread count */}
        {displayCount > 0 && (
          <span className="notification-badge">
            {displayCount > 9 ? '9+' : displayCount}
          </span>
        )}
      </button>
    </div>
  );
}

