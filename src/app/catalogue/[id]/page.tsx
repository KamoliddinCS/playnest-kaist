"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ConsoleWithGames } from "@/lib/types";
import { formatKRW } from "@/lib/config";
import {
  ArrowLeft,
  CalendarPlus,
  Disc3,
  Gamepad2,
  Loader2,
  MonitorSmartphone,
  Wrench,
} from "lucide-react";

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [device, setDevice] = useState<ConsoleWithGames | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/catalogue/${params.id}`);
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Device not found.");
          router.push("/catalogue");
          return;
        }
        setDevice(json);
      } catch {
        toast.error("Network error.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!device) return null;

  const isAvailable = device.status === "available";
  const gameCount = device.games?.length ?? 0;

  return (
    <div className="container max-w-4xl py-10">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="mb-6 gap-1.5 text-muted-foreground"
      >
        <Link href="/catalogue">
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>
      </Button>

      {/* Device header */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
        {/* Device image */}
        <DeviceImage
          imageUrl={device.image_url}
          label={device.label}
          isAvailable={isAvailable}
        />

        {/* Device info */}
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {device.label}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant={isAvailable ? "success" : "warning"}
                className="text-sm"
              >
                {isAvailable ? "Available" : "Under Maintenance"}
              </Badge>
              {gameCount > 0 && (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Disc3 className="h-4 w-4" />
                  {gameCount} {gameCount === 1 ? "game" : "games"}
                </span>
              )}
            </div>

            {/* Price */}
            {device.price_per_day != null && device.price_per_day > 0 && (
              <p className="mt-3 text-xl font-bold text-primary">
                {formatKRW(device.price_per_day)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  per day
                </span>
              </p>
            )}
          </div>

          {/* Book button */}
          <div className="mt-2">
            {isAvailable ? (
              <Button asChild size="lg" className="gap-2">
                <Link href={`/book?device=${device.id}`}>
                  <CalendarPlus className="h-5 w-5" />
                  Book This Device
                </Link>
              </Button>
            ) : (
              <Button disabled size="lg" variant="outline" className="gap-2">
                <Wrench className="h-5 w-5" />
                Currently Unavailable
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Games section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Disc3 className="h-5 w-5 text-primary" />
          Installed Games
          {gameCount > 0 && (
            <span className="text-base font-normal text-muted-foreground">
              ({gameCount})
            </span>
          )}
        </h2>

        {gameCount === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No games listed yet — check back soon!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {device.games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── Device Image ─── */

function DeviceImage({
  imageUrl,
  label,
  isAvailable,
}: {
  imageUrl: string | null;
  label: string;
  isAvailable: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  const lower = label.toLowerCase();
  const isConsoleType =
    lower.includes("ps5") ||
    lower.includes("ps4") ||
    lower.includes("playstation") ||
    lower.includes("xbox") ||
    lower.includes("switch") ||
    lower.includes("nintendo") ||
    lower.includes("steam deck");

  return (
    <div
      className={`relative flex h-56 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl md:h-64 md:w-72 ${
        isAvailable ? "bg-muted/40" : "bg-muted/60"
      }`}
    >
      {imageUrl && !imgError ? (
        <Image
          src={imageUrl}
          alt={label}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 288px"
          onError={() => setImgError(true)}
          priority
        />
      ) : isConsoleType ? (
        <Gamepad2 className="h-16 w-16 text-muted-foreground/40" />
      ) : (
        <MonitorSmartphone className="h-16 w-16 text-muted-foreground/40" />
      )}
    </div>
  );
}

/* ─── Game Card ─── */

function GameCard({ game }: { game: ConsoleWithGames["games"][number] }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="flex flex-row items-center gap-3 overflow-hidden p-0 transition-shadow hover:shadow-md">
      {/* Game image */}
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden bg-muted/40">
        {game.image_url && !imgError ? (
          <Image
            src={game.image_url}
            alt={game.title}
            fill
            className="object-cover"
            sizes="80px"
            onError={() => setImgError(true)}
          />
        ) : (
          <Disc3 className="h-8 w-8 text-muted-foreground/40" />
        )}
      </div>

      {/* Game info */}
      <div className="flex-1 py-3 pr-4">
        <p className="text-sm font-medium leading-snug">{game.title}</p>
      </div>
    </Card>
  );
}
