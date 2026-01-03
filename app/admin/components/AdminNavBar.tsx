'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import styles from '@/components/Navbar/Navbar.module.css';

const AdminNavBar = () => {
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent Hydration Mismatch
  if (!isMounted) {
    return null;
  }

  const tabs = [
    { name: 'המרחב', href: '/admin' },
    { name: 'בקשות', href: '/admin/requests' },
    { name: 'קבוצות', href: '/admin/groups' },
    { name: 'סדנאות', href: '/admin/workshops' },
  ];

  return (
    <div className={styles.wrapper}>

      <div className={styles.iconsContainer}>
          <Link href="/logout">
              <span>
              התנתקות
              </span>
          </Link>

          {/* Icon for managing admins */}
          <Link href="/admin/manage-admins" title="ניהול הרשאות" className={styles.profileIconLink}>
              <div> 
                  <ManageAccountsIcon />
              </div>
          </Link>
      </div>

      <nav className={styles.navBar}>
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <Link key={tab.name} href={tab.href}>
              <span className={pathname === tab.href ? styles.activeTab : styles.inactiveTab}>
                {tab.name}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminNavBar;