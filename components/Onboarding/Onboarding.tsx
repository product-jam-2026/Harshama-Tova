'use client';

import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useRouter } from 'next/navigation';
import styles from './Onboarding.module.css';

export default function Onboarding() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);

  const screens = [
    {
      title: 'קהילה תומכת',
      subtitle: 'הצטרף לקהילה של אנשים',
      subtitle2: 'במסע דומה לשלך',
      icon: 'onboard3.svg',
    },
    {
      title: 'מרחב בטוח',
      subtitle: 'רישום זמין ונוח למרחבים',
      subtitle2: 'קבוצתיים ולסדנאות',
      icon: 'icon_on_2.svg',
    },
    {
      title: 'מגוון פעילויות',
      subtitle: 'קבוצות תמיכה, סדנאות',
      subtitle2: 'יצירה, טיפולי גוף, מיינדפולנס ועוד',
      icon: 'icon_on_3.svg',
    },
    {
      title: 'ביחד נצמח',
      subtitle: 'מעקב אחר המסע שלכם',
      subtitle2: 'ועדכונים על פעילויות חדשות',
      icon: 'icon_on_4.svg',
    },
    {
      title: 'אדמה טובה',
      subtitle: 'מרחב טיפולי קהילתי לנפגעי',
      subtitle2: 'פעולות האיבה והמלחמה\nמ-7.10.23',
      icon: 'icon_on_5.svg',
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
      handleNext();
    } else {
      handlePrevious();
    }
  };

  // תמיכה גם בסווייפ וגם בלחיצה
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handlePrevious(),
    onSwipedRight: () => handleNext(),
    trackMouse: true,
  });

  return (
    <div 
      className={styles.onboardingContainer} 
      {...swipeHandlers}
      style={{
        backgroundImage: currentScreen === 0 
          ? 'url(/icons/onboarding_1.png)' 
          : currentScreen === 1
          ? 'url(/icons/onboarding_2.png)'
          : currentScreen === 2
          ? 'url(/icons/onboarding_3.png)'
          : currentScreen === 3
          ? 'url(/icons/onboarding_4.png)'
          : currentScreen === 4
          ? 'url(/icons/onboarding_5.png)'
          : 'url(/sea-bg.svg)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* שכבה כהה מעל הרקע - לא מוצגת כי כל המסכים משתמשים ברקע מותאם */}
      
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
        {[0, 1, 2, 3, 4].map((screenIndex) => {
          // 5 נקודות - מסך 0-4
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

