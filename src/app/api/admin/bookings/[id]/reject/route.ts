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

  // Notify the user their booking was rejected.
  notify(
    [booking.user_id],
    "Booking not approved",
    "Unfortunately your booking request wasn\u2019t approved this time. Feel free to try another time window.",
    "/my-bookings"
  );

  return NextResponse.json({ success: true });
}
