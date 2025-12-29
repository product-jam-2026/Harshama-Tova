"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { GoogleIcon } from "@/app/login/GoogleIcon"; 
import styles from "./GoogleLoginButton.module.css";
import { toast } from "sonner";

interface GoogleLoginButtonProps {
  mode: 'user' | 'admin';
}

const GoogleLoginButton = ({ mode }: GoogleLoginButtonProps) => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      
      // Save intent
      localStorage.setItem('login_intent', mode);

      // Clear session
      await supabase.auth.signOut(); 

      // OAuth with redirect to callback -> verify
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/verify`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account', 
          },
        },
      });

      if (error) throw error;
      
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("אירעה שגיאה בהתחברות");
      setLoading(false);
    }
  };

  const isAdmin = mode === 'admin';

  return (
    <button 
      onClick={handleClick} 
      className={`
        ${styles.googleButton} 
        
        ${(!isAdmin && !loading) ? styles.withIcon : ''} 
        
        ${isAdmin ? styles.adminButton : ''}
      `} 
      disabled={loading}
    >
      {loading ? (
        <span className={styles.spinner}></span> 
      ) : (
        <>
          {!isAdmin && <GoogleIcon />}
          
          <span>{isAdmin ? 'כניסת מנהלים' : 'כניסה באמצעות'}</span>
          
          {!isAdmin && <div></div>}
        </>
      )}
    </button>
  );
};

export default GoogleLoginButton;