'use client';

import { useState, useEffect, useRef } from 'react';
import { Stack } from '@mui/material';
import AnnouncementDisplay from '../AnnouncementDisplay/AnnouncementDisplay';
import styles from './AnnouncementsCarousel.module.css';

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
        // scrollTo only scrolls the specific container, preventing page jumps.
        
        const scrollLeft = card.offsetLeft;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  if (announcements.length === 0) return null;

  return (
    <div className={styles.container}>
      {/* Carousel Container */}
      <Stack
        ref={scrollContainerRef}
        dir="rtl" // Enforce RTL so the first item starts on the Right
        direction="row"
        className={styles.carouselStack}
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
        <div 
          dir="rtl" // Match direction with the carousel
          className={styles.dotsContainer}
        >
          {announcements.map((_, index) => (
            <div
              key={index}
              onClick={() => {
                setActiveSlide(index);
                scrollToSlide(index);
              }}
              // Conditionally apply the active class
              className={`${styles.dot} ${activeSlide === index ? styles.activeDot : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}