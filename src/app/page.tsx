import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  CalendarCheck,
  ShieldCheck,
  MonitorSmartphone,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />

        <div className="container flex flex-col items-center gap-8 px-4 py-24 text-center md:py-36">
          {/* Brand badge */}
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Gamepad2 className="h-4 w-4" />
            KAIST Community Device Hub
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-primary">PlayNest</span>{" "}
            <span className="text-foreground/80">KAIST</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Browse our catalogue of gaming consoles and devices, request a
            rental, and coordinate pickup &amp; return — all within the KAIST
            community.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="gap-2 px-8 text-base">
              <Link href="/catalogue">
                <MonitorSmartphone className="h-5 w-5" />
                Browse Catalogue
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 px-8 text-base"
            >
              <Link href="/login">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-2xl font-bold tracking-tight md:text-3xl">
            How It Works
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group relative flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <MonitorSmartphone className="h-7 w-7" />
              </div>
              <div className="absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-lg font-semibold">Browse Devices</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Explore our catalogue of gaming consoles, handhelds, and
                accessories available for the KAIST community.
              </p>
            </div>

            <div className="group relative flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <div className="absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-lg font-semibold">Request a Rental</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pick your preferred device and a time window. Check
                availability, then submit your booking request.
              </p>
            </div>

            <div className="group relative flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div className="absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-lg font-semibold">Pickup &amp; Return</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Once approved, follow the pickup instructions. Return the device
                when you&apos;re done — simple as that.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer accent */}
      <section className="border-t py-12">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            Restricted to verified{" "}
            <span className="font-semibold text-foreground">
              @kaist.ac.kr
            </span>{" "}
            email addresses. Your bookings stay within the community.
          </p>
        </div>
      </section>
    </div>
  );
}
