import toast from 'react-hot-toast';

interface ConfirmToastOptions {
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
    toast(
      (t) => (
        <div className="toast-confirm-container">
          <p className="toast-confirm-message">{message}</p>
          <div className="toast-confirm-buttons">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="toast-button toast-button-cancel"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="toast-button toast-button-confirm"
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });
}

interface ConfirmActionOptions {
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
    toast.success(successMessage);
    onSuccess?.();
  } else {
    toast.error(errorMessage + (result.error ? ': ' + result.error : ''));
  }
}
