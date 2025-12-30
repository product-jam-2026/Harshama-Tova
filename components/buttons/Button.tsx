import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

// Setting the possible variants for the button
type ButtonVariant = 'primary' | 'secondary-gray' | 'secondary-light' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode; // optional for passing an icon
  children?: ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', // the default
  icon, 
  children, 
  className,
  ...props 
}: ButtonProps) {

  let sizeClass = styles[size];
  if (variant === 'icon') {
    if (size === 'sm') sizeClass = styles.iconSm;
    else if (size === 'lg') sizeClass = styles.iconLg;
    else sizeClass = styles.iconMd;
  }
  
  return (
    <button 
      // Applying styles based on the variant prop
      className={`
        ${styles.btn} 
        ${variant === 'primary' ? styles.primary : ''}
        ${variant === 'secondary-gray' ? styles.secondaryGray : ''}
        ${variant === 'secondary-light' ? styles.secondaryLight : ''}
        ${variant === 'icon' ? styles.iconOnly : ''}
        ${sizeClass} /* הוספת הגודל */
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