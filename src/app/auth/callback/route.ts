import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const email = data.user.email?.toLowerCase();
      const principalEmail = (process.env.PRINCIPAL_EMAIL || "rikashrikash04@gmail.com").toLowerCase();
      const complaintTeamEmail = (process.env.COMPLAINT_TEAM_EMAIL || "mohdnoupa2005@gmail.com").toLowerCase();

      // Route based on email
      if (email === principalEmail) {
        return NextResponse.redirect(`${origin}/principal`);
      } else if (email === complaintTeamEmail) {
        return NextResponse.redirect(`${origin}/complaint-team`);
      } else {
        // Unauthorized user - sign them out
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/access-denied`);
      }
    }
  }

  // Auth error - redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
