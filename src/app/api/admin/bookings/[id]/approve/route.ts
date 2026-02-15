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
  const bookingId = params.id;

  // Fetch the booking.
  const { data: booking, error: bErr } = await admin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bErr || !booking) {
    return NextResponse.json(
      { error: "Booking not found." },
      { status: 404 }
    );
  }

  if (booking.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending bookings can be approved." },
      { status: 400 }
    );
  }

  // Find available consoles that are not booked during this window.
  const { data: consoles } = await admin
    .from("consoles")
    .select("id")
    .eq("status", "available");

  if (!consoles || consoles.length === 0) {
    return NextResponse.json(
      { error: "No consoles available." },
      { status: 400 }
    );
  }

  const consoleIds = consoles.map((c) => c.id);

  const { data: overlapping } = await admin
    .from("bookings")
    .select("console_id")
    .in("status", ["approved", "picked_up"])
    .in("console_id", consoleIds)
    .lt("start_at", booking.end_at)
    .gt("end_at", booking.start_at);

  const busyIds = new Set((overlapping ?? []).map((b) => b.console_id));
  const freeConsole = consoleIds.find((id) => !busyIds.has(id));

  if (!freeConsole) {
    return NextResponse.json(
      { error: "No free console for this time window." },
      { status: 400 }
    );
  }

  // Approve and assign console.
  const { error: uErr } = await admin
    .from("bookings")
    .update({ status: "approved", console_id: freeConsole })
    .eq("id", bookingId);

  if (uErr) {
    return NextResponse.json(
      { error: "Failed to approve." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
