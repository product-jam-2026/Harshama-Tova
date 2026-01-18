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
      <svg 
        width="8" 
        height="14" 
        viewBox="0 0 8 14" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`${styles.arrow} ${direction === 'right' ? styles.rotate : ''}`}
      >
        <path 
          opacity="0.8" 
          d="M7.02173 0.933301L0.933357 6.5333L7.02173 12.1333" 
          stroke="currentColor" 
          strokeWidth="1.86667" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}