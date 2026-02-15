"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { ALLOWED_EMAIL_DOMAINS } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, CheckCircle2 } from "lucide-react";

const domainPattern = ALLOWED_EMAIL_DOMAINS.map((d) =>
  d.replace(".", "\\.")
).join("|");

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .regex(
      new RegExp(`@(${domainPattern})$`, "i"),
      `Only ${ALLOWED_EMAIL_DOMAINS.join(", ")} emails are allowed.`
    ),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    const supabase = createSupabaseBrowser();

    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-lg font-black text-primary-foreground">
            PN
          </div>
          <CardTitle className="text-2xl">Sign in to PlayNest</CardTitle>
          <CardDescription>
            Enter your KAIST email to receive a magic link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <div>
                <p className="font-semibold">Check your email!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We&apos;ve sent a magic link to your KAIST email. Click the
                  link to sign in.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@kaist.ac.kr"
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
                {serverError && (
                  <p className="text-sm text-destructive">{serverError}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send Magic Link"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Only{" "}
                <span className="font-medium">
                  {ALLOWED_EMAIL_DOMAINS.join(", ")}
                </span>{" "}
                addresses are accepted.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
