"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, differenceInMilliseconds } from "date-fns";
import { toast } from "sonner";
import { MAX_BOOKING_DAYS, TIME_SLOTS } from "@/lib/config";
import type { Console } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  MonitorSmartphone,
} from "lucide-react";
import Link from "next/link";

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BookPageInner />
    </Suspense>
  );
}

const bookingSchema = z
  .object({
    deviceId: z.string().min(1, "Please select a device."),
    startDate: z.string().min(1, "Start date is required."),
    startTime: z.string().min(1, "Start time is required."),
    endDate: z.string().min(1, "End date is required."),
    endTime: z.string().min(1, "End time is required."),
  })
  .refine(
    (d) => {
      const start = new Date(`${d.startDate}T${d.startTime}`);
      return start > new Date();
    },
    { message: "Start must be in the future.", path: ["startDate"] }
  )
  .refine(
    (d) => {
      const start = new Date(`${d.startDate}T${d.startTime}`);
      const end = new Date(`${d.endDate}T${d.endTime}`);
      return end > start;
    },
    { message: "End must be after start.", path: ["endDate"] }
  )
  .refine(
    (d) => {
      const start = new Date(`${d.startDate}T${d.startTime}`);
      const end = new Date(`${d.endDate}T${d.endTime}`);
      const diff = differenceInMilliseconds(end, start);
      return diff <= MAX_BOOKING_DAYS * 24 * 60 * 60 * 1000;
    },
    {
      message: `Maximum booking duration is ${MAX_BOOKING_DAYS} days.`,
      path: ["endDate"],
    }
  );

type BookingForm = z.infer<typeof bookingSchema>;

function BookPageInner() {
  const searchParams = useSearchParams();
  const preselectedDevice = searchParams.get("device") ?? "";

  const [devices, setDevices] = useState<Console[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);

  const [availability, setAvailability] = useState<{
    checked: boolean;
    available: boolean;
    reason?: string;
  }>({ checked: false, available: false });
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      deviceId: preselectedDevice,
      startDate: format(new Date(), "yyyy-MM-dd"),
      startTime: "",
      endDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      endTime: "",
    },
  });

  const formValues = watch();

  // Load available devices.
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/catalogue");
        const json = await res.json();
        if (res.ok) {
          setDevices(
            (json as Console[]).filter((d) => d.status === "available")
          );
        }
      } catch {
        /* ignore — toast from catalogue page */
      } finally {
        setDevicesLoading(false);
      }
    }
    load();
  }, []);

  // When preselected device is available and form hasn't changed yet.
  useEffect(() => {
    if (preselectedDevice && devices.length > 0) {
      const found = devices.find((d) => d.id === preselectedDevice);
      if (found) {
        setValue("deviceId", found.id, { shouldValidate: true });
      }
    }
  }, [preselectedDevice, devices, setValue]);

  const buildISO = (date: string, time: string) =>
    new Date(`${date}T${time}`).toISOString();

  const selectedDevice = devices.find((d) => d.id === formValues.deviceId);

  const checkAvailability = async (data: BookingForm) => {
    setChecking(true);
    setAvailability({ checked: false, available: false });

    try {
      const startAt = buildISO(data.startDate, data.startTime);
      const endAt = buildISO(data.endDate, data.endTime);

      const url = `/api/availability?start_at=${encodeURIComponent(startAt)}&end_at=${encodeURIComponent(endAt)}&console_id=${encodeURIComponent(data.deviceId)}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Failed to check availability.");
        return;
      }

      setAvailability({
        checked: true,
        available: json.available,
        reason: json.reason,
      });
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const submitBooking = async () => {
    setSubmitting(true);
    try {
      const startAt = buildISO(formValues.startDate, formValues.startTime);
      const endAt = buildISO(formValues.endDate, formValues.endTime);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_at: startAt,
          end_at: endAt,
          console_id: formValues.deviceId,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Failed to submit booking request.");
        return;
      }

      toast.success("Booking request submitted!");
      setSubmitted(true);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container flex max-w-lg flex-col items-center gap-4 py-20 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h2 className="text-2xl font-bold">Request Submitted</h2>
        <p className="text-muted-foreground">
          Your rental request is now pending review. You&apos;ll see the status
          update on your{" "}
          <Link href="/my-bookings" className="underline">
            My Bookings
          </Link>{" "}
          page.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => setSubmitted(false)} variant="outline">
            Submit Another Request
          </Button>
          <Button asChild>
            <Link href="/catalogue">Back to Catalogue</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-lg py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <CardTitle>Request a Rental</CardTitle>
          </div>
          <CardDescription>
            Select a device and your desired date &amp; time range (30-min
            increments, max {MAX_BOOKING_DAYS} days).
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(checkAvailability)}
            className="space-y-6"
          >
            {/* Device selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                Device
              </Label>
              {devicesLoading ? (
                <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading devices…
                </div>
              ) : devices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No devices available.{" "}
                  <Link href="/catalogue" className="underline">
                    View catalogue
                  </Link>
                  .
                </p>
              ) : (
                <Select
                  value={formValues.deviceId}
                  onValueChange={(v) => {
                    setValue("deviceId", v, { shouldValidate: true });
                    setAvailability({ checked: false, available: false });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a device…" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.deviceId && (
                <p className="text-sm text-destructive">
                  {errors.deviceId.message}
                </p>
              )}
              {selectedDevice && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium">{selectedDevice.label}</span>
                </p>
              )}
            </div>

            {/* Start */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  onChange={(e) => {
                    register("startDate").onChange(e);
                    setAvailability({ checked: false, available: false });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select
                  value={formValues.startTime}
                  onValueChange={(v) => {
                    setValue("startTime", v, { shouldValidate: true });
                    setAvailability({ checked: false, available: false });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.startTime && (
                  <p className="text-sm text-destructive">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
            </div>
            {errors.startDate && (
              <p className="-mt-4 text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}

            {/* End */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  onChange={(e) => {
                    register("endDate").onChange(e);
                    setAvailability({ checked: false, available: false });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select
                  value={formValues.endTime}
                  onValueChange={(v) => {
                    setValue("endTime", v, { shouldValidate: true });
                    setAvailability({ checked: false, available: false });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.endTime && (
                  <p className="text-sm text-destructive">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>
            {errors.endDate && (
              <p className="-mt-4 text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}

            {/* Availability result */}
            {availability.checked && (
              <div
                className={`flex items-start gap-3 rounded-md border p-4 ${
                  availability.available
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                    : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                }`}
              >
                {availability.available ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                )}
                <div>
                  <p className="font-medium">
                    {availability.available
                      ? "This device is available for your selected window!"
                      : "This device is not available for that window."}
                  </p>
                  {availability.reason && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {availability.reason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" disabled={checking} className="flex-1">
                {checking ? "Checking…" : "Check Availability"}
              </Button>
              {availability.checked && availability.available && (
                <Button
                  type="button"
                  onClick={submitBooking}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? "Submitting…" : "Submit Request"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
