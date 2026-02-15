import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;
  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("bookings")
    .select("*, consoles(label)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
