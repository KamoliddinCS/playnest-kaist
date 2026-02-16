import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { MAX_BOOKING_DAYS } from "@/lib/config";
import { notifyAdmins } from "@/lib/notifications";

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  let body: { start_at?: string; end_at?: string; console_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { start_at, end_at, console_id } = body;
  if (!start_at || !end_at) {
    return NextResponse.json(
      { error: "start_at and end_at are required." },
      { status: 400 }
    );
  }

  const start = new Date(start_at);
  const end = new Date(end_at);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json(
      { error: "Invalid dates." },
      { status: 400 }
    );
  }

  if (start <= new Date()) {
    return NextResponse.json(
      { error: "Start must be in the future." },
      { status: 400 }
    );
  }

  if (end <= start) {
    return NextResponse.json(
      { error: "End must be after start." },
      { status: 400 }
    );
  }

  const diffMs = end.getTime() - start.getTime();
  if (diffMs > MAX_BOOKING_DAYS * 24 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: `Maximum booking duration is ${MAX_BOOKING_DAYS} days.` },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdmin();

  // If a specific device was requested, validate it exists.
  if (console_id) {
    const { data: device } = await admin
      .from("consoles")
      .select("id")
      .eq("id", console_id)
      .single();

    if (!device) {
      return NextResponse.json(
        { error: "Requested device not found." },
        { status: 400 }
      );
    }
  }

  const { data, error } = await admin
    .from("bookings")
    .insert({
      user_id: user.id,
      console_id: console_id || null,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create booking." },
      { status: 500 }
    );
  }

  // Notify admins about the new booking request.
  const userEmail = user.email ?? "A user";
  notifyAdmins(
    "New booking request",
    `${userEmail} submitted a new booking request.`,
    "/admin"
  );

  return NextResponse.json(data, { status: 201 });
}
