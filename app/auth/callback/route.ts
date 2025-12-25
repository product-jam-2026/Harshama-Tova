import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  // Set default redirect path to home page
  let next = "/participants";

  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Exchange the auth code for a user session (this logs the user in)
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user?.email) {
      // Check if the logged-in user exists in the 'admin_list' table
      const { data: adminUser } = await supabase
        .from('admin_list')
        .select('email')
        .eq('email', user.email)
        .single();

      // If user is found in the list, redirect to the admin page
      if (adminUser) {
        next = "/admin";
      } else {
        // Check if email exists in users table - check by both id and email
        let userExists = false;
        
        // First try by id (if user was created through auth)
        const { data: userDataById } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        // If not found by id, try by email
        if (!userDataById && user.email) {
          const { data: userDataByEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();
          
          userExists = !!userDataByEmail;
        } else {
          userExists = !!userDataById;
        }

        // Simple logic: if email exists in users table → go to participants, otherwise → registration
        if (userExists) {
          next = "/participants";
        } else {
          next = "/registration";
        }
      }
    }
  }

  // Redirect the user to Participant or Admin side
  return NextResponse.redirect(`${origin}${next}`);
}
