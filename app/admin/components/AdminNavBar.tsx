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
    { name: 'המרחב', href: '/admin' },
    { name: 'בקשות', href: '/admin/requests' },
    { name: 'קבוצות', href: '/admin/groups' },
    { name: 'סדנאות', href: '/admin/workshops' },
  ];

  return (
    <div className="navbar-wrapper">

      <div className="navbar-icons-container">
          <Link href="/logout">
              <span>
              התנתקות
              </span>
          </Link>

          {/* Icon for managing admins */}
          <Link href="/admin/manage-admins" title="ניהול הרשאות" className="profile-icon-link">
              <div> 
                  <ManageAccountsIcon />
              </div>
          </Link>
      </div>

      <nav className="admin-navbar">
        <div className="navbar-tabs-container">
          {tabs.map((tab) => (
            <Link key={tab.name} href={tab.href}>
              <span className={pathname === tab.href ? 'active-tab' : 'inactive-tab'}>
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