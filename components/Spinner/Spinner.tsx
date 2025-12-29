'use client';

import CircularProgress from '@mui/material/CircularProgress';
import styles from './Spinner.module.css'; 

interface SpinnerProps {
  label?: string;
  size?: number; // expected size in pixels
}

export default function Spinner({ label, size = 50 }: SpinnerProps) {
  return (
    <div className={styles.container}>
      
      {/* The MUI spinner */}
      <CircularProgress size={size} className={styles.spinner} />

      {/* The text */}
      {label && (
        <p className={styles.label}>
            {label}
        </p>
      )}
    </div>
  );
}