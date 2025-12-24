interface ButtonProps {
  path?: string;
  text?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function Button({ path, text, onClick, children }: ButtonProps) {
  if (path) {
    return (
      <a href={path} className="btn">
        {text || children}
      </a>
    );
  }
  
  return (
    <button onClick={onClick} className="btn">
      {text || children}
    </button>
  );
}
