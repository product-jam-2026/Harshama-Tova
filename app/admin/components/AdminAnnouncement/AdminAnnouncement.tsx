'use client';

import { useState } from 'react';
import { createAnnouncement, deleteAnnouncement } from '@/app/actions/announcements';
import { toast } from 'sonner';
import { Button, CircularProgress, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AnnouncementsCarousel from '@/components/AnnouncementsCarousel/AnnouncementsCarousel';
import styles from './AdminAnnouncement.module.css';

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
            <h3>הודעה חדשה למרחב</h3>
            <p className="toast-prompt-message">
              עם פרסום ההודעה, היא תופיע לכל המשתמשים באפליקציה.
            </p>
            <textarea
              className="toast-prompt-input"
              placeholder="הודעה כללית במרחב כמו ערב מרק חם/מדורה."
              onChange={(e) => inputValue = e.target.value}
              autoFocus
            />
            <div className="toast-confirm-buttons">
              <button onClick={() => { toast.dismiss(t); resolve(null); }} className="toast-button toast-button-cancel">ביטול</button>
              <button onClick={() => { toast.dismiss(t); resolve(inputValue); }} className="toast-button toast-button-confirm">פרסום</button>
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
      toast.success('הודעה נוספה!');
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
          <p className="toast-confirm-message">למחוק את ההודעה?</p>
          <div className="toast-confirm-buttons">
            <button onClick={() => { toast.dismiss(t); resolve(false); }} className="toast-button toast-button-cancel">ביטול</button>
            <button onClick={() => { toast.dismiss(t); resolve(true); }} className="toast-button toast-button-confirm">מחיקה</button>
          </div>
        </div>
      ), { duration: Infinity, position: 'top-center' });
    });

    if (!confirmed) return;

    const res = await deleteAnnouncement(id);
    if (res.success) {
      toast.success('נמחק');
      onRefresh();
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Header Area: Title on the right, Button on the left */}
      <div className={styles.header}>
        
        {/* Title */}
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          הודעות יומיות במרחב
        </Typography>

        {/* Add Button */}
        <Button
          onClick={handleCreateClick}
          disabled={status === 'loading'}
          className={styles.addButton}
        >
          {status === 'loading' ? <CircularProgress size={24} color="inherit" /> : <AddIcon fontSize="medium" />}
        </Button>
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