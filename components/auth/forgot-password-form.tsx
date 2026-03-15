"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { getAppUrl, isSupabaseConfigured } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validators/auth";
import { SupabaseInlineWarning } from "@/components/setup/supabase-inline-warning";
import type { Locale } from "@/types/domain";

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const [status, setStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ForgotPasswordInput) => {
    setStatus(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.resetPasswordForEmail(
          values.email,
          {
            redirectTo: `${getAppUrl()}/${locale}/login`,
          },
        );

        if (error) {
          setStatus(t("auth.feedback.resetError"));
          return;
        }

        setSuccess(t("auth.feedback.resetSuccess"));
      } catch {
        setStatus(t("auth.feedback.resetError"));
      }
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      {!isSupabaseConfigured() && <SupabaseInlineWarning />}
      <div className="space-y-2">
        <Label className="sr-only" htmlFor="forgot-email">
          {t("auth.forgot.email")}
        </Label>
        <div className="flex items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-auth-field)] px-4 py-3">
          <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            id="forgot-email"
            type="email"
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

      {status && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {status}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <Button
        size="lg"
        className="mt-4 w-full"
        type="submit"
        disabled={form.formState.isSubmitting || !isSupabaseConfigured()}
      >
        {t("auth.forgot.submit")}
      </Button>

      <div className="pt-1 text-center text-sm text-[var(--color-text-muted)]">
        <Link
          href="/login"
          locale={locale}
          className="font-semibold text-[var(--color-link)]"
        >
          {t("auth.forgot.loginCta")}
        </Link>
      </div>
    </form>
  );
}
