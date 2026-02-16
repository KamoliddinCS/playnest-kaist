import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("consoles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch consoles." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  let body: { label?: string; image_url?: string | null; price_per_day?: number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { label, image_url, price_per_day } = body;
  if (!label || !label.trim()) {
    return NextResponse.json(
      { error: "Label is required." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("consoles")
    .insert({
      label: label.trim(),
      status: "available",
      image_url: image_url?.trim() || null,
      price_per_day: typeof price_per_day === "number" && price_per_day >= 0 ? price_per_day : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create console." },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
