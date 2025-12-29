import Link from "next/link";
import styles from "./BackButton.module.css";

interface BackButtonProps {
  href: string;
  text?: string;
}

export default function BackButton({ href, text }: BackButtonProps) {
  return (
    <Link href={href} className={styles.container}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={styles.icon}
      >
        <path d="M18 8L22 12L18 16" />
        <path d="M2 12H22" /> 
      </svg>
      
      {text}
    </Link>
  );
}