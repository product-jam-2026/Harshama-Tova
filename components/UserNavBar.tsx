'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const UserNavBar = () => {
  const pathname = usePathname();

  const tabs = [
    { name: 'מסך בית', href: '/User-home' },
    { name: 'סדנאות', href: '/pages/workshops' },
    { name: 'קבוצות', href: '/pages/groups' },
  ];

  return (
    <nav>
      {tabs.map((tab) => (
        <Link key={tab.name} href={tab.href}>
          <span>
            {tab.name}
          </span>
        </Link>
      ))}
    </nav>
  );
};

export default UserNavBar;
