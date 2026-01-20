'use client';

import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import GoogleLoginButton from '@/app/login/GoogleLoginButton';
import styles from './Onboarding.module.css';

const LAST_SCREEN_INDEX = 4;
const DEFAULT_THEME_COLOR = '#E2E8F0'; // כמו ב-manifest – מוחזר ביציאה מאונבורדינג

const SCREENS = [
  { title: 'קהילה תומכת', subtitle: 'הצטרף לקהילה של אנשים', subtitle2: 'במסע דומה לשלך', icon: 'onboard3.svg', themeColor: '#A1A8BA' },
  { title: 'מרחב בטוח', subtitle: 'רישום זמין ונוח למרחבים', subtitle2: 'קבוצתיים ולסדנאות', icon: 'icon_on_2.svg', themeColor: '#BBB6B5' },
  { title: 'מגוון פעילויות', subtitle: 'קבוצות תמיכה, סדנאות', subtitle2: 'יצירה, טיפולי גוף, מיינדפולנס ועוד', icon: 'icon_on_3.svg', themeColor: '#BFBEB9' },
  { title: 'ביחד נצמח', subtitle: 'מעקב אחר המסע שלכם', subtitle2: 'ועדכונים על פעילויות חדשות', icon: 'icon_on_4.svg', themeColor: '#D0CEC9' },
  { title: 'אדמה טובה', subtitle: 'מרחב טיפולי קהילתי לנפגעי', subtitle2: 'פעולות האיבה והמלחמה\nמ-7.10.23', icon: 'icon_on_5.svg', themeColor: '#C9C8C5' },
] as const;

export default function Onboarding({ initialScreen = 0 }: { initialScreen?: number }) {
  const [currentScreen, setCurrentScreen] = useState(initialScreen <= LAST_SCREEN_INDEX ? initialScreen : 0);

  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', SCREENS[currentScreen].themeColor);
    return () => {
      const m = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (m) m.setAttribute('content', DEFAULT_THEME_COLOR);
    };
  }, [currentScreen]);

  const handleSkip = () => {
    // דלג – מעבר למסך האחרון (כניסה באמצעות גוגל)
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(SCREENS.length - 1);
    }
  };

  const handleNext = () => {
    if (currentScreen < SCREENS.length - 1) {
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
          ? 'url(/icons/onbo_2_good.png)'
          : currentScreen === 2
          ? 'url(/icons/onbo_3_good.png)'
          : currentScreen === 3
          ? 'url(/icons/onbo_4_good.png)'
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
      {currentScreen < SCREENS.length - 1 && (
        <button
          onClick={handleSkip}
          className={styles.skipButton}
        >
          דלג.י
        </button>
      )}

      {/* אזור לחיצה בצד שמאל - מעבר לעמוד הבא */}
      {currentScreen < SCREENS.length - 1 && (
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
          src={`/icons/${SCREENS[currentScreen].icon}`}
          alt="Onboarding Icon"
          className={styles.iconWrapper}
        />

        {/* כותרת */}
        <h1 className={styles.title}>
          {SCREENS[currentScreen].title}
        </h1>

        {/* תת-כותרת */}
        <div className={styles.subtitle}>
          <div>{SCREENS[currentScreen].subtitle}</div>
          <div>{SCREENS[currentScreen].subtitle2}</div>
        </div>
      </div>

      {/* כפתור כניסה באמצעות גוגל - מופיע רק במסך האחרון */}
      {currentScreen === SCREENS.length - 1 && (
        <div className={styles.googleButtonWrapper}>
          <GoogleLoginButton />
        </div>
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

