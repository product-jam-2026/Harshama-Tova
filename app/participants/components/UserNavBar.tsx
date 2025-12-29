'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import dynamic from 'next/dynamic';

// Dynamically import the icon to avoid SSR hydration issues
const PersonIcon = dynamic(
  () => import('@mui/icons-material/Person'),
  { ssr: false }
);

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
    <nav className="user-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <Link key={tab.name} href={tab.href}>
            <span className={pathname === tab.href ? 'active-tab' : 'inactive-tab'}>
              {tab.name}
            </span>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <NotificationBell />
        <Link href="/participants/profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {mounted && <PersonIcon style={{ color: '#333', fontSize: '28px', cursor: 'pointer' }} />}
        </Link>
        <Link href="/logout">
          <span className="cursor-pointer">
            התנתקות
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default UserNavBar;
