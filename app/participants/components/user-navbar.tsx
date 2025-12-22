'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const UserNavBar = () => {
  const pathname = usePathname();

  const tabs = [
    { name: 'הפעילויות שלי', href: '/participants' },
    { name: 'סדנאות', href: '/participants/workshop-registration' },
    { name: 'קבוצות', href: '/participants/group-registration' },
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

      <Link href="/logout">
        <span className="cursor-pointer">
          התנתקות
        </span>
      </Link>
    </nav>
  );
};

export default UserNavBar;
