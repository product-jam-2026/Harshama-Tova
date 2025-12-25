'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getNotifications, markNotificationAsRead, markAllAsRead, getUnreadCount } from '../notifications/actions';

// Dynamically import the icon to avoid SSR hydration issues
const NotificationsIcon = dynamic(
  () => import('@mui/icons-material/Notifications'),
  { ssr: false }
);

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
}

export default function NotificationBell() {
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
    if (!notifications.find(n => n.id === notificationId)?.is_read) {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    await loadNotifications();
    await loadUnreadCount();
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {mounted && <NotificationsIcon style={{ color: '#333', fontSize: '28px' }} />}
        
        {/* Badge with unread count */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              marginTop: '10px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '320px',
              maxWidth: '400px',
              maxHeight: '500px',
              overflowY: 'auto',
              zIndex: 999,
              direction: 'rtl'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                התראות
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4a90e2',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px 8px'
                  }}
                >
                  סמן הכל כנקרא
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  טוען...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  אין התראות חדשות
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    style={{
                      padding: '15px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      backgroundColor: notification.is_read ? 'white' : '#f8f9fa',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (notification.is_read) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (notification.is_read) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      {/* Unread indicator */}
                      {!notification.is_read && (
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#4a90e2',
                            marginTop: '6px',
                            flexShrink: 0
                          }}
                        />
                      )}
                      
                      {/* Message */}
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '14px',
                            color: notification.is_read ? '#666' : '#333',
                            fontWeight: notification.is_read ? 'normal' : '500',
                            lineHeight: '1.5'
                          }}
                        >
                          {notification.message}
                        </p>
                        <p
                          style={{
                            margin: '5px 0 0 0',
                            fontSize: '12px',
                            color: '#999'
                          }}
                        >
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

