import { ReactNode } from "react";
import styles from "./Badge.module.css";

// Two types of badges
type BadgeVariant = 'gray' | 'white';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode; // optional
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'gray', 
  icon, 
  className 
}: BadgeProps) {
  
  return (
    <div 
      className={`
        ${styles.badge} 
        ${variant === 'gray' ? styles.gray : ''}
        ${variant === 'white' ? styles.white : ''}
        ${className || ''}
      `}
    >
      {/* For Icon*/}
      {icon && <span className={styles.iconWrapper}>{icon}</span>}
      
      {children}
    </div>
  );
}