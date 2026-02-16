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

  if (booking.status !== "picked_up") {
    return NextResponse.json(
      { error: "Only picked-up bookings can be marked as returned." },
      { status: 400 }
    );
  }

  const { error } = await admin
    .from("bookings")
    .update({ status: "returned" })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update." },
      { status: 500 }
    );
  }

  // Notify the user their device has been marked as returned.
  notify(
    [booking.user_id],
    "Device returned",
    "Your device has been marked as returned. Thanks for using PlayNest!",
    "/my-bookings"
  );

  return NextResponse.json({ success: true });
}
