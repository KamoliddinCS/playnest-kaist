"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  BookingStatus,
  BookingWithUser,
  Console,
  UserRole,
} from "@/lib/types";
import {
  Check,
  Loader2,
  Plus,
  ShieldCheck,
  ToggleLeft,
  X,
  PackageCheck,
  PackageOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ───────────────── helpers ───────────────── */

const statusVariant: Record<
  BookingStatus,
  "warning" | "success" | "destructive" | "info" | "secondary"
> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  picked_up: "info",
  returned: "secondary",
};

const statusLabel: Record<BookingStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  picked_up: "Picked Up",
  returned: "Returned",
};

/* ─────────────────── page ─────────────────── */

export default function AdminPage() {
  const router = useRouter();
  const [authorised, setAuthorised] = useState(false);
  const [loading, setLoading] = useState(true);

  // verify admin role client-side (server check also in API)
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if ((profile?.role as UserRole) !== "admin") {
        router.replace("/catalogue");
        return;
      }
      setAuthorised(true);
      setLoading(false);
    })();
  }, [router]);

  if (loading || !authorised) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">PlayNest Admin</h1>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList className="mb-4">
          <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
          <TabsTrigger value="consoles">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <BookingsTab />
        </TabsContent>
        <TabsContent value="consoles">
          <ConsolesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ──────────────── Bookings Tab ──────────────── */

function BookingsTab() {
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBookings(json);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (
    id: string,
    action: "approve" | "reject" | "pickup" | "return"
  ) => {
    setActing(id + action);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/${action}`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Booking ${action}d successfully.`);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All Booking Requests</CardTitle>
        <CardDescription>
          Review, approve, or reject incoming requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No booking requests yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {format(new Date(b.created_at), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-xs">
                    {b.users?.email ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {format(new Date(b.start_at), "MMM d HH:mm")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {format(new Date(b.end_at), "MMM d HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[b.status]}>
                      {statusLabel[b.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {b.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={acting === b.id + "approve"}
                            onClick={() => act(b.id, "approve")}
                            title="Approve"
                          >
                            <Check className="mr-1 h-3 w-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={acting === b.id + "reject"}
                            onClick={() => act(b.id, "reject")}
                            title="Reject"
                          >
                            <X className="mr-1 h-3 w-3" /> Reject
                          </Button>
                        </>
                      )}
                      {b.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={acting === b.id + "pickup"}
                          onClick={() => act(b.id, "pickup")}
                          title="Mark Picked Up"
                        >
                          <PackageOpen className="mr-1 h-3 w-3" /> Picked Up
                        </Button>
                      )}
                      {b.status === "picked_up" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={acting === b.id + "return"}
                          onClick={() => act(b.id, "return")}
                          title="Mark Returned"
                        >
                          <PackageCheck className="mr-1 h-3 w-3" /> Returned
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ──────────────── Consoles Tab ──────────────── */

function ConsolesTab() {
  const [consoles, setConsoles] = useState<Console[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/consoles");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setConsoles(json);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load devices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addConsole = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/consoles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Device added.");
      setNewLabel("");
      setDialogOpen(false);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add device.");
    } finally {
      setAdding(false);
    }
  };

  const toggleStatus = async (c: Console) => {
    setToggling(c.id);
    const newStatus = c.status === "available" ? "maintenance" : "available";
    try {
      const res = await fetch(`/api/admin/consoles/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Device set to ${newStatus}.`);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Toggle failed.");
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Devices</CardTitle>
            <CardDescription>
              Manage the devices available for rental.
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
                <DialogDescription>
                  Provide a label for the new device (e.g. &quot;PS5 #1&quot;, &quot;Nintendo Switch #2&quot;).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="consoleLabel">Label</Label>
                <Input
                  id="consoleLabel"
                  placeholder='e.g. "PS5 #1", "Nintendo Switch Lite"'
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={addConsole} disabled={adding || !newLabel.trim()}>
                  {adding ? "Adding…" : "Add Device"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {consoles.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No devices yet. Add one to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Toggle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consoles.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.label}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.status === "available" ? "success" : "warning"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(c.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(c)}
                      disabled={toggling === c.id}
                    >
                      <ToggleLeft className="mr-1 h-3 w-3" />
                      {c.status === "available"
                        ? "Set Maintenance"
                        : "Set Available"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
