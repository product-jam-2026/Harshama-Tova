"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/app/login/GoogleIcon";
import styles from "./GoogleLoginButton.module.css";

const GoogleLoginButton = () => {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    
    const checkUserAndRedirect = async (user: any) => {
      if (!user?.email) return;

      // Check if user is admin
      const { data: adminUser } = await supabase
        .from('admin_list')
        .select('email')
        .eq('email', user.email)
        .maybeSingle();

      if (adminUser) {
        router.push('/admin');
        return;
      }

      // Check if email exists in users table
      let userExists = false;

      // First try by email (more reliable)
      const { data: userDataByEmail } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', user.email)
        .maybeSingle();

      if (userDataByEmail) {
        userExists = true;
      } else {
        // If not found by email, try by id (fallback)
        const { data: userDataById } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', user.id)
          .maybeSingle();

        userExists = !!userDataById;
      }

      // Redirect based on whether user exists in users table
      if (userExists) {
        router.push('/participants');
      } else {
        router.push('/registration');
      }
    };

    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If a user is found (meaning they are logged in), run the checks.
      if (user) {
        setLoading(true); // Show loading state while checking DB
        await checkUserAndRedirect(user);
      }
    };

    checkSession();
  }, [supabase, router]);

  // --- Handle Button Click ---
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // We switch to signInWithOAuth to support the custom button design.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Redirect back to the auth callback route which handles the session exchange.
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            // 'select_account' forces Google to show the account picker every time
            prompt: 'select_account', 
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