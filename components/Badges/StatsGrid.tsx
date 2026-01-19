import React from 'react';
import styles from './StatsGrid.module.css';

interface StatItem {
  label: string;
  value: number;
  colorBg: string;
  colorText: string;
}

export default function StatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className={styles.gridContainer}>
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={styles.statCard}
          style={{ 
            backgroundColor: stat.colorBg, 
            color: stat.colorText 
          }}
        >
          <h3 className={styles.label}>{stat.label}</h3>
          <strong className={styles.value}>{stat.value}</strong>
        </div>
      ))}
    </div>
  );
}