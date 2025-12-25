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
      subtitle: 'הצטרפו לקהילה של אנשים',
      subtitle2: 'במסע דומה לשלכם',
      icon: '3_onboardind.png',
    },
    {
      title: 'צמיחה אישית',
      subtitle: 'הצטרפו לקהילה של אנשים',
      subtitle2: 'במסע דומה לשלכם',
      icon: '2_onboarding.png',
    },
    {
      title: 'קהילה תומכת',
      subtitle: 'הצטרפו לקהילה של אנשים',
      subtitle2: 'במסע דומה לשלכם',
      icon: '1_onboarding.png',
    },
  ];

  const handleSkip = async () => {
    // Check if user is already logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // User not logged in - go to login
      router.push('/login');
      return;
    }
    
    // User is logged in - check if email exists in users table
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name, phone_number, city, community_status, age, gender')
      .eq('id', user.id)
      .maybeSingle();
    
    // If user doesn't exist in users table at all - start registration from beginning
    if (!userData) {
      router.push('/registration');
      return;
    }
    
    // Check which fields are missing and redirect to the appropriate step
    if (!userData.first_name || !userData.last_name) {
      router.push('/registration');
      return;
    }
    
    if (!userData.phone_number) {
      router.push('/registration/step2');
      return;
    }
    
    if (!userData.city) {
      router.push('/registration/step3');
      return;
    }
    
    if (!userData.community_status) {
      router.push('/registration/step4');
      return;
    }
    
    if (!userData.age || !userData.gender || userData.gender === '') {
      router.push('/registration/step5');
      return;
    }
    
    // All fields are filled - go to participants page
    router.push('/participants');
  };

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handlePrevious = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentScreen(index);
  };

  const handleSideClick = (side: 'left' | 'right') => {
    if (side === 'left') {
      // לחיצה בצד שמאל - מעבר לעמוד הבא
      handleNext();
    } else {
      // לחיצה בצד ימין - מעבר לעמוד הקודם
      handlePrevious();
    }
  };

  return (
    <div className={styles.onboardingContainer}>
      {/* כפתור דלג / בואו נתחיל */}
      <button
        onClick={handleSkip}
        className={styles.skipButton}
      >
        {currentScreen === screens.length - 1 ? 'בואו נתחיל' : 'דלג.י'}
      </button>

      {/* אזור לחיצה בצד שמאל - מעבר לעמוד הבא */}
      {currentScreen < screens.length - 1 && (
        <div
          onClick={() => handleSideClick('left')}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '50%',
            height: '100%',
            cursor: 'pointer',
            zIndex: 5,
          }}
        />
      )}

      {/* אזור לחיצה בצד ימין - מעבר לעמוד הקודם */}
      {currentScreen > 0 && (
        <div
          onClick={() => handleSideClick('right')}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '50%',
            height: '100%',
            cursor: 'pointer',
            zIndex: 5,
          }}
        />
      )}

      {/* תוכן המסך */}
      <div className={styles.contentWrapper} style={{ position: 'relative', zIndex: 2, pointerEvents: 'auto' }}>
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
      <div className={styles.dotsContainer} style={{ position: 'relative', zIndex: 10 }}>
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

