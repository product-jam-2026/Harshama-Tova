// components/ui/Badge.tsx
import styles from './Badge.module.css';

type BadgeVariant = 'purple' | 'green' | 'blue' | 'white';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'white', className = '' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}