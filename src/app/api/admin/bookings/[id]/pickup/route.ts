import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createSupabaseAdmin();

  const { data: booking, error: bErr } = await admin
    .from("bookings")
    .select("status")
    .eq("id", params.id)
    .single();

  if (bErr || !booking) {
    return NextResponse.json(
      { error: "Booking not found." },
      { status: 404 }
    );
  }

  if (booking.status !== "approved") {
    return NextResponse.json(
      { error: "Only approved bookings can be marked as picked up." },
      { status: 400 }
    );
  }

  const { error } = await admin
    .from("bookings")
    .update({ status: "picked_up" })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
