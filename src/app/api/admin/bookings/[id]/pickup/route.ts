import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createSupabaseAdmin();

  const { data: booking, error: bErr } = await admin
    .from("bookings")
    .select("status, user_id")
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

  // Notify the user their device has been marked as picked up.
  notify(
    [booking.user_id],
    "Device picked up",
    "Your device has been marked as picked up. Enjoy your games!",
    "/my-bookings"
  );

  return NextResponse.json({ success: true });
}
