"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PICKUP_INSTRUCTIONS } from "@/lib/config";
import type { BookingStatus, BookingWithConsole } from "@/lib/types";
import { CalendarCheck, Info, Loader2, MonitorSmartphone } from "lucide-react";

const statusVariantMap: Record<
  BookingStatus,
  "warning" | "success" | "destructive" | "info" | "secondary"
> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  picked_up: "info",
  returned: "secondary",
};

const statusLabelMap: Record<BookingStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  picked_up: "Picked Up",
  returned: "Returned",
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithConsole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/bookings/me");
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Failed to load bookings.");
          return;
        }
        setBookings(json);
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

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 flex items-center gap-2">
        <CalendarCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">My Bookings</h1>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No bookings yet!{" "}
            <a href="/catalogue" className="underline">
              Browse what&apos;s available
            </a>{" "}
            and book your first device.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {b.consoles?.label && (
                      <div className="mb-1 flex items-center gap-1.5 text-sm text-primary">
                        <MonitorSmartphone className="h-3.5 w-3.5" />
                        <span className="font-medium">{b.consoles.label}</span>
                      </div>
                    )}
                    <CardTitle className="text-base">
                      {format(new Date(b.start_at), "MMM d, yyyy HH:mm")} →{" "}
                      {format(new Date(b.end_at), "MMM d, yyyy HH:mm")}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Submitted{" "}
                      {format(new Date(b.created_at), "MMM d, yyyy HH:mm")}
                    </CardDescription>
                  </div>
                  <Badge variant={statusVariantMap[b.status]} className="shrink-0">
                    {statusLabelMap[b.status]}
                  </Badge>
                </div>
              </CardHeader>

              {(b.status === "approved" || b.status === "picked_up") && (
                <CardContent>
                  <div className="flex gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Pickup &amp; Return Info
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {PICKUP_INSTRUCTIONS}
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
