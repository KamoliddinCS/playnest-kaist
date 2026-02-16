import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/** DELETE /api/admin/games/:id — remove a game */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createSupabaseAdmin();

  const { error } = await admin.from("games").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete game." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
