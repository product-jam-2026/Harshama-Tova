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
        
        {/* Button 1: Regular Users */}
        <GoogleLoginButton mode="user" />
        
        {/* Button 2: Admins */}
        <GoogleLoginButton mode="admin" />

        {searchParams?.message && (
          <p className={styles.errorMessage}>{searchParams.message}</p>
        )}
      </div>

      <img src="/icons/flower.svg" alt="Flower" className={styles.flowerIcon} />
    </div>
  );
}