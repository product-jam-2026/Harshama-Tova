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
    <div className={Styles.formPage}>
      <div dir="rtl" className={Styles.formContainer}>
        <div className={Styles.formHeader}>   
          <p className={Styles.formTitle}>פרטים אישיים</p>
          <p className={Styles.formDescription}>נשמח להכיר אתכם יותר טוב</p> 
        </div>
        <form onSubmit={handleSubmit} className={Styles.formBody}>
          <div className={Styles.formField}>
            <label className={Styles.formLabel}>שם פרטי</label>
            <input
              type="text"
              required
              value={data.firstName || ''}
              onChange={(e) => onUpdate({ ...data, firstName: e.target.value })}
              className={Styles.formInput}
            />
          </div>
          <div className={Styles.formField}>
            <label className={Styles.formLabel}>שם משפחה</label>
            <input
              type="text"
              required
              value={data.lastName || ''}
              onChange={(e) => onUpdate({ ...data, lastName: e.target.value })}
              className={Styles.formInput}
            />
          </div>
          <div className={Styles.formField}>
            <label className={Styles.formLabel}>מגדר</label>
            <select
              name="gender"
              required
              value={data.gender || ''}
              onChange={(e) => onUpdate({ ...data, gender: e.target.value })}
              className={Styles.formInput}
            >
              <option value="" disabled>בחר/י</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className={Styles.formField}>
            <label className={Styles.formLabel}>תאריך לידה</label>
            <input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={data.birthDate || ''}
              onChange={(e) => onUpdate({ ...data, birthDate: e.target.value })}
              className={Styles.formInput}
            />
          </div>
          <div className={Styles.formField}>
            <label className={Styles.formLabel}>עיר/יישוב</label>
            <input
              type="text"
              required
              value={data.city || ''}
              onChange={(e) => onUpdate({ ...data, city: e.target.value })}
              className={Styles.formInput}
            />
          </div>
          <div className={Styles.formField}>
            <label className={Styles.formLabel}>מספר טלפון</label>
            <input
              type="tel"
              required
              value={data.phone || ''}
              onChange={(e) => onUpdate({ ...data, phone: e.target.value })}
              className={Styles.formInput}
            />
          </div>
        </form>
      </div>

      <div className={Styles.buttonsContainer}>
        <button 
          type="button" 
          className={`${Styles.button} ${Styles.primaryAction}`} 
          onClick={() => handleSubmit()}
        >
          הבא
        </button>
      </div>

    </div>
  );
}