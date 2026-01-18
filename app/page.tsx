import Onboarding from "@/components/Onboarding/Onboarding";
import styles from "./page.module.css";

export default function Home() {
  // Always show onboarding; המסך האחרון כולל כניסה באמצעות גוגל
  return (
    <div className={styles.onboardingPage} data-hide-video-background>
      <Onboarding />
    </div>
  );
}
