'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

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
    { name: 'הפעילויות במרחב', href: '/admin' },
    { name: 'בקשות', href: '/admin/requests' },
    { name: 'קבוצות', href: '/admin/groups' },
    { name: 'סדנאות', href: '/admin/workshops' },
  ];

  return (
    <nav className="admin-navbar">
      <div className="flex-gap-4">
        {tabs.map((tab) => (
          <Link key={tab.name} href={tab.href}>
            <span className={pathname === tab.href ? 'active-tab' : 'inactive-tab'}>
              {tab.name}
            </span>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* Icon for managing admins */}
        <Link href="/admin/manage-admins" title="ניהול הרשאות">
            <div style={{ display: 'flex', alignItems: 'center' }}> 
                <ManageAccountsIcon 
                    style={{ 
                        cursor: 'pointer', 
                        color: pathname === '/admin/manage-admins' ? '#2563eb' : 'inherit' 
                    }} 
                />
            </div>
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

export default AdminNavBar;