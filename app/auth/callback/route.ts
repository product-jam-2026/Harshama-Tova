import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  
  // Get the 'next' param from the URL (we sent '/auth/verify' from the button)
  // If missing, default to home page
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Exchange the auth code for a user session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`);
    }
  }

  // Redirect to the 'next' path (which is our Verify Page)
  // This allows the client-side code to handle the specific button logic
  return NextResponse.redirect(`${origin}${next}`);
}