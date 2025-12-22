'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminNavBar = () => {
  const pathname = usePathname();

  const tabs = [
    { name: 'הפעילויות במרחב', href: '/admin' },
    { name: 'בקשות', href: '/admin/requests' },
    { name: 'קבוצות', href: '/admin/groups' },
    { name: 'סדנאות', href: '/admin/workshops' },
  ];

return (
    <nav className="admin-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <Link key={tab.name} href={tab.href}>
            <span className={pathname === tab.href ? 'active-tab' : 'inactive-tab'}>
              {tab.name}
            </span>
          </Link>
        ))}
      </div>

      <Link href="/logout">
        <span className="cursor-pointer">
          התנתקות
        </span>
      </Link>
    </nav>
  );
};

export default AdminNavBar;
