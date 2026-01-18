import Link from "next/link";
import styles from "./BackButton.module.css";

interface BackButtonProps {
  href: string;
  direction?: 'right' | 'left';
  className?: string;
}

export default function BackButton({ href, direction = 'right', className = '' }: BackButtonProps) {
  return (
    <Link 
      href={href} 
      className={`${styles.container} ${className}`}
    >
      <img 
        src="/icons/back.svg" 
        alt="Back" 
        className={`${styles.icon} ${direction === 'left' ? styles.rotate : ''}`} 
      />
    </Link>
  );
}