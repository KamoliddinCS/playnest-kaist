import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/** POST /api/admin/games — add a game to a console */
export async function POST(request: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  let body: { console_id?: string; title?: string; image_url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { console_id, title, image_url } = body;
  if (!console_id || !title?.trim()) {
    return NextResponse.json(
      { error: "console_id and title are required." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("games")
    .insert({
      console_id,
      title: title.trim(),
      image_url: image_url?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to add game." },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
