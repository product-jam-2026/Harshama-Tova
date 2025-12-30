'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';


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
    <div className="navbar-wrapper">
      <div className="navbar-icons-container">
        <NotificationBell />
        <Link href="/participants/profile" className="profile-icon-link">
          {mounted && <img src="/icons/profile.svg" alt="Profile" className="profile-icon" />}
        </Link>
      </div>
      
      <nav className="user-navbar">
        <div className="navbar-tabs-container">
          {tabs.map((tab) => (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={pathname === tab.href ? 'active-tab' : 'inactive-tab'}
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
