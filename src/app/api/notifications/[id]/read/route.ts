import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/** PATCH /api/notifications/[id]/read — mark a single notification as read. */
export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createSupabaseAdmin();

  const { error } = await admin
    .from("notifications")
    .update({ read: true })
    .eq("id", params.id)
    .eq("user_id", authResult.user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to mark as read." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
