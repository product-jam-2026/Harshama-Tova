'use client';

import React from 'react';
import { Card, CardContent, Typography, IconButton, SxProps, Theme } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import styles from './AnnouncementDisplay.module.css';

interface AnnouncementDisplayProps {
  id: string; 
  content: string;
  createdAt: string; 
  onDelete?: (id: string) => void; 
  // --- Allow passing custom styles (like specific width) from parent ---
  sx?: SxProps<Theme>;
}

export default function AnnouncementDisplay({ id, content, onDelete, sx }: AnnouncementDisplayProps) {
  return (
    <Card 
      dir="rtl" // Enforce RTL for content alignment
      className={styles.card} // Apply base styles from CSS Module
    >
      {/* Delete Button */}
      {onDelete && (
        <div className={styles.deleteContainer}>
          <IconButton 
            onClick={() => onDelete(id)}
            size="small"
            className={styles.deleteButton}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </div>
      )}

      {/* Card Content */}
      <CardContent className={styles.cardContent}>
        <Typography 
          variant="body1" 
          fontWeight="bold" 
          className={styles.text}
        >
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
}