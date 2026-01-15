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
    <div className="form-page">
      <div dir="rtl" className="form-container">
        
        <div className="form-header">
          <div>
            <p className="form-title">מה מביא אתכם אלינו?</p>
            <p className="form-description">להתאמת הליווי הנכון לכם</p>
          </div>
        </div>

        {/* Local styles used here for the specific card layout */}
        <form onSubmit={handleSubmit} className={Styles.statusOptions}>
          <div className="form-body">
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