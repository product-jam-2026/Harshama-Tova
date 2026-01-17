'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import styles from '@/components/Navbar/Navbar.module.css';


const TopIcons = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.iconsContainer}>
        <NotificationBell />
        <Link 
          href="/participants/profile" 
          className={`${styles.profileIconLink} ${pathname === '/participants/profile' ? styles.active : ''}`}
        >
          {mounted && <img src="/icons/profile.svg" alt="Profile" className={styles.profileIcon} />}
        </Link>
      </div>
    </div>
  );
};

export default TopIcons;