'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from '../app/page.module.css';

export default function Onboarding() {
  const router = useRouter();
  const supabase = createClient();
  const [currentScreen, setCurrentScreen] = useState(0);

  const screens = [
    {
      title: 'אדמה טובה',
      subtitle: 'הצטרף לקהילה של אנשים',
      subtitle2: 'במסע דומה לשלך',
      icon: '3_onboardind.png',
    },
    {
      title: 'צמיחה אישית',
      subtitle: 'הצטרף לקהילה של אנשים',
      subtitle2: 'במסע דומה לשלך',
      icon: '2_onboarding.png',
    },
    {
      title: 'קהילה תומכת',
      subtitle: 'הצטרף לקהילה של אנשים',
      subtitle2: 'במסע דומה לשלך',
      icon: '1_onboarding.png',
    },
  ];

  const handleSkip = async () => {
    // Check if user is already logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // User is logged in, check if registration is completed
      const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();

      if (!userData || !userData.first_name || !userData.last_name) {
        // Not completed registration - go to registration
        router.push('/registration');
      } else {
        // Completed registration - go to participants
        router.push('/participants');
      }
    } else {
      // User not logged in - go to login
      router.push('/login');
    }
  };

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentScreen(index);
  };

  return (
    <div className={styles.onboardingContainer}>
      {/* כפתור דלג */}
      <button
        onClick={handleSkip}
        className={styles.skipButton}
      >
        דלג.י
      </button>

      {/* תוכן המסך */}
      <div className={styles.contentWrapper}>
        {/* סמל 3 העיגולים */}
        <img
          src={`/icons/${screens[currentScreen].icon}`}
          alt="Onboarding Icon"
          className={styles.iconWrapper}
        />

        {/* כותרת */}
        <h1 className={styles.title}>
          {screens[currentScreen].title}
        </h1>

        {/* תת-כותרת */}
        <div className={styles.subtitle}>
          <div>{screens[currentScreen].subtitle}</div>
          <div>{screens[currentScreen].subtitle2}</div>
        </div>
      </div>

      {/* נקודות ניווט */}
      <div className={styles.dotsContainer}>
        {[0, 1, 2].map((screenIndex) => {
          // מסך 0 = נקודה שמאלית, מסך 1 = אמצעית, מסך 2 = ימנית
          return (
            <button
              key={screenIndex}
              onClick={() => handleDotClick(screenIndex)}
              className={`${styles.dot} ${screenIndex === currentScreen ? styles.dotActive : styles.dotInactive}`}
              aria-label={`מסך ${screenIndex + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

