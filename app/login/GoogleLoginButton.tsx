"use client";

import { NEXT_PUBLIC_GOOGLE_CLIENT_ID } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

const GoogleLoginButton = () => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleSignInWithGoogle = async (response: any) => {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });
      
      if (error) {
        return;
      }
      
      if (data?.user?.email) {
        // Check if user is admin
        const { data: adminUser } = await supabase
          .from('admin_list')
          .select('email')
          .eq('email', data.user.email)
          .maybeSingle();
        
        if (adminUser) {
          router.push('/admin');
          return;
        }
        
        // Check if email exists in users table - check by email first (more reliable)
        let userExists = false;
        
        // First try by email (more reliable)
        const { data: userDataByEmail } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', data.user.email)
          .maybeSingle();
        
        if (userDataByEmail) {
          userExists = true;
        } else {
          // If not found by email, try by id
          const { data: userDataById } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', data.user.id)
            .maybeSingle();
          
          userExists = !!userDataById;
        }
        
        // Redirect based on whether user exists in users table
        if (userExists) {
          router.push('/participants');
        } else {
          router.push('/registration');
        }
      }
    };

    const initializeGoogle = () => {
      if (window.google && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleSignInWithGoogle,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          shape: "circle",
          theme: "outline",
          text: "signin_with",
          size: "medium",
          logo_alignment: "left",
          width: 290,
        });
      }
    };

    // Initialize if Google script is already loaded
    if (window.google) {
      initializeGoogle();
    } else {
      // Wait for the script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogle();
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }
  }, [supabase, router]);

  // You can customize the button here:
  // https://developers.google.com/identity/gsi/web/tools/configurator
  return <div ref={buttonRef} />;
};

export default GoogleLoginButton;
