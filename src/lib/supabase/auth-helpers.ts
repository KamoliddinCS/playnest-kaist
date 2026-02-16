import { createSupabaseServer, createSupabaseAdmin } from "./server";
import { NextResponse } from "next/server";
import type { UserProfile } from "@/lib/types";

/**
 * Returns the authenticated user's profile, or a NextResponse error if not
 * authenticated. If the user is authenticated but has no profile row yet,
 * one is created automatically (handles race conditions / callback issues).
 */
export async function requireAuth(): Promise<
  | NextResponse
  | { user: { id: string; email: string }; profile: UserProfile }
> {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  // Try to fetch existing profile.
  let { data: profile, error } = await admin
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // If no profile exists yet, create one on the fly.
  if (error || !profile) {
    const name = user.user_metadata?.full_name ?? null;
    const { data: newProfile, error: insertErr } = await admin
      .from("users")
      .upsert(
        { id: user.id, email: user.email!, name },
        { onConflict: "id", ignoreDuplicates: true }
      )
      .select("*")
      .single();

    if (insertErr || !newProfile) {
      // If upsert with ignoreDuplicates didn't return a row, re-fetch.
      const { data: refetched } = await admin
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!refetched) {
        return NextResponse.json(
          { error: "Failed to create user profile." },
          { status: 500 }
        );
      }
      profile = refetched;
    } else {
      profile = newProfile;
    }
  }

  return {
    user: { id: user.id, email: user.email! },
    profile: profile as UserProfile,
  };
}

/**
 * Returns the authenticated admin's profile, or a NextResponse error.
 */
export async function requireAdmin(): Promise<
  | NextResponse
  | { user: { id: string; email: string }; profile: UserProfile }
> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (result.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return result;
}
