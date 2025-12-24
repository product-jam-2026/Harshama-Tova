'use client';

interface CloseButtonProps {
  onClick: () => void;
  style?: React.CSSProperties; // Allow passing custom styles (like positioning)
}

export default function CloseButton({ onClick, style }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      style={{
        background: '#F3F4F6',
        border: 'none',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        fontSize: '16px',
        cursor: 'pointer',
        color: '#4B5563',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
        
        // Allow overriding styles (critical for absolute positioning in different parents)
        ...style 
      }}
    >
      ✕
    </button>
  );
}