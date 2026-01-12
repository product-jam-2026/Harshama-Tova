'use client';

import { useState, useEffect, useRef } from 'react';
import { Stack, Box } from '@mui/material';
import AnnouncementDisplay from './AnnouncementDisplay';

interface Announcement {
  id: string;
  content: string;
  created_at: string;
}

interface AnnouncementsCarouselProps {
  announcements: Announcement[];
  onDelete?: (id: string) => void;
}

export default function AnnouncementsCarousel({ announcements, onDelete }: AnnouncementsCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Auto-Scroll Logic ---
  useEffect(() => {
    if (announcements.length <= 1) return;

    const startAutoScroll = () => {
      autoScrollTimerRef.current = setInterval(() => {
        setActiveSlide((prev) => {
          // Move to the next slide index (0 -> 1 -> 2 -> 0)
          const nextIndex = (prev + 1) % announcements.length;
          scrollToSlide(nextIndex);
          return nextIndex;
        });
      }, 4000); 
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
    };
  }, [announcements.length]);

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const card = container.children[index] as HTMLElement;
      if (card) {
        // scrollIntoView works perfectly with RTL, automatically finding the correct position
        card.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        });
      }
    }
  };

  if (announcements.length === 0) return null;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Carousel Container */}
      <Stack
        ref={scrollContainerRef}
        dir="ltr"
        direction="row"
        spacing={2}
        sx={{
          overflowX: 'auto',
          pb: 2,
          px: 2,
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          scrollBehavior: 'smooth'
        }}
      >
        {announcements.map((announcement) => (
          <AnnouncementDisplay 
            key={announcement.id}
            id={announcement.id}
            content={announcement.content}
            createdAt={announcement.created_at}
            onDelete={onDelete}
          />
        ))}
      </Stack>

      {/* Dots Indicators */}
      {announcements.length > 1 && (
        <Box 
          dir="ltr"
          sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}
        >
          {announcements.map((_, index) => (
            <Box
              key={index}
              onClick={() => {
                setActiveSlide(index);
                scrollToSlide(index);
              }}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                // Active dot style
                bgcolor: activeSlide === index ? 'primary.main' : 'grey.300',
                transform: activeSlide === index ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}