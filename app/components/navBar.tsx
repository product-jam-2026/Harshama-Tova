'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavBar = () => {
  const pathname = usePathname();

  const tabs = [
    { id: 1, name: 'Home', href: '/' },
    { id: 2, name: 'Login', href: '/auth/login' },
    { id: 3, name: 'Logout', href: '/auth/logout' },
  ];

  return (
    <nav>
      {tabs.map((tab) => (
        <Link key={tab.id} href={tab.href}>
          <span
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              backgroundColor: pathname === tab.href ? '#0070f3' : 'transparent',
              color: pathname === tab.href ? 'white' : 'black',
              borderRadius: '4px',
            }}
          >
            {tab.name}
          </span>
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;
