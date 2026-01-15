"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { GoogleIcon } from "@/app/login/GoogleIcon";
import styles from "./GoogleLoginButton.module.css";

const GoogleLoginButton = () => {
  const supabase = createClient();
  
  // State for the button spinner (user clicked interaction only)
  const [loading, setLoading] = useState(false);

  // --- Handle Button Click ---
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // This ensures the user must choose their account again
      await supabase.auth.signOut(); 

      // redirect to Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // The destination after Google login
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            // Forces Google to show the account picker every time
            prompt: 'consent select_account', 
          },
        },
      });

      if (error) throw error;
      
    } catch (error) {
      console.error("Error logging in:", error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleGoogleLogin} 
      className={styles.googleButton} 
      disabled={loading}
    >
      {loading ? (
        <span className={styles.spinner}></span> 
      ) : (
        <>
          <span>כניסה באמצעות</span>
          <GoogleIcon />
        </>
      )}
    </button>
  );
};

export default GoogleLoginButton;