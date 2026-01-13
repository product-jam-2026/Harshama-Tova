'use client';
import { COMMUNITY_STATUSES } from "@/lib/constants";
import Styles from './steps.module.css';

interface StepProps { data: any; onUpdate: (data: any) => void; onNext: () => void; onBack: () => void; }

export default function Step2({ data, onUpdate, onNext, onBack }: StepProps) {
  const selectedStatuses: string[] = data.communityStatus || [];

  const handleToggle = (value: string) => {
    if (selectedStatuses.includes(value)) {
        onUpdate({ ...data, communityStatus: selectedStatuses.filter(s => s !== value) });
    } else {
        onUpdate({ ...data, communityStatus: [...selectedStatuses, value] });
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedStatuses.length > 0) onNext();
  };

  return (
    <div className={Styles.page}>
      <div dir="rtl" className={Styles.stepContainer}>
        <div className={Styles.header}>
          <button onClick={onBack} className={Styles.backButton} aria-label="חזור">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9.99812 15.83L4.16602 9.99789L9.99812 4.16579" stroke="#3A3A36" strokeWidth="1.66632" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.8302 9.99789H4.16602" stroke="#3A3A36" strokeWidth="1.66632" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={Styles.headerText}>
            <p className={Styles.stepTitle}>מה מביא אתכם.ן אלינו?</p>
            <p className={Styles.stepDescription}>להתאמת הליווי הנכון לכם</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className={Styles.statusOptions}>
          <div className={Styles.form}>
            {COMMUNITY_STATUSES.map((status) => {
              const isChecked = selectedStatuses.includes(status.value);
              return (
                <div
                  key={status.value}
                  className={isChecked ? Styles.statusOptionSelected : Styles.statusOption}
                  onClick={() => handleToggle(status.value)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isChecked}
                  style={{userSelect: 'none'}}
                >
                  {status.label}
                </div>
              );
            })}
          </div>
        </form>
      </div>
      <button type="button" className={Styles.button} onClick={() => handleSubmit()}>
        המשך
      </button>
    </div>
  );
}