import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("consoles")
    .select("*, games(*)")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Device not found." },
      { status: 404 }
    );
  }

  // Sort games alphabetically.
  data.games = (data.games ?? []).sort(
    (a: { title: string }, b: { title: string }) =>
      a.title.localeCompare(b.title)
  );

  return NextResponse.json(data);
}
