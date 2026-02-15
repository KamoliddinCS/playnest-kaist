"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Console } from "@/lib/types";
import {
  Gamepad2,
  Loader2,
  MonitorSmartphone,
  CalendarPlus,
  Wrench,
} from "lucide-react";

/** Map of device label keywords → icons (extensible). */
function deviceIcon(label: string) {
  const lower = label.toLowerCase();
  if (
    lower.includes("ps5") ||
    lower.includes("ps4") ||
    lower.includes("playstation") ||
    lower.includes("xbox") ||
    lower.includes("switch") ||
    lower.includes("nintendo")
  ) {
    return <Gamepad2 className="h-10 w-10" />;
  }
  return <MonitorSmartphone className="h-10 w-10" />;
}

export default function CataloguePage() {
  const [devices, setDevices] = useState<Console[]>([]);
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
        <h1 className="text-3xl font-bold tracking-tight">Device Catalogue</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Browse the devices currently in our collection. Pick one you&apos;d like
          to rent and submit a booking request.
        </p>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No devices are listed yet. Check back soon!
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Available devices */}
          {available.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Available ({available.length})
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

function DeviceCard({ device }: { device: Console }) {
  const isAvailable = device.status === "available";

  return (
    <Card
      className={`flex flex-col transition-shadow hover:shadow-md ${
        !isAvailable ? "opacity-60" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${
            isAvailable
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {deviceIcon(device.label)}
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base leading-snug">
            {device.label}
          </CardTitle>
          <div className="mt-1.5">
            <Badge variant={isAvailable ? "success" : "warning"}>
              {isAvailable ? "Available" : "Maintenance"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1" />

      <CardFooter>
        {isAvailable ? (
          <Button asChild className="w-full gap-2" size="sm">
            <Link href={`/book?device=${device.id}`}>
              <CalendarPlus className="h-4 w-4" />
              Request Rental
            </Link>
          </Button>
        ) : (
          <Button disabled className="w-full gap-2" size="sm" variant="outline">
            <Wrench className="h-4 w-4" />
            Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
