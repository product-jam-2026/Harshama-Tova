import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = 'primary' | 'secondary1' | 'secondary2' | 'blue';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode; 
  children?: ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  icon, 
  children, 
  className,
  ...props 
}: ButtonProps) {

  return (
    <button 
      className={`
        ${styles.btn} 
        ${variant === 'primary' ? styles.primary : ''}
        ${variant === 'secondary1' ? styles.secondary1 : ''}
        ${variant === 'secondary2' ? styles.secondary2 : ''}
        ${variant === 'blue' ? styles.blue : ''}  
        ${className || ''}
      `}
      {...props} 
    >
      {icon && <span className={styles.iconWrapper}>{icon}</span>}
      {children}
    </button>
  );
}