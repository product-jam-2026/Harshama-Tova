import styles from "./page.module.css";
import GoogleLoginButton from "./GoogleLoginButton";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginHeader}>
        <p>התחברות</p>
        <div className={styles.divider} />
      </div>
      
      <div className={styles.loginContainer}>
        <GoogleLoginButton />

        {/* Error Messages if any */}
        {searchParams?.message && (
          <p className={styles.errorMessage}>{searchParams.message}</p>
        )}
      </div>

      {/* Flower Icon */}
      <img src="/icons/flower.svg" alt="Flower" className={styles.flowerIcon} />
    </div>
  );
}