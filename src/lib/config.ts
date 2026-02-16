/** Allowed email domains for login. Easy to extend — just add to the array. */
export const ALLOWED_EMAIL_DOMAINS = ["kaist.ac.kr", "kaist.edu"] as const;

/** Pickup / return coordination info shown to users with approved bookings. */
export const PICKUP_INSTRUCTIONS =
  process.env.NEXT_PUBLIC_PICKUP_INSTRUCTIONS ??
  "Pick up from KAIST N1 Building, Room 123. Bring your KAIST ID. Pickup window: Mon\u2013Fri 9:00\u201318:00. Return to the same spot when you\u2019re done!";

/** Maximum booking duration in days. */
export const MAX_BOOKING_DAYS = 7;

/** Time-slot increment in minutes. */
export const TIME_SLOT_INCREMENT_MINUTES = 30;

/** Generate time-slot options (e.g. "00:00", "00:30", …, "23:30"). */
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += TIME_SLOT_INCREMENT_MINUTES) {
      slots.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
    }
  }
  return slots;
}

export const TIME_SLOTS = generateTimeSlots();
