'use client';

import { Toaster, toast } from 'react-hot-toast';
import { useEffect } from 'react';

export default function ToasterProvider() {
  useEffect(() => {
    const dismissToasts = () => {
      toast.dismiss();
    };

    window.addEventListener('click', dismissToasts, true);
    window.addEventListener('touchstart', dismissToasts, true);

    return () => {
      window.removeEventListener('click', dismissToasts, true);
      window.removeEventListener('touchstart', dismissToasts, true);
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
        duration: 1500,
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px',
          borderRadius: '8px',
          maxWidth: '90vw',
        },
        success: {
          duration: 1500,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 1500,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
