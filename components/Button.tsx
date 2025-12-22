interface ButtonProps {
  path: string;
  text: string;
}

export default function Button({ path, text }: ButtonProps) {
  return (
    <a href={path} className="btn">
      {text}
    </a>
  );
}
