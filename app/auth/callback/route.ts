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
        // Check if user completed registration process
        // We check if user exists in users table AND has completed registration
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();

        // If user doesn't exist in users table OR doesn't have first_name/last_name
        // redirect to registration (even if Google has the name in metadata)
        if (userDataError || !userData || !userData.first_name || !userData.last_name) {
          next = "/registration";
        }
      }
    }
  }

  // Redirect the user to Participant or Admin side
  return NextResponse.redirect(`${origin}${next}`);
}
