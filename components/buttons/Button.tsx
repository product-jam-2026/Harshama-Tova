import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

// Setting the possible variants for the button
type ButtonVariant = 'primary' | 'secondary-gray' | 'secondary-light' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode; // optional for passing an icon
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
      // Applying styles based on the variant prop
      className={`
        ${styles.btn} 
        ${variant === 'primary' ? styles.primary : ''}
        ${variant === 'secondary-gray' ? styles.secondaryGray : ''}
        ${variant === 'secondary-light' ? styles.secondaryLight : ''}
        ${variant === 'icon' ? styles.iconOnly : ''}
        ${className || ''}
      `}
      {...props} // Passing down other button attributes
    >
      {/* If there is an icon, display it */}
      {icon && <span className={styles.iconWrapper}>{icon}</span>}
      
      {/* if it's not an icon-only button, show the text */}
      {variant !== 'icon' && children}
    </button>
  );
}