'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from '@/components/Navbar/Navbar.module.css';

interface UserNavBarProps {
  activeTab?: string;
  onTabSelect?: (tab: string) => void;
}

const UserNavBar = ({ activeTab, onTabSelect }: UserNavBarProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // --- Tab Detection ---
  let currentTab = activeTab;

  if (!currentTab) {
    const paramTab = searchParams.get('tab');
    
    if (paramTab) {
        currentTab = paramTab;
    } else if (pathname.includes('workshop-registration')) {
        currentTab = 'workshops';
    } else if (pathname.includes('group-registration')) {
        currentTab = 'groups';
    } else if (pathname === '/participants') { 
        // Only highlight "My Activities" if we are exactly on the main page
        currentTab = 'my-activities';
    }
  }

  const tabs = [
    { name: ' מרחב אישי', id: 'my-activities', href: '/participants' },
    { name: 'סדנאות', id: 'workshops', href: '/participants?tab=workshops' },
    { name: 'קבוצות', id: 'groups', href: '/participants?tab=groups' },
  ];

  return (
    <div className={styles.wrapper}>
      <nav className={styles.navBar}>
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => {
            if (onTabSelect) {
                return (
                    <div 
                      key={tab.id} 
                      onClick={() => onTabSelect(tab.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={currentTab === tab.id ? styles.activeTab : styles.inactiveTab}>
                        {tab.name}
                      </span>
                    </div>
                );
            }

            return (
                <Link 
                  key={tab.id} 
                  href={tab.href}
                >
                  <span className={currentTab === tab.id ? styles.activeTab : styles.inactiveTab}>
                    {tab.name}
                  </span>
                </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default UserNavBar;