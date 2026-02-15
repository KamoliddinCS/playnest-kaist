import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { status } = body;
  if (!status || !["available", "maintenance"].includes(status)) {
    return NextResponse.json(
      { error: "Status must be 'available' or 'maintenance'." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("consoles")
    .update({ status })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update console." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
