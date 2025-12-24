'use client';

import React from 'react';

interface ActionCircleButtonProps {
  icon: React.ReactNode; 
  color: string;         
  title: string;         
  onClick?: () => void;  
  href?: string;         
}

export default function ActionCircleButton({ 
  icon, 
  color, 
  title, 
  onClick, 
  href 
}: ActionCircleButtonProps) {
  
  const commonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: 'white',
    color: color, 
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    transition: 'transform 0.1s ease',
  };

  // If a href is provided, return an anchor element
  if (href) {
    return (
      <a href={href} style={commonStyle} title={title}>
        {icon}
      </a>
    );
  }

  // Otherwise, return a button element
  return (
    <button onClick={onClick} style={commonStyle} title={title}>
      {icon}
    </button>
  );
}