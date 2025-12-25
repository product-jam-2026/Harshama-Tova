'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../app/page.module.css';

export default function Onboarding() {
  const router = useRouter();
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

  const handleSkip = () => {
    // Always redirect to login page, regardless of login status
    router.push('/login');
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

