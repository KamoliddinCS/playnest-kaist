import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/** GET /api/profile — return current user's profile */
export async function GET() {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  return NextResponse.json(result.profile);
}

/** PATCH /api/profile — update current user's name */
export async function PATCH(request: Request) {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : null;

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("users")
    .update({ name: name || null })
    .eq("id", result.user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
