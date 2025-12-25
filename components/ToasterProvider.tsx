'use client';

import { Toaster, toast } from 'react-hot-toast';
import { useEffect } from 'react';

export default function ToasterProvider() {
  useEffect(() => {
    const handleClick = () => {
      toast.dismiss();
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('touchend', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchend', handleClick);
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
          cursor: 'pointer',
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
