interface ButtonProps {
  path?: string;
  text?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function Button({ path, text, onClick, children, disabled }: ButtonProps) {
  if (path) {
    return (
      <a href={path} className="btn">
        {text || children}
      </a>
    );
  }
  
  return (
    <button 
      onClick={onClick} 
      className="btn"
      disabled={disabled}
      style={{ 
        opacity: disabled ? 0.5 : 1, 
        cursor: disabled ? 'not-allowed' : 'pointer' 
      }}
      >
      {text || children}
    </button>
  );
}
