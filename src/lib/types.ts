export type UserRole = "user" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  created_at: string;
}

export type ConsoleStatus = "available" | "maintenance";

export interface Console {
  id: string;
  label: string;
  status: ConsoleStatus;
  image_url: string | null;
  /** Daily access fee in KRW (₩). null = free / not yet set. */
  price_per_day: number | null;
  created_at: string;
}

export interface Game {
  id: string;
  console_id: string;
  title: string;
  image_url: string | null;
  created_at: string;
}

/** Console with its associated games list. */
export interface ConsoleWithGames extends Console {
  games: Game[];
}

export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "picked_up"
  | "returned";

export interface Booking {
  id: string;
  user_id: string;
  console_id: string | null;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  notes: string | null;
  /** Total fee in KRW quoted at booking time. null = free. */
  total_price: number | null;
  created_at: string;
}

/* ─── Notifications ─── */

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

/** Booking joined with user email (for admin views). */
export interface BookingWithUser extends Booking {
  users: { email: string } | null;
}

/** Booking joined with console label (for user views). */
export interface BookingWithConsole extends Booking {
  consoles: { label: string; price_per_day: number | null } | null;
}
