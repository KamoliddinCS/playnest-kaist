import { createSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Create in-app notifications for one or more users.
 * Fire-and-forget — errors are logged but never block the caller.
 */
export async function notify(
  userIds: string[],
  title: string,
  message: string,
  link?: string
) {
  if (userIds.length === 0) return;

  const admin = createSupabaseAdmin();

  const rows = userIds.map((uid) => ({
    user_id: uid,
    title,
    message,
    link: link ?? null,
    read: false,
  }));

  const { error } = await admin.from("notifications").insert(rows);

  if (error) {
    console.error("[notifications] Failed to create notifications:", error);
  }
}

/** Notify all admin users. */
export async function notifyAdmins(
  title: string,
  message: string,
  link?: string
) {
  const admin = createSupabaseAdmin();

  const { data: admins, error } = await admin
    .from("users")
    .select("id")
    .eq("role", "admin");

  if (error || !admins || admins.length === 0) return;

  await notify(
    admins.map((a) => a.id),
    title,
    message,
    link
  );
}
