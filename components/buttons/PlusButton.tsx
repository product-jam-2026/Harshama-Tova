import Link from "next/link";

interface FloatingPlusButtonProps {
  href: string; 
  label: string;
}

export default function PlusButton({ href, label }: FloatingPlusButtonProps) {
  return (
    <Link
      href={href}
      title={label}
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '40px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#111827',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        zIndex: 50,
        transition: 'transform 0.2s ease',
        cursor: 'pointer',
      }}
    >
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </Link>
  );
}