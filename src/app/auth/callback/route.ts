import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/catalogue";

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Exchange the auth code for a session (PKCE flow).
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
  }

  // At this point we should have a session (either from the code exchange
  // above, or from the cookie that was already set by the implicit flow).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Ensure a profile row exists. ignoreDuplicates preserves existing rows
    // (so admin role is never overwritten).
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const name = user.user_metadata?.full_name ?? null;
    await admin
      .from("users")
      .upsert(
        { id: user.id, email: user.email!, name },
        { onConflict: "id", ignoreDuplicates: true }
      );

    return NextResponse.redirect(`${origin}${next}`);
  }

  // No user at all — redirect back to login.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
