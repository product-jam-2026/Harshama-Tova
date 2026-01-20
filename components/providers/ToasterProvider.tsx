'use client';

import { Toaster } from 'sonner';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      dir="rtl"
      duration={3000}
      toastOptions={{
        style: {
          background: '#fff',
          color: '#333',
          padding: '1rem',
          borderRadius: '0.5rem',
          maxWidth: '90vw',
        },
      }}
    />
  );
}
