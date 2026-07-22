import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Reverse proxy (NPM) arkasında request.url iç adrese (localhost) çözülebildiği
// için yönlendirmeyi request'ten değil sabit site URL'inden kuruyoruz.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Handles the email-confirmation redirect: exchanges the code for a session.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${siteUrl}/login?error=verification`);
}
