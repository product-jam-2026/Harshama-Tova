'use client';

import React from 'react';
import Image from 'next/image';
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
      dir="rtl"
      className={styles.card}
      sx={sx}
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
        
        {/* Flower Icon Section */}
        <div className={styles.iconWrapper}>
            <Image 
                src="/icons/BlackFlower.svg" 
                alt="Flower Decoration"
                width={45} 
                height={45}
                className={styles.flowerIcon}
            />
        </div>
        
        {/* Text Section */}
        <div className={styles.textWrapper}>
            <Typography 
              variant="body1" 
              fontWeight="bold" 
              className={styles.text}
            >
              {content}
            </Typography>
        </div>

      </CardContent>
    </Card>
  );
}