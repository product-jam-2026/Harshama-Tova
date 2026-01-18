'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from '@/components/Navbar/Navbar.module.css';

// Props are optional to support both Dashboard (Client State) and Standalone pages
interface AdminNavBarProps {
  activeTab?: string;
  onTabSelect?: (tab: string) => void;
}

const AdminNavBar = ({ activeTab, onTabSelect }: AdminNavBarProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // --- Tab Detection ---
  // 1. Priority: Use 'activeTab' prop if provided (Dashboard mode)
  // 2. Fallback: Infer from URL parameters or Pathname (Standalone mode)
  let currentTab = activeTab;
  
  if (!currentTab) {
     const paramTab = searchParams.get('tab');
     if (paramTab) {
         currentTab = paramTab;
     } else if (pathname.includes('/requests')) {
         currentTab = 'requests';
     } else if (pathname.includes('/groups')) {
         currentTab = 'groups';
     } else if (pathname.includes('/workshops')) {
         currentTab = 'workshops';
     } else {
         currentTab = 'dashboard';
     }
  }

  const tabs = [
    { name: 'המרחב', id: 'dashboard', href: '/admin' },
    { name: 'בקשות', id: 'requests', href: '/admin?tab=requests' },
    { name: 'קבוצות', id: 'groups', href: '/admin?tab=groups' },
    { name: 'סדנאות', id: 'workshops', href: '/admin?tab=workshops' },
  ];

  return (
    <div className={styles.wrapper}>

      <nav className={styles.navBar}>
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => {
            // Case 1: Dashboard Mode (Instant Switch)
            // If onTabSelect is provided, we use a div with onClick
            if (onTabSelect) {
                return (
                    <div 
                      key={tab.name} 
                      onClick={() => onTabSelect(tab.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={currentTab === tab.id ? styles.activeTab : styles.inactiveTab}>
                        {tab.name}
                      </span>
                    </div>
                );
            } 
            
            // Case 2: Standalone Mode (Standard Navigation)
            // If no onTabSelect, we use standard Next.js Links
            return (
                <Link key={tab.name} href={tab.href}>
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

export default AdminNavBar;