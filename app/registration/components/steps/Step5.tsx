'use client';
import { useState } from 'react';
import Spinner from "@/components/Spinner/Spinner";

interface StepProps { data: any; onUpdate: (data: any) => void; onSubmit: () => void; onBack: () => void; isSubmitting: boolean; }

const GENDER_OPTIONS = [
  { value: 'male', label: 'זכר' },
  { value: 'female', label: 'נקבה' },
  { value: 'other', label: 'אחר / מעדיף/ה לא לציין' },
];

export default function Step5({ data, onUpdate, onSubmit, onBack, isSubmitting }: StepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.birthDate && data.gender) onSubmit();
  };

  return (
    <div dir="rtl" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}><span>שלב 5 מתוך 5</span></div>
      <h1 style={{ marginBottom: '10px' }}>פרטים נוספים</h1>
      <p style={{ marginBottom: '30px' }}>כדי להתאים לכם את החוויה הטובה ביותר</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>תאריך לידה</label>
          <input
            type="date"
            required
            max={new Date().toISOString().split('T')[0]}
            value={data.birthDate || ''}
            onChange={(e) => onUpdate({ ...data, birthDate: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>מגדר</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {GENDER_OPTIONS.map((option) => (
              <label key={option.value} style={{ display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', backgroundColor: data.gender === option.value ? '#e3f2fd' : 'white' }}>
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={data.gender === option.value}
                  onChange={(e) => onUpdate({ ...data, gender: e.target.value })}
                  style={{ marginLeft: '10px' }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
          <button type="button" onClick={onBack} disabled={isSubmitting} style={{ padding: '12px 24px', backgroundColor: '#f0f0f0', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>חזור</button>
          <button type="submit" disabled={isSubmitting} style={{ padding: '12px 24px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isSubmitting ? <Spinner /> : 'סיום'}
          </button>
        </div>
      </form>
    </div>
  );
}