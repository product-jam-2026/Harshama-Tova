'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUnreadCount } from '../notifications/actions';

export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load unread count
  useEffect(() => {
    if (mounted) {
      loadUnreadCount();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [mounted]);

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
        className="notification-bell-button"
      >
        {mounted && <img src="/icons/bell.svg" alt="Notification Bell" className="notification-bell-icon" />}
        
        {/* Badge with unread count */}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

