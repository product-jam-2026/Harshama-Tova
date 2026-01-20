import { toast } from 'sonner';
import Button from '@/components/buttons/Button';

// Option for unregister confirmation toast
export interface UnregisterConfirmOptions {
  confirmMessage: string;
  action: () => Promise<{ success: boolean; error?: string }>;
  successMessage: string;
  errorMessage?: string;
  onSuccess?: () => void;
}

export async function showUnregisterConfirmToast({
  confirmMessage,
  action,
  successMessage,
  errorMessage = 'אירעה שגיאה',
  onSuccess
}: UnregisterConfirmOptions) {
  return new Promise<void>((resolve) => {
    toast.custom((t) => (
      <div className="toast-container">
        <h3 className="toast-thankyou-message">{confirmMessage}</h3>
        <div className="toast-confirm-buttons">
          <Button
            variant="secondary2"
            onClick={() => {
              toast.dismiss(t);
              resolve();
            }}
            className="toast-unregister-cancel"
          >
            חזור
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              toast.dismiss(t);
              const result = await action();
              if (result.success) {
                showThankYouToast({ message: 'הרשמתך בוטלה בהצלחה', buttonText: 'תודה :)' });
                onSuccess?.();
              } else {
                toast.error(errorMessage + (result.error ? ': ' + result.error : ''));
              }
              resolve();
            }}
            className="toast-unregister-confirm"
          >
            ביטול הרשמה
          </Button>
        </div>
      </div>
    ), { duration: Infinity });
  });
}

export interface ThankYouToastOptions {
  message: string;
  buttonText?: string;
  paragraph?: string;
}

export function showThankYouToast({ message, buttonText, paragraph = "" }: ThankYouToastOptions) {
  toast.custom((t) => (
    <div className="toast-container">
      <img src="/icons/V.svg" alt="Thank You" className="toast-thankyou-icon" />
      <h3 className="toast-thankyou-message">
        {message.split('\n').map((line, idx, arr) => (
          <span key={idx}>
            {line}
            {idx < arr.length - 1 && <br />}
          </span>
        ))}
      </h3>
      {paragraph && (
        <p className="toast-thankyou-paragraph">{paragraph}</p>
      )}
      
      {/* The button will render only if text is provided for it */}
      {buttonText && (
        <Button
          variant="primary"
          className="toast-thankyou-btn"
          onClick={() => toast.dismiss(t)}
        >
          {buttonText}
        </Button>
      )}
    </div>
  ));
}

// General confirmation toast
export interface ConfirmToastOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export async function showConfirmToast({
  message,
  confirmText = 'אישור',
  cancelText = 'ביטול'
}: ConfirmToastOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    toast.custom((t) => (
      <div className="toast-container">
        <h3 className="toast-prompt-message">{message}</h3>
        <div className="toast-confirm-buttons">
          <Button
            variant="secondary2"
            onClick={() => {
              toast.dismiss(t);
              resolve(false);
            }}
            className="toast-confirm-cancel"
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast.dismiss(t);
              resolve(true);
            }}
            className="toast-confirm-confirm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    ), { duration: Infinity });
  });
}

// Action with confirmation toast
export interface ConfirmActionOptions {
  confirmMessage: string;
  action: () => Promise<{ success: boolean; error?: string }>;
  successMessage: string;
  errorMessage?: string;
  onSuccess?: () => void;
}

export async function confirmAndExecute({
  confirmMessage,
  action,
  successMessage,
  errorMessage = 'אירעה שגיאה',
  onSuccess
}: ConfirmActionOptions) {
  const confirmed = await showConfirmToast({ message: confirmMessage });
  if (!confirmed) return;
  const result = await action();
  if (result.success) {
    showThankYouToast({ message: successMessage});
    onSuccess?.();
  } else {
    toast.error(errorMessage + (result.error ? ': ' + result.error : ''));
  }
}