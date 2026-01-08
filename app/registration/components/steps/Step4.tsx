'use client';
import { COMMUNITY_STATUSES } from "@/lib/constants";

interface StepProps { data: any; onUpdate: (data: any) => void; onNext: () => void; onBack: () => void; }

export default function Step4({ data, onUpdate, onNext, onBack }: StepProps) {
  const selectedStatuses: string[] = data.communityStatus || [];

  const handleToggle = (value: string) => {
    if (selectedStatuses.includes(value)) {
        onUpdate({ ...data, communityStatus: selectedStatuses.filter(s => s !== value) });
    } else {
        onUpdate({ ...data, communityStatus: [...selectedStatuses, value] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatuses.length > 0) onNext();
  };

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}><span>שלב 4 מתוך 5</span></div>
      <h1 style={{ marginBottom: '10px' }}>הסטטוס הקהילתי שלכם</h1>
      <p style={{ marginBottom: '30px' }}>בחרו את המצב/ים המתאר/ים אתכם בצורה הטובה ביותר</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {COMMUNITY_STATUSES.map((status) => {
                const isChecked = selectedStatuses.includes(status.value);
                return (
                    <label key={status.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff' }}>
                        <input 
                            type="checkbox" 
                            value={status.value}
                            checked={isChecked}
                            onChange={() => handleToggle(status.value)}
                            style={{ width: '18px', height: '18px', accentColor: 'black' }}
                        />
                        <span style={{ fontSize: '16px' }}>{status.label}</span>
                    </label>
                );
            })}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '20px' }}>
          <button type="button" onClick={onBack} style={{ padding: '12px 24px', backgroundColor: '#f0f0f0', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>חזור</button>
          <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>המשך</button>
        </div>
      </form>
    </div>
  );
}