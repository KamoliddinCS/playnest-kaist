import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Auth check
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const startAt = searchParams.get("start_at");
  const endAt = searchParams.get("end_at");
  const consoleId = searchParams.get("console_id"); // optional — filter by specific device

  if (!startAt || !endAt) {
    return NextResponse.json(
      { error: "start_at and end_at query params are required." },
      { status: 400 }
    );
  }

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return NextResponse.json(
      { error: "Invalid date range." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdmin();

  // 1. Build console query — optionally filter to a specific device.
  let consoleQuery = admin
    .from("consoles")
    .select("id")
    .eq("status", "available");

  if (consoleId) {
    consoleQuery = consoleQuery.eq("id", consoleId);
  }

  const { data: consoles, error: consErr } = await consoleQuery;

  if (consErr) {
    return NextResponse.json(
      { error: "Database error." },
      { status: 500 }
    );
  }

  if (!consoles || consoles.length === 0) {
    return NextResponse.json({
      available: false,
      reason: consoleId
        ? "This device is currently under maintenance or does not exist."
        : "No devices are currently in the system or all are under maintenance.",
    });
  }

  const consoleIds = consoles.map((c) => c.id);

  // 2. Find bookings that overlap with the requested window and are active.
  const { data: overlapping, error: bookErr } = await admin
    .from("bookings")
    .select("console_id")
    .in("status", ["approved", "picked_up"])
    .in("console_id", consoleIds)
    .lt("start_at", endAt)
    .gt("end_at", startAt);

  if (bookErr) {
    return NextResponse.json(
      { error: "Database error." },
      { status: 500 }
    );
  }

  const busyConsoleIds = new Set(
    (overlapping ?? []).map((b) => b.console_id)
  );
  const freeCount = consoleIds.filter((id) => !busyConsoleIds.has(id)).length;

  if (freeCount > 0) {
    return NextResponse.json({ available: true });
  }

  return NextResponse.json({
    available: false,
    reason: consoleId
      ? "This device is already booked for the selected time window. Try a different range."
      : "All devices are booked for this time window. Try a different range.",
  });
}
