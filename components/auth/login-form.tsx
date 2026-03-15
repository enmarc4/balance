"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type SignInInput, signInSchema } from "@/lib/validators/auth";
import { SupabaseInlineWarning } from "@/components/setup/supabase-inline-warning";
import type { Locale } from "@/types/domain";

export function LoginForm({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let active = true;

    const navigateToApp = () => {
      if (!active) {
        return;
      }

      router.replace("/app", { locale });
      router.refresh();
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigateToApp();
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigateToApp();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [locale, router]);

  const onSubmit = (values: SignInInput) => {
    setStatus(null);

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          setStatus(t("auth.feedback.signInError"));
          return;
        }

        router.replace("/app", { locale });
        router.refresh();
      } catch {
        setStatus(t("auth.feedback.signInError"));
      }
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      {!isSupabaseConfigured() && <SupabaseInlineWarning />}

      <div className="space-y-2">
        <Label className="sr-only" htmlFor="login-email">
          {t("auth.login.email")}
        </Label>
        <div className="flex items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-auth-field)] px-4 py-3">
          <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none placeholder:text-[var(--color-text-muted)] focus-visible:ring-0"
            placeholder={t("auth.placeholders.email")}
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email?.message && (
          <p className="text-xs text-red-600">
            {t(`validation.${form.formState.errors.email.message}` as never)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="sr-only" htmlFor="login-password">
          {t("auth.login.password")}
        </Label>
        <div className="flex items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-auth-field)] px-4 py-3">
          <Lock className="h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none placeholder:text-[var(--color-text-muted)] focus-visible:ring-0"
            placeholder={t("auth.placeholders.password")}
            {...form.register("password")}
          />
          <button
            type="button"
            className="text-[var(--color-text-muted)]"
            aria-label={
              showPassword ? t("common.hidePassword") : t("common.showPassword")
            }
            onClick={() => setShowPassword((previous) => !previous)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {form.formState.errors.password?.message && (
          <p className="text-xs text-red-600">
            {t(`validation.${form.formState.errors.password.message}` as never)}
          </p>
        )}
      </div>

      {status && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {status}
        </p>
      )}

      <div className="flex justify-end text-sm">
        <Link
          href="/forgot-password"
          locale={locale}
          className="text-[var(--color-link)]"
        >
          {t("auth.login.forgotCta")}
        </Link>
      </div>

      <Button
        size="lg"
        className="mt-4 w-full"
        type="submit"
        disabled={form.formState.isSubmitting || !isSupabaseConfigured()}
      >
        {t("auth.login.submit")}
      </Button>

      <div className="pt-1 text-center text-sm text-[var(--color-text-muted)]">
        {t("auth.login.newUser")}{" "}
        <Link
          href="/register"
          locale={locale}
          className="font-semibold text-[var(--color-link)]"
        >
          {t("auth.login.registerCta")}
        </Link>
      </div>
    </form>
  );
}
