# PlayNest KAIST

A private device lending hub for the KAIST community — built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**. Styled with KAIST's official brand colours.

---

## Features

- **Device Catalogue** — browse all available consoles, handhelds, and accessories at a glance.
- **Rental Requests** — pick a specific device and time window, check availability, and submit a booking request.
- **Magic-link authentication** — restricted to `@kaist.ac.kr` (and `@kaist.edu`) emails.
- **Admin panel** — approve/reject requests, assign devices, mark pickup & return.
- **Device management** — add devices, toggle between available / maintenance.
- **Pickup & return instructions** — shown only when a booking is approved or picked up.
- **KAIST-branded UI** — deep blue primary (#004191) colour scheme.

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/KamoliddinCS/playnest-kaist.git
cd playnest-kaist
npm install
```

### 2. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the following SQL in the Supabase SQL Editor to create the required tables:

```sql
-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consoles (devices)
CREATE TABLE IF NOT EXISTS consoles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  console_id UUID REFERENCES consoles(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

3. (Optional) Enable RLS on the tables and create policies as needed.

### 3. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | Your app URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_PICKUP_INSTRUCTIONS` | Pickup/return coordination instructions text |

### 4. Make a User Admin

After a user signs in for the first time, promote them to admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@kaist.ac.kr';
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Folder Structure

```
src/
├── app/
│   ├── globals.css             # Tailwind + KAIST-branded CSS variables
│   ├── layout.tsx              # Root layout with Navbar & Providers
│   ├── page.tsx                # Landing page (hero + how-it-works)
│   ├── login/page.tsx          # Magic-link sign-in
│   ├── catalogue/page.tsx      # Device catalogue (browse all devices)
│   ├── book/page.tsx           # Rental request form (device + date/time)
│   ├── my-bookings/page.tsx    # User's bookings list
│   ├── account/page.tsx        # Account info + sign out
│   ├── admin/page.tsx          # Admin panel (bookings + devices tabs)
│   ├── auth/callback/route.ts  # Supabase auth callback
│   └── api/
│       ├── availability/route.ts        # GET — check device availability
│       ├── bookings/route.ts            # POST — create booking request
│       ├── bookings/me/route.ts         # GET — user bookings
│       ├── catalogue/route.ts           # GET — list all devices
│       └── admin/
│           ├── bookings/route.ts
│           ├── bookings/[id]/approve/route.ts
│           ├── bookings/[id]/reject/route.ts
│           ├── bookings/[id]/pickup/route.ts
│           ├── bookings/[id]/return/route.ts
│           ├── consoles/route.ts
│           └── consoles/[id]/route.ts
├── components/
│   ├── navbar.tsx              # Role-aware navigation bar
│   ├── providers.tsx           # Sonner toaster provider
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── config.ts               # Allowed domains, pickup instructions, time slots
│   ├── types.ts                # TypeScript interfaces
│   ├── utils.ts                # cn() utility
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server + service-role clients
│       └── auth-helpers.ts     # requireAuth / requireAdmin helpers
└── middleware.ts               # Session refresh + route protection
```

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (Auth + Postgres)
- **React Hook Form** + **Zod**
- **date-fns**
- **Sonner** (toast notifications)
