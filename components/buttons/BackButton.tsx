import Link from "next/link";
import styles from "./BackButton.module.css";

interface BackButtonProps {
  href: string;
  direction?: 'right' | 'left';
  className?: string;
}

export default function BackButton({ href, direction = 'right', className = '' }: BackButtonProps) {
  const iconSrc = direction === 'left' ? "/icons/LeftArrow.svg" : "/icons/back.svg";

  return (
    <Link 
      href={href} 
      className={`${styles.container} ${className}`}
    >
      <img 
        src={iconSrc} 
        alt={direction === 'left' ? "חזור" : "המשך"} 
        className={styles.icon} 
      />
    </Link>
  );
}