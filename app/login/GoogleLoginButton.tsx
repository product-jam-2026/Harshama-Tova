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

  // --- Effect: Handle Post-Login Logic ---
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
        // Fallback: check by ID
        const { data: userDataById } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', user.id)
          .maybeSingle();

        userExists = !!userDataById;
      }

      // Redirect accordingly
      if (userExists) {
        router.push('/participants');
      } else {
        router.push('/registration');
      }
    };

    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // only proceed if there's a logged-in user
      if (user) {
        setLoading(true);
        await checkUserAndRedirect(user);
      }
    };

    checkSession();
  }, [supabase, router]);

  // --- Handle Button Click ---
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // log out any existing session first
      await supabase.auth.signOut(); 

      // redirect to Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            // Added 'consent' to force Google to ask for consent again
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