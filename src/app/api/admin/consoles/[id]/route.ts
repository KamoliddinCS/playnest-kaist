import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  let body: { status?: string; price_per_day?: number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { status, price_per_day } = body;

  // Build a partial update object so we can update status, price, or both.
  const updates: Record<string, unknown> = {};

  if (status !== undefined) {
    if (!["available", "maintenance"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'available' or 'maintenance'." },
        { status: 400 }
      );
    }
    updates.status = status;
  }

  if (price_per_day !== undefined) {
    updates.price_per_day =
      typeof price_per_day === "number" && price_per_day >= 0
        ? price_per_day
        : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Nothing to update." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("consoles")
    .update(updates)
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
