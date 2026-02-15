import { createSupabaseServer, createSupabaseAdmin } from "./server";
import { NextResponse } from "next/server";
import type { UserProfile } from "@/lib/types";

/**
 * Returns the authenticated user's profile, or a NextResponse error if not
 * authenticated. Use in route handlers:
 *
 *   const result = await requireAuth();
 *   if (result instanceof NextResponse) return result;
 *   const { user, profile } = result;
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
  const { data: profile, error } = await admin
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 401 });
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
