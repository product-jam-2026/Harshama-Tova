'use client';
import Styles from './steps.module.css';

interface StepProps { data: any; onUpdate: (data: any) => void; onSubmit: () => void; onBack: () => void; isSubmitting: boolean; }

export default function Step3({ data, onUpdate, onSubmit, onBack, isSubmitting }: StepProps) {
  return (
    <div className="form-page">
      <div dir="rtl" className="form-container">
        
        <div className="form-header">
          <div>
            <h1 className="form-title">שנכיר אתכם טוב יותר</h1>
            <p className="form-description">מרחב לשתף במה שחשוב לכם</p>
          </div>
        </div>

        <div className="form-textarea-container">
          <textarea
            rows={16}
            placeholder="אנחנו כאן לכל דבר..."
            value={data.comments || ''}
            onChange={e => onUpdate({ ...data, comments: e.target.value })}
          />
        </div>
      </div>

      <div className={Styles.buttonsContainer}>
        
        <button
          type="button"
          className={`${Styles.button} ${Styles.primaryAction}`}
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
              <span>יוצר משתמש</span>
              <div className={Styles.loadingDotsContainer}>
                <span className={Styles.dot}></span>
                <span className={Styles.dot}></span>
                <span className={Styles.dot}></span>
              </div>
            </div>
          ) : (
            'יצירת משתמש'
          )}
        </button>

        <button
          type="button"
          className={`${Styles.button} ${Styles.secondaryAction}`}
          onClick={onBack}
          disabled={isSubmitting}
        >
          הקודם
        </button>
      </div>

    </div>
  );
}