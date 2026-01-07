'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getNotifications, markNotificationAsRead, markAllAsRead, getUnreadCount } from '../notifications/actions';


interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load notifications and unread count
  useEffect(() => {
    if (mounted) {
      loadNotifications();
      loadUnreadCount();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        loadNotifications();
        loadUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [mounted]);

  const loadNotifications = async () => {
    const result = await getNotifications();
    if (result.success) {
      setNotifications(result.notifications);
    }
  };

  const loadUnreadCount = async () => {
    const result = await getUnreadCount();
    if (result.success) {
      setUnreadCount(result.count);
    }
    setLoading(false);
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
    setIsOpen(false);
    router.push('/participants');
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await loadNotifications();
    await loadUnreadCount();
  };

  return (
    <div className="notification-bell-container">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div
            className="notification-backdrop"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="notificationDropdown">
            {/* Header */}
            <div className="notification-header">
              <h3>התראות</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="notification-mark-all-button"
                >
                  סמן הכל כנקרא
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div>
              {loading ? (
                <div className="notification-loading">
                  טוען...
                </div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                  אין התראות חדשות
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`notification-item ${notification.is_read ? 'notification-item-read' : 'notification-item-unread'}`}
                  >
                    <div className="notification-item-content">
                      {/* Unread indicator */}
                      {!notification.is_read && (
                        <div className="notification-unread-indicator" />
                      )}
                      
                      {/* Message */}
                      <div className="notification-message-container">
                        <p className={`notification-message ${notification.is_read ? 'notification-message-read' : 'notification-message-unread'}`}>
                          {notification.message}
                        </p>
                        <p className="notification-time">
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
        </>
      )}
    </div>
  );
}

