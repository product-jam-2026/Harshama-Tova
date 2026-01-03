'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import styles from '@/components/Navbar/Navbar.module.css';

const UserNavBar = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { name: ' הפעילויות שלי', href: '/participants' },
    { name: ' סדנאות', href: '/participants/workshop-registration' },
    { name: ' קבוצות', href: '/participants/group-registration' },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.iconsContainer}>
        <NotificationBell />
        <Link href="/participants/profile" className={styles.profileIconLink}>
          {mounted && <img src="/icons/profile.svg" alt="Profile" className={styles.profileIcon} />}
        </Link>
      </div>
      
      <nav className={styles.navBar}>
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={pathname === tab.href ? styles.activeTab : styles.inactiveTab}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default UserNavBar;