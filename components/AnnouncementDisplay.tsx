'use client';

import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, SxProps, Theme } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface AnnouncementDisplayProps {
  id: string; 
  content: string;
  createdAt: string; 
  onDelete?: (id: string) => void; 
  // --- NEW: Allow passing custom styles (like specific width) from parent ---
  sx?: SxProps<Theme>;
}

export default function AnnouncementDisplay({ id, content, onDelete, sx }: AnnouncementDisplayProps) {
  return (
    <Card 
      dir="rtl" // Enforce RTL for content alignment
      sx={{ 
        width: '100%',        // Default width (responsive)
        height: 100,          // Fixed height for uniformity
        bgcolor: '#CDE2DE',   // Custom background color
        borderRadius: 4,      // Rounded corners
        position: 'relative',
        boxShadow: 1,         // Subtle shadow
        flexShrink: 0,        // Critical! Prevents shrinking in flex containers
        scrollSnapAlign: 'center', // Snaps to center when scrolling
        
        // --- NEW: Spread custom styles here to override defaults if needed ---
        ...sx 
      }}
    >
      {/* Delete Button */}
      {onDelete && (
        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
          <IconButton 
            onClick={() => onDelete(id)}
            size="small"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.6)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', color: '#d32f2f' } 
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Card Content */}
      <CardContent 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          overflowY: 'auto',    // Allows vertical scrolling if text is long
          p: 3,                 // Internal padding
          '&:last-child': { pb: 3 } // Override MUI default bottom padding
        }}
      >
        <Typography 
          variant="body1" 
          fontWeight="bold" 
          color="#1F2937"
          sx={{ 
            whiteSpace: 'pre-wrap', // Preserves newlines
            direction: 'rtl',       // Ensure punctuation aligns correctly
            textAlign: 'center', 
            width: '100%'
          }} 
        >
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
}