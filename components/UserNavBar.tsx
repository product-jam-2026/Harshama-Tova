'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const UserNavBar = () => {
  const pathname = usePathname();

  const tabs = [
    { name: 'מסך בית', href: '/participants' },
    { name: 'סדנאות', href: '/participants/workshop-registration' },
    { name: 'קבוצות', href: '/participants/group-registration' },
  ];

  return (
    <nav className = "user-navbar">
      {tabs.map((tab) => (
        <Link key={tab.name} href={tab.href}>
          <span className={pathname === tab.href ? 'active-tab' : 'inactive-tab'}>
            {tab.name}
          </span>
        </Link>
      ))}
    </nav>
  );
};

export default UserNavBar;
