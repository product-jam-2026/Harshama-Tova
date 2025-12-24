'use client';

interface SpinnerProps {
  label?: string; // The text is optional
  size?: string;  // The size is optional (default is 50px)
}

export default function Spinner({ label, size = '50px' }: SpinnerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
      
      {/* The spinner for loading */}
      <div className="spinner"></div>
      
      {/* Display the text only if it exists */}
      {label && (
        <p style={{ 
            color: '#666', 
            fontSize: '16px',
            fontWeight: '500',
            fontFamily: 'sans-serif',
            margin: 0 
        }}>
            {label}
        </p>
      )}

      <style jsx>{`
        .spinner {
          width: ${size};
          height: ${size};
          border: 4px solid #e2e8f0;
          border-top: 4px solid #2563EB;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}