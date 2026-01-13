'use client';
import Styles from './steps.module.css';

interface StepProps { data: any; onUpdate: (data: any) => void; onSubmit: () => void; onBack: () => void; isSubmitting: boolean; }

export default function Step3({ data, onUpdate, onSubmit, onBack, isSubmitting }: StepProps) {
  return (
    <div className={Styles.page}>
      <div dir="rtl" className={Styles.stepContainer}>
        <div className={Styles.header}>
          <button
            type="button"
            className={Styles.backButton}
            onClick={onBack}
            aria-label="חזור"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5" stroke="#3A3A36" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 6L5 12L11 18" stroke="#3A3A36" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={Styles.headerText}>
            <h1 className={Styles.stepTitle}>משהו נוסף שתרצו שנדע?</h1>
            <p className={Styles.stepDescription}>מרחב לשתף אותנו בפרטים נוספים</p>
          </div>
        </div>
        <div className={Styles.textField}>
          <textarea
            className={Styles.input}
            rows={16}
            placeholder="כתבו כאן כל מה שתרצו..."
            value={data.comments || ''}
            onChange={e => onUpdate({ ...data, comments: e.target.value })}
            style={{resize: 'vertical'}}
          />
        </div>
        <button
          type="button"
          className={Styles.button}
          onClick={onSubmit}
          disabled={isSubmitting}        >
          {isSubmitting ? 'יוצר משתמש...' : 'יצירת משתמש'}
        </button>
      </div>
    </div>
  );
}