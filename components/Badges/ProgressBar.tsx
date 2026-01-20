import React from 'react';
import Link from 'next/link';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  max: number;
  href: string;
  icon?: React.ReactNode; // Optional icon prop
}

export default function ProgressBar({ current, max, href, icon }: ProgressBarProps) {
  // Calculate percentage, max out at 100%
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <Link href={href} className={styles.container}>
      {/* The colored fill */}
      <div 
        className={styles.fill} 
        style={{ width: `${percentage}%` }} 
      />
      
      {/* The numbers text + Icon */}
      <span 
        className={styles.text} 
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        {icon}
        <span>{current}/{max}</span>
      </span>
    </Link>
  );
}