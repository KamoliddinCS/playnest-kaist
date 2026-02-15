import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("bookings")
    .select("*, users(email)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
