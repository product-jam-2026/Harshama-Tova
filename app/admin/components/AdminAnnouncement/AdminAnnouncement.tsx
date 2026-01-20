'use client';

import { useState } from 'react';
import { createAnnouncement, deleteAnnouncement } from '@/app/actions/announcements';
import { toast } from 'sonner';
import { CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AnnouncementsCarousel from '@/components/AnnouncementsCarousel/AnnouncementsCarousel';
import styles from './AdminAnnouncement.module.css';
import Button from '@/components/buttons/Button';
import { showThankYouToast } from '@/lib/utils/toast-utils';

interface Announcement {
  id: string;
  content: string;
  created_at: string;
}

interface AdminAnnouncementProps {
  announcements: Announcement[]; 
  onRefresh: () => void; 
}

export default function AdminAnnouncement({ announcements, onRefresh }: AdminAnnouncementProps) {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  // --- Create Announcement Logic ---
  const handleCreateClick = async () => {
    // Open toast and wait for user input
    const text = await new Promise<string | null>((resolve) => {
      let inputValue = ''; 
      toast.custom(
        (t) => (
          <div className="toast-prompt-container">
            <h3 className='toast-prompt-message'>הודעה חדשה למרחב</h3>
            <p className="toast-sub-prompt-message">
              עם פרסום ההודעה, היא תופיע לכל המשתמשים באפליקציה.
            </p>
            <textarea
              className="toast-prompt-input"
              placeholder="הודעה כללית במרחב כמו ערב מרק חם/מדורה."
              onChange={(e) => inputValue = e.target.value}
              autoFocus
            />
            <div className="toast-confirm-buttons">
              <Button variant='secondary2' onClick={() => { toast.dismiss(t); resolve(null); }} className="toast-button toast-button-cancel">ביטול</Button>
              <Button variant='primary' onClick={() => { toast.dismiss(t); resolve(inputValue); }} className="toast-button toast-button-confirm">פרסום</Button>
            </div>
          </div>
        ),
        { duration: Infinity, position: 'top-center' }
      );
    });

    // If user cancelled or entered nothing - stop here
    if (!text || !text.trim()) return;

    // Send to server
    setStatus('loading');
    const res = await createAnnouncement(text);
    
    if (res.success) {
      showThankYouToast({ message: 'הודעה נוספה!'});
      onRefresh();
    } else {
      toast.error('שגיאה');
    }
    setStatus('idle');
  };

  // --- Delete Announcement Logic ---
  const handleDelete = async (id: string) => {
    // Confirm delete toast
    const confirmed = await new Promise<boolean>((resolve) => {
      toast.custom((t) => (
        <div className="toast-confirm-container">
          <h3 className='toast-prompt-message'>למחוק את ההודעה?</h3>
          <div className='toast-confirm-buttons'>
            <Button variant='secondary2' onClick={() => { toast.dismiss(t); resolve(false); }} className="toast-button toast-button-cancel">ביטול</Button>
            <Button variant='secondary1' onClick={() => { toast.dismiss(t); resolve(true); }} className="toast-button toast-button-confirm">מחיקה</Button>
          </div>
        </div>
      ), { duration: Infinity, position: 'top-center' });
    });

    if (!confirmed) return;

    const res = await deleteAnnouncement(id);
    if (res.success) {
      showThankYouToast({ message: 'נמחק!'});
      onRefresh();
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Header Area: Title on the right, Button on the left */}
      <div className={styles.header}>
        
        {/* Title */}
        <h2 className={styles.title}>
          הודעות יומיות במרחב
        </h2>

        {/* Add Button */}
        <button
          onClick={handleCreateClick}
          disabled={status === 'loading'}
          className={styles.addButton}
        >
          {status === 'loading' ? <CircularProgress size={24} color="inherit" /> : <AddIcon fontSize="medium" />}
        </button>
      </div>

      {/* --- Using the Carousel Component --- 
          This component handles the display, auto-scroll, and dots internally.
          We pass the announcements and the delete handler.
      */}
      <AnnouncementsCarousel 
        announcements={announcements} 
        onDelete={handleDelete} 
      />
    </div>
  );
}