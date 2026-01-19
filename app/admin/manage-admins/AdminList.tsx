'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { addAdmin, removeAdmin } from './actions';
import Button from '@/components/buttons/Button';
import Spinner from '@/components/Spinner/Spinner';
import { confirmAndExecute } from '@/lib/utils/toast-utils';
import { toast } from 'sonner';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

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

// --- Helper Hook: Handle Click Outside ---
function useOnClickOutside(ref: React.RefObject<HTMLDivElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default function AdminList({ admins, currentUserEmail }: Props) {
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);

  // Close form when clicking outside
  useOnClickOutside(formRef, () => setIsFormOpen(false));

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

  // Add Admin
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsSubmitting(true);
    const res = await addAdmin(newEmail);
    setIsSubmitting(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success('מנהלת נוספה בהצלחה!');
      setNewEmail('');
      setIsFormOpen(false); 
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

      <div className={styles.formContainer} ref={formRef}>
        {!isFormOpen ? (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className={styles.expandButton}
          >
            <span>הוספת מנהלת חדשה</span>
            <AddIcon />
          </button>
        ) : (
          <div className={styles.expandedFormCard}>
            
            <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className={`closeButton ${styles.closeButtonLeft}`} 
                title="סגור"
            >
                <CloseIcon fontSize="small" />
            </button>

            <div className={styles.formHeader}>
              <span className={styles.formTitle}>פרטי מנהלת חדשה</span>
            </div>
            <form onSubmit={handleAdd} className={styles.formElement}>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                required
                autoFocus
                className={styles.input}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                onClick={() => {}}
              >
                {isSubmitting ? <Spinner size={18} /> : 'הוסף'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}