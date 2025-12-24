import Link from "next/link";

interface BackButtonProps {
  href: string;
  text: string;
}

export default function BackButton({ href, text }: BackButtonProps) {
  return (
    <Link 
      href={href} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        color: '#666', 
        textDecoration: 'none', 
        marginBottom: '20px', 
        fontSize: '14px',
        fontWeight: '500',
        transition: 'color 0.2s'
      }}
    >
      <span style={{ marginLeft: '8px', fontSize: '18px' }}>→</span>
      {text}
    </Link>
  );
}