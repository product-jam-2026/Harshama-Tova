'use client';

import { useState, useMemo, useEffect, useRef, CSSProperties } from 'react';
import { addAdmin, removeAdmin } from './actions';
import Button from '@/components/buttons/Button'; 
import Spinner from '@/components/Spinner/Spinner';
import { confirmAndExecute } from '@/lib/toast-utils';
import { toast } from 'sonner';

// Icons
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

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
    <div style={styles.container}>
      
      <h2 style={styles.header}>ניהול הרשאות מנהלות</h2>

      {/* --- Admins List --- */}
      <div style={styles.listContainer}>
        
        {sortedAdmins.length === 0 && (
            <div style={styles.emptyState}>
                רשימת המנהלות ריקה
            </div>
        )}

        {sortedAdmins.map((admin) => {
          const isMe = admin.email.toLowerCase() === currentUserEmail?.toLowerCase();

          return (
            <div 
                key={admin.id} 
                style={{
                    ...styles.rowBase,
                    border: isMe ? '1px solid #3b82f6' : '1px solid transparent', // Blue border for me
                }}
            >
              {/* Right: Email Info */}
              <div style={styles.rowInfo}>
                  <span style={{ 
                      ...styles.emailText, 
                      fontWeight: isMe ? 'bold' : 'normal' 
                  }}>
                      {admin.email}
                  </span>
                  {isMe && (
                      <span style={styles.meBadge}>(אני)</span>
                  )}
              </div>

              {/* Left: Actions */}
              <div>
                {!isMe ? (
                  <button 
                    type="button"
                    onClick={() => handleRemove(admin.id, admin.email)}
                    style={styles.deleteButton}
                    title="מחיקה"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                ) : (
                    <div style={{ width: '24px' }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Interactive Add Form --- */}
      <div style={styles.formContainer} ref={formRef}>
        {!isFormOpen ? (
            // "Plus" Button
            <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                style={styles.expandButton}
            >
                <AddIcon />
                <span>הוספת מנהלת חדשה</span>
            </button>
        ) : (
            // Input Form
            <div style={styles.expandedFormCard}>
                <div style={styles.formHeader}>
                    <span style={styles.formTitle}>פרטי מנהלת חדשה</span>
                    
                    <Button 
                        variant="icon"
                        onClick={() => setIsFormOpen(false)}
                        icon={<CloseIcon fontSize="small" />}
                        title="סגור"
                    />
                </div>

                <form onSubmit={handleAdd} style={styles.formElement}>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        autoFocus
                        style={styles.input}
                    />
                    <Button 
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}                         
                        onClick={() => {}} 
                    >
                        {isSubmitting ? (
                            <Spinner size={18} />
                        ) : (
                              "הוסף"
                        )}
                    </Button>
                </form>
            </div>
        )}
      </div>

    </div>
  );
}

// TEMPORARY: we will replace this with CSS later, when we refactor the styles
// --- Styles Object (CSS-in-JS) ---
const styles: Record<string, CSSProperties> = {
    container: {
        maxWidth: '600px',
        margin: '40px auto',
        fontFamily: 'sans-serif',
        direction: 'rtl',
    },
    header: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    emptyState: {
        padding: '20px',
        textAlign: 'center',
        color: '#888',
        background: '#f9f9f9',
        border: '1px dashed #ccc',
        borderRadius: '8px',
    },
    // Row Styles
    rowBase: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#f1f5f9', // Unified gray background
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
    },
    rowInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    emailText: {
        fontSize: '15px',
        color: '#333',
        fontFamily: 'monospace',
    },
    meBadge: {
        fontSize: '11px',
        color: '#3b82f6',
        background: '#dbeafe',
        padding: '2px 8px',
        borderRadius: '10px',
        fontWeight: 'bold',
    },
    deleteButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#94a3b8',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
    },
    // Form Container
    formContainer: {
        marginTop: '20px',
    },
    expandButton: {
        width: '100%',
        padding: '12px',
        border: '2px dashed #cbd5e1',
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        color: '#64748b',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '14px',
        transition: 'all 0.2s ease',
    },
    expandedFormCard: {
        padding: '15px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        animation: 'fadeIn 0.2s ease-in-out',
    },
    formHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '15px',
        alignItems: 'center',
    },
    formTitle: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#64748b',
    },
    
    formElement: {
        display: 'flex',
        gap: '10px',
    },
    input: {
        flex: 1,
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '14px',
        direction: 'ltr',
        textAlign: 'right', // Placeholder right, text left (handled by ltr)
        outline: 'none',
    },
    submitContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    }
};