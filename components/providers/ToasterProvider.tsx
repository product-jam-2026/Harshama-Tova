'use client';

import { Toaster } from 'sonner';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      dir="rtl"
      duration={1500}
      toastOptions={{
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px',
          borderRadius: '8px',
          maxWidth: '90vw',
        },
      }}
    />
  );
}
