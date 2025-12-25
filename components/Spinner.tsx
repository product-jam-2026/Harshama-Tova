'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface SpinnerProps {
  label?: string;
  size?: number; // expected size in pixels
}

export default function Spinner({ label, size = 50 }: SpinnerProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      
      {/* The MUI spinner */}
      <CircularProgress size={size} />

      {/* The text */}
      {label && (
        <p style={{ 
            color: '#666', 
            fontSize: '16px',
            fontWeight: '500',
            fontFamily: 'sans-serif',
            margin: 0 
        }}>
            {label}
        </p>
      )}
    </Box>
  );
}