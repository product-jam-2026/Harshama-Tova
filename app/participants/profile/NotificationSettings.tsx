'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/app/hooks/usePushNotifications';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function NotificationSettings() {
  // Use the custom hook for push notifications
  const { isSubscribed, subscribeToPush, unsubscribeFromPush, notificationPermission } = usePushNotifications();
  const [isLoading, setIsLoading] = useState(false);

  // Handle toggle switch change
  const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    try {
      if (event.target.checked) {
        await subscribeToPush();
      } else {
        await unsubscribeFromPush();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if notifications are blocked by the browser
  const isBlocked = notificationPermission === 'denied';

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '1rem',
      padding: '15px 20px',
      marginBottom: '30px',
      border: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      direction: 'rtl'
    }}>
      <p className="p4" style={{ color: 'var(--text-dark-2)', margin: 0, flex: 1 }}>
        קבלת עדכונים על קבוצות וסדנאות ישירות למכשיר
      </p>
      
      {isLoading ? (
        <CircularProgress size={24} style={{ color: 'var(--color-secondary)' }} />
      ) : (
        <Switch
          checked={isSubscribed}
          onChange={handleToggle}
          disabled={isBlocked}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#fff',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: 'var(--input-focus-border)',
            },
            '& .MuiSwitch-switchBase': {
              color: '#9e9e9e',
            },
            '& .MuiSwitch-track': {
              backgroundColor: '#bdbdbd',
            },
          }}
        />
      )}

      {/* Show helper text if notifications are blocked */}
      {isBlocked && (
        <Typography variant="caption" style={{ color: '#d32f2f', marginTop: '5px', width: '100%' }}>
          ההתראות חסומות. יש לאפשר אותן דרך הגדרות הדפדפן.
        </Typography>
      )}
    </div>
  );
}