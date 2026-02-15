import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("consoles")
    .select("*")
    .order("label", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch devices." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
