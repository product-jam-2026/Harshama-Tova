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
    <div className={Styles.formPage}>
      <div dir="rtl" className={Styles.formContainer}>
        
        <div className={Styles.formHeader}>
          <div>
            <p className={Styles.formTitle}>מה מביא אתכם אלינו?</p>
            <p className={Styles.formDescription}>להתאמת הליווי הנכון לכם</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={Styles.statusOptions}>
          <div className={Styles.formBody}>
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
                >
                  {status.label}
                </div>
              );
            })}
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

        <button 
            type="button" 
            className={`${Styles.button} ${Styles.secondaryAction}`} 
            onClick={onBack} 
        >
          הקודם
        </button>
      </div>

    </div>
  );
}