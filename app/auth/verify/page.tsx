"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
// Import the external CSS module
import styles from "./page.module.css";

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const verifyUserAndRedirect = async () => {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      // If for some reason there is no user, send back to login
      if (!user) {
        router.push("/login");
        return;
      }

      // Retrieve the user's intent (which button they clicked)
      const loginIntent = localStorage.getItem("login_intent");
      
      // Clear intent to prevent loops or stale state
      localStorage.removeItem("login_intent");

      // Check Admin Status in DB
      const { data: adminUser } = await supabase
        .from("admin_list")
        .select("email")
        .eq("email", user.email)
        .maybeSingle();

      // --- Routing Logic based on Intent ---

      // Case A: User clicked "Admin Login"
      if (loginIntent === "admin") {
        if (adminUser) {
          // Success: User is an admin and used the correct portal
          router.push("/admin");
        } else {
          // Failure: Non-admin trying to access admin area
          await supabase.auth.signOut();
          
          // Encode Hebrew text to ensure it passes correctly in the URL
          const message = encodeURIComponent("אין לך הרשאות מנהל");
          router.push(`/login?message=${message}`);
        }
      } 
      
      // Case B: User clicked "Google Login" (Regular User)
      else if (loginIntent === "user") {
        if (adminUser) {
          // Failure: Admin trying to login via user portal
          await supabase.auth.signOut();
          
          // Encode Hebrew text here as well
          const message = encodeURIComponent("עליך להיכנס דרך כניסת מנהלים");
          router.push(`/login?message=${message}`);
        } else {
          // Success: Not an admin, proceed to check User status
          
          // Check if email exists in users table
          let userExists = false;
          
          const { data: userDataByEmail } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .maybeSingle();

          if (userDataByEmail) {
            userExists = true;
          } else {
            // Fallback: check by ID
            const { data: userDataById } = await supabase
              .from("users")
              .select("id")
              .eq("id", user.id)
              .maybeSingle();
            userExists = !!userDataById;
          }

          // Route to Registration or Participants
          if (userExists) {
            router.push("/participants");
          } else {
            router.push("/registration");
          }
        }
      } 
      
      // Case C: No intent found (Direct access or refresh)
      else {
        if (adminUser) {
            router.push("/admin");
        } else {
            const { data: existingUser } = await supabase.from("users").select("id").eq("email", user.email).maybeSingle();
            if (existingUser) router.push("/participants");
            else router.push("/registration");
        }
      }
    };

    verifyUserAndRedirect();
  }, [router, supabase]);

  // Loading UI using CSS Modules
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p className={styles.text}>מאמת נתונים...</p>
    </div>
  );
}