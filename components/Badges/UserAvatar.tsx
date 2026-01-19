import styles from './UserAvatar.module.css';

interface UserAvatarProps {
  name: string;
  className?: string;  // optional
}

export default function UserAvatar({ name, className = '' }: UserAvatarProps) {
  // Take the first letter in the name
  const initial = name ? name.charAt(0) : '?';

  return (
    <div className={`${styles.avatar} ${className}`}>
      <h1>{initial}</h1>
    </div>
  );
}