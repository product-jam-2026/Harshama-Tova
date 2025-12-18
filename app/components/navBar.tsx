'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavBar = () => {
  const pathname = usePathname();

  const tabs = [
    { name: 'מסך בית', href: '/' },
    { name: 'סדנאות', href: '/' },
    { name: 'קבוצות', href: '/' },
  ];

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href}>
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
