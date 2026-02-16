import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/** POST /api/notifications/read — mark ALL notifications as read. */
export async function POST() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createSupabaseAdmin();

  const { error } = await admin
    .from("notifications")
    .update({ read: true })
    .eq("user_id", authResult.user.id)
    .eq("read", false);

  if (error) {
    return NextResponse.json(
      { error: "Failed to mark notifications as read." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
