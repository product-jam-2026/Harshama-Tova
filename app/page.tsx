import Onboarding from "@/components/Onboarding/Onboarding";
import styles from "./page.module.css";

export default function Home({
  searchParams,
}: {
  searchParams?: { screen?: string };
}) {
  const initialScreen = searchParams?.screen === "last" ? 4 : 0;
  return (
    <div className={styles.onboardingPage} data-hide-video-background>
      <Onboarding initialScreen={initialScreen} />
    </div>
  );
}
