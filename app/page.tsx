import Onboarding from "@/components/Onboarding";
import styles from "./page.module.css";

export default function Home() {
  // Always show onboarding - it will redirect to /login
  return (
    <div className={styles.onboardingPage} data-hide-video-background>
      <Onboarding />
    </div>
  );
}
