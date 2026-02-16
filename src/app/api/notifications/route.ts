import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/** GET /api/notifications — list current user's notifications (latest 50). */
export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", authResult.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
