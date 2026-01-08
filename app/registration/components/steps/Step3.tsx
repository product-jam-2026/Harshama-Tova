'use client';
interface StepProps { data: any; onUpdate: (data: any) => void; onNext: () => void; onBack: () => void; }

export default function Step3({ data, onUpdate, onNext, onBack }: StepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.city) onNext();
  };

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}><span>שלב 3 מתוך 5</span></div>
      <h1 style={{ marginBottom: '10px' }}>מקום מגורים</h1>
      <p style={{ marginBottom: '30px' }}>לצורך התאמה ותיאום</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>עיר/יישוב</label>
          <input
            type="text"
            required
            value={data.city || ''}
            onChange={(e) => onUpdate({ ...data, city: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
          <button type="button" onClick={onBack} style={{ padding: '12px 24px', backgroundColor: '#f0f0f0', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>חזור</button>
          <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>המשך</button>
        </div>
      </form>
    </div>
  );
}