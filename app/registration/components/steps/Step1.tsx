'use client';

interface StepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function Step1({ data, onUpdate, onNext }: StepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate if needed
    if (data.firstName && data.lastName) {
        onNext();
    }
  };

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}><span>שלב 1 מתוך 5</span></div>
      <h1 style={{ marginBottom: '10px' }}>בואו נכיר</h1>
      <p style={{ marginBottom: '30px' }}>נשמח להכיר אתכם יותר טוב</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>שם פרטי</label>
          <input
            type="text"
            required
            value={data.firstName || ''}
            onChange={(e) => onUpdate({ ...data, firstName: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>שם משפחה</label>
          <input
            type="text"
            required
            value={data.lastName || ''}
            onChange={(e) => onUpdate({ ...data, lastName: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
          המשך
        </button>
      </form>
    </div>
  );
}