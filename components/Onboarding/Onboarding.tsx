'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Onboarding.module.css';

export default function Onboarding() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);

  const screens = [
    {
      title: 'קהילה תומכת',
      subtitle: 'הצטרפו לקהילה של אנשים',
      subtitle2: 'במסע דומה לשלכם',
      icon: 'onboard3.svg',
    },
    {
      title: 'מרחב בטוח',
      subtitle: 'רישום זמין ונוח למרחבים',
      subtitle2: 'קבוצתיים ולסדנאות',
      icon: 'onboard2.svg',
    },
    {
      title: 'אדמה טובה',
      subtitle: 'אדמה טובה לצמיחה אמיתית',
      subtitle2: '',
      icon: 'onboard1.svg',
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
      {/* שכבה כהה מעל הרקע */}
      <div className="background-dark-overlay-onboarding"></div>
      
      {/* כפתור דלג - מופיע רק במסכים 1-2 */}
      {currentScreen < screens.length - 1 && (
        <button
          onClick={handleSkip}
          className={styles.skipButton}
        >
          דלג.י
        </button>
      )}

      {/* אזור לחיצה בצד שמאל - מעבר לעמוד הבא */}
      {currentScreen < screens.length - 1 && (
        <div
          onClick={() => handleSideClick('left')}
          className={styles.sideClickLeft}
        />
      )}

      {/* אזור לחיצה בצד ימין - מעבר לעמוד הקודם */}
      {currentScreen > 0 && (
        <div
          onClick={() => handleSideClick('right')}
          className={styles.sideClickRight}
        />
      )}

      {/* תוכן המסך */}
      <div className={`${styles.contentWrapper} ${styles.contentWrapperPosition}`}>
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

      {/* כפתור בואו נתחיל - מופיע רק במסך האחרון */}
      {currentScreen === screens.length - 1 && (
        <button
          onClick={handleSkip}
          className={styles.startButton}
        >
          בואו נתחיל
        </button>
      )}

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

