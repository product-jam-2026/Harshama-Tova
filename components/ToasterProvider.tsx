'use client';

import { Toaster, toast } from 'react-hot-toast';
import { useEffect } from 'react';

export default function ToasterProvider() {
  useEffect(() => {
    // כשהעמוד נעשה visible שוב, נסגור טוסטים ישנים
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // בדוק אם יש טוסטים פעילים ונסה לרענן אותם
        const toasts = document.querySelectorAll('[role="status"]');
        toasts.forEach(() => {
          // אפשר להוסיף לוגיקה נוספת כאן
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        top: 20,
        zIndex: 9999,
      }}
      toastOptions={{
        duration: 800,
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px',
          borderRadius: '8px',
          maxWidth: '90vw',
        },
        success: {
          duration: 800,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 800,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
