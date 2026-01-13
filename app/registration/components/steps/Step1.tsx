'use client';
import Styles from './steps.module.css';

interface StepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function Step1({ data, onUpdate, onNext }: StepProps) {
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Validate if needed
    if (data.firstName && data.lastName) {
        onNext();
    }
  };

  const GENDER_OPTIONS = [
  { value: 'male', label: 'זכר' },
  { value: 'female', label: 'נקבה' },
  { value: 'other', label: 'אחר / מעדיף/ה לא לציין' },
  ];

  return (
    <div className={Styles.page}>
      <div dir="rtl" className={Styles.stepContainer}>
        <div className={Styles.headerWithoutBack}>   
          <p className={Styles.stepTitle}>פרטים אישיים</p>
          <p className={Styles.stepDescription}>נשמח להכיר אתכם.ן יותר טוב</p> 
        </div>
        <form onSubmit={handleSubmit} className={Styles.form}>
          <div className={Styles.field}>
            <label className={Styles.label}>שם פרטי</label>
            <input
              type="text"
              required
              value={data.firstName || ''}
              onChange={(e) => onUpdate({ ...data, firstName: e.target.value })}
              className={Styles.input}
            />
          </div>
          <div className={Styles.field}>
            <label className={Styles.label}>שם משפחה</label>
            <input
              type="text"
              required
              value={data.lastName || ''}
              onChange={(e) => onUpdate({ ...data, lastName: e.target.value })}
              className={Styles.input}
            />
          </div>
          <div className={Styles.field}>
            <label className={Styles.label}>מגדר</label>
            <select
              name="gender"
              required
              value={data.gender || ''}
              onChange={(e) => onUpdate({ ...data, gender: e.target.value })}
              className={Styles.input}
            >
              <option value="" disabled>בחר/י</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className={Styles.field}>
            <label className={Styles.label}>תאריך לידה</label>
            <input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={data.birthDate || ''}
              onChange={(e) => onUpdate({ ...data, birthDate: e.target.value })}
              className={Styles.input}
            />
          </div>
          <div className={Styles.field}>
            <label className={Styles.label}>עיר/יישוב</label>
            <input
              type="text"
              required
              value={data.city || ''}
              onChange={(e) => onUpdate({ ...data, city: e.target.value })}
              className={Styles.input}
            />
          </div>
          <div className={Styles.field}>
            <label className={Styles.label}>מספר טלפון</label>
            <input
              type="tel"
              required
              value={data.phone || ''}
              onChange={(e) => onUpdate({ ...data, phone: e.target.value })}
              className={Styles.input}
            />
          </div>
        </form>
      </div>
      <button type="button" className={Styles.button} onClick={() => handleSubmit()}>
        המשך
      </button>
    </div>
  );
}