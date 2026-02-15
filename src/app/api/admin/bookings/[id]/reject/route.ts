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

  if (booking.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending bookings can be rejected." },
      { status: 400 }
    );
  }

  const { error } = await admin
    .from("bookings")
    .update({ status: "rejected" })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to reject." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
