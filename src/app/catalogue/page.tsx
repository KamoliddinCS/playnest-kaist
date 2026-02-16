"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ConsoleWithGames } from "@/lib/types";
import { formatKRW } from "@/lib/config";
import {
  Disc3,
  Gamepad2,
  Loader2,
  MonitorSmartphone,
  CalendarPlus,
  Wrench,
} from "lucide-react";

/** Fallback icon when no image is available. */
function DeviceFallbackIcon({ label }: { label: string }) {
  const lower = label.toLowerCase();
  const isConsole =
    lower.includes("ps5") ||
    lower.includes("ps4") ||
    lower.includes("playstation") ||
    lower.includes("xbox") ||
    lower.includes("switch") ||
    lower.includes("nintendo") ||
    lower.includes("steam deck");

  return isConsole ? (
    <Gamepad2 className="h-12 w-12 text-muted-foreground/50" />
  ) : (
    <MonitorSmartphone className="h-12 w-12 text-muted-foreground/50" />
  );
}

export default function CataloguePage() {
  const [devices, setDevices] = useState<ConsoleWithGames[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/catalogue");
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Failed to load catalogue.");
          return;
        }
        setDevices(json);
      } catch {
        toast.error("Network error.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const available = devices.filter((d) => d.status === "available");
  const maintenance = devices.filter((d) => d.status === "maintenance");

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">What&apos;s Available</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          See what consoles and handhelds you can borrow this week. Tap a device
          to check out its games and book it.
        </p>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Nothing here yet — check back soon!
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Available devices */}
          {available.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Ready to borrow ({available.length})
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {available.map((d) => (
                  <DeviceCard key={d.id} device={d} />
                ))}
              </div>
            </section>
          )}

          {/* Maintenance devices */}
          {maintenance.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                <Wrench className="h-4 w-4" />
                Under Maintenance ({maintenance.length})
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {maintenance.map((d) => (
                  <DeviceCard key={d.id} device={d} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function DeviceCard({ device }: { device: ConsoleWithGames }) {
  const isAvailable = device.status === "available";
  const [imgError, setImgError] = useState(false);
  const gameCount = device.games?.length ?? 0;

  return (
    <Link href={`/catalogue/${device.id}`} className="group block">
      <Card
        className={`flex flex-col overflow-hidden transition-shadow group-hover:shadow-lg ${
          !isAvailable ? "opacity-60" : ""
        }`}
      >
        {/* Image area */}
        <div
          className={`relative flex h-44 items-center justify-center overflow-hidden ${
            isAvailable ? "bg-muted/40" : "bg-muted/60"
          }`}
        >
          {device.image_url && !imgError ? (
            <Image
              src={device.image_url}
              alt={device.label}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <DeviceFallbackIcon label={device.label} />
          )}
        </div>

        <CardHeader className="pb-2 pt-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">
              {device.label}
            </CardTitle>
            {device.price_per_day != null && device.price_per_day > 0 && (
              <span className="shrink-0 text-sm font-semibold text-primary">
                {formatKRW(device.price_per_day)}
                <span className="text-xs font-normal text-muted-foreground">/day</span>
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant={isAvailable ? "success" : "warning"}>
              {isAvailable ? "Available" : "Maintenance"}
            </Badge>
            {gameCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Disc3 className="h-3 w-3" />
                {gameCount} {gameCount === 1 ? "game" : "games"}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1" />

        <CardFooter className="pt-0">
          {isAvailable ? (
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <CalendarPlus className="h-4 w-4" />
              View &amp; Book
            </span>
          ) : (
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground">
              <Wrench className="h-4 w-4" />
              Unavailable
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
