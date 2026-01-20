'use client';

import { useState, useMemo, useEffect } from 'react';
import { addAdmin, removeAdmin } from './actions';
import { confirmAndExecute } from '@/lib/utils/toast-utils';
import { toast } from 'sonner';
import AddIcon from '@mui/icons-material/Add';
import Button from '@/components/buttons/Button';
import { showThankYouToast } from '@/lib/utils/toast-utils';

import styles from './AdminList.module.css';

// --- Types ---
interface AdminUser {
  id: string;
  email: string;
}

interface Props {
  admins: AdminUser[];
  currentUserEmail?: string;
}

export default function AdminList({ admins, currentUserEmail }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent Hydration mismatch
  useEffect(() => { setIsMounted(true); }, []);

  // Current user first, then others
  const sortedAdmins = useMemo(() => {
    if (!admins || admins.length === 0) return [];
    return [...admins].sort((a, b) => {
      const emailA = a.email.toLowerCase();
      const emailB = b.email.toLowerCase();
      const myEmail = currentUserEmail?.toLowerCase();
      if (emailA === myEmail) return -1;
      if (emailB === myEmail) return 1;
      return 0; 
    });
  }, [admins, currentUserEmail]);

  // Add Admin - Uses toast.custom manually since confirmAndExecute doesn't support inputs
  const handleAdd = async () => {
    const email = await new Promise<string | null>((resolve) => {
      let inputValue = '';
      
      toast.custom(
        (t) => (
          <div className="toast-container">
            <h3 className="toast-prompt-message">פרטי מנהלת חדשה</h3>
            <input
              type="email"
              autoFocus
              placeholder="email@example.com"
              className="toast-prompt-input"
              onChange={(e) => { inputValue = e.target.value; }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                   toast.dismiss(t);
                   resolve(inputValue);
                }
              }}
            />
            <div className="toast-confirm-buttons">
              <Button
                variant="secondary2"
                onClick={() => {
                  toast.dismiss(t);
                  resolve(null); // User cancelled
                }}
                className="toast-button toast-button-cancel"
              >
                ביטול
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  toast.dismiss(t);
                  resolve(inputValue); // User confirmed
                }}
                className="toast-button toast-button-confirm"
              >
                הוסף
              </Button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    // If user cancelled or entered nothing
    if (!email) return;

    // Simple validation
    if (!email.includes('@')) {
        toast.error('נא להזין כתובת אימייל תקינה');
        return;
    }

    // Execute action
    const res = await addAdmin(email);
    
    if (res?.error) {
        toast.error(res.error);
    } else {
        showThankYouToast({message: 'מנהלת נוספה בהצלחה!'});
    }
  };

  // Remove Admin
  const handleRemove = async (id: string, email: string) => {
    await confirmAndExecute({
        confirmMessage: `האם להסיר את ${email} מניהול המערכת?`,
        successMessage: 'המנהלת הוסרה בהצלחה',
        errorMessage: 'שגיאה בהסרה',
        action: async () => {
            const res = await removeAdmin(id, email);
            if (res.error) return { success: false, error: res.error };
            return { success: true };
        }
    });
  };

  if (!isMounted) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>ניהול הרשאות מנהלות</h3>

      <div className={styles.listContainer}>
        {sortedAdmins.length === 0 && (
          <div className={styles.emptyState}>רשימת המנהלות ריקה</div>
        )}

        {sortedAdmins.map((admin) => {
          const isMe = admin.email.toLowerCase() === currentUserEmail?.toLowerCase();
          return (
            <div key={admin.id} className={styles.rowBase}>
              <div className={styles.rowInfo}>
                <span className={styles.emailText}>{admin.email}</span>
                {/* Reverted back to span with styles.meBadge */}
                {isMe && <span className={styles.meBadge}>אני</span>}
              </div>
              <div>
                {!isMe ? (
                  <button
                    type="button"
                    onClick={() => handleRemove(admin.id, admin.email)}
                    className="delete-button"
                    title="מחיקה"
                  >
                    <img src="/icons/zevel.svg" alt="מחיקה" />
                  </button>
                ) : (
                  <div className={styles.deleteButtonPlaceholder} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.formContainer}>
          <button
            type="button"
            onClick={handleAdd}
            className="add-new-button"
          >
            הוספת מנהלת חדשה
            <AddIcon />
          </button>
      </div>
    </div>
  );
}