import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  CalendarCheck,
  Package,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  MapPin,
  Mail,
  Boxes,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />

        <div className="container flex flex-col items-center gap-6 px-4 py-24 text-center md:py-36">
          <Image
            src="/playnestlogo.png"
            alt="PlayNest logo"
            width={96}
            height={96}
            className="h-24 w-24 rounded-2xl object-cover"
            priority
          />

          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Gamepad2 className="h-4 w-4" />
            Built by KAIST students, for KAIST students
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Weekend gaming,{" "}
            <span className="text-primary">simplified.</span>
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
            Borrow a console for the weekend. No buying, no storing, no
            hassle&nbsp;&mdash; just pick up, play, and return.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="gap-2 px-8 text-base">
              <Link href="/catalogue">
                See What&apos;s Available
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 px-8 text-base"
            >
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Pain Points ─── */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <h2 className="mb-3 text-center text-2xl font-bold tracking-tight md:text-3xl">
            Why borrow instead of buy?
          </h2>
          <p className="mx-auto mb-12 max-w-md text-center text-muted-foreground">
            Owning a console at uni comes with strings attached. We took those
            away.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Clock,
                title: "Post-exam vibes",
                desc: "Finals over? Grab a PS5 for the weekend and decompress with friends.",
              },
              {
                icon: Users,
                title: "Dorm hangouts",
                desc: "Turn any room into a game night. No need to own anything long-term.",
              },
              {
                icon: Package,
                title: "Zero storage stress",
                desc: "No bulky boxes in your room. Borrow when you want, return when done.",
              },
              {
                icon: Sparkles,
                title: "No cost barrier",
                desc: "Access consoles and games without the full price tag of ownership.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-3 text-center text-2xl font-bold tracking-tight md:text-3xl">
            Three steps. That&apos;s it.
          </h2>
          <p className="mx-auto mb-12 max-w-md text-center text-muted-foreground">
            No forms, no deposits, no contracts. Just a quick booking.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                num: "1",
                icon: Gamepad2,
                title: "Browse",
                desc: "Check out what consoles and games are available right now.",
              },
              {
                num: "2",
                icon: CalendarCheck,
                title: "Book",
                desc: "Pick a time window that works for you and submit a request.",
              },
              {
                num: "3",
                icon: Package,
                title: "Pick up & play",
                desc: "Collect from campus, enjoy your games, and return when you\u2019re done.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="group relative flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.num}
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust Signals ─── */}
      <section className="border-t bg-muted/30 py-14">
        <div className="container">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-12">
            {[
              { icon: Mail, text: "KAIST email required" },
              { icon: MapPin, text: "Campus pickup only" },
              { icon: Boxes, text: "Limited units available" },
            ].map((t) => (
              <div
                key={t.text}
                className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground"
              >
                <t.icon className="h-4 w-4 text-primary" />
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20">
        <div className="container flex flex-col items-center gap-5 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Ready to play?
          </h2>
          <p className="max-w-sm text-muted-foreground">
            Sign up with your KAIST email and browse what&apos;s available.
            Takes less than a minute.
          </p>
          <Button asChild size="lg" className="gap-2 px-8 text-base">
            <Link href="/login">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
