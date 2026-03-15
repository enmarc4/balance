"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type SignUpInput, signUpSchema } from "@/lib/validators/auth";
import { SupabaseInlineWarning } from "@/components/setup/supabase-inline-warning";
import type { Locale } from "@/types/domain";

export function RegisterForm({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: SignUpInput) => {
    setStatus(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });

        if (error) {
          setStatus(t("auth.feedback.signUpError"));
          return;
        }

        setSuccess(t("auth.feedback.signUpSuccess"));
        router.replace("/login", { locale });
      } catch {
        setStatus(t("auth.feedback.signUpError"));
      }
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      {!isSupabaseConfigured() && <SupabaseInlineWarning />}

      <div className="space-y-2">
        <Label className="sr-only" htmlFor="register-email">
          {t("auth.register.email")}
        </Label>
        <div className="flex items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-auth-field)] px-4 py-3">
          <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            id="register-email"
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

      <div className="space-y-2">
        <Label className="sr-only" htmlFor="register-password">
          {t("auth.register.password")}
        </Label>
        <div className="flex items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-auth-field)] px-4 py-3">
          <Lock className="h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
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

      <div className="space-y-2">
        <Label className="sr-only" htmlFor="register-confirm">
          {t("auth.register.confirmPassword")}
        </Label>
        <div className="flex items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-auth-field)] px-4 py-3">
          <Lock className="h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            id="register-confirm"
            type={showPassword ? "text" : "password"}
            className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none placeholder:text-[var(--color-text-muted)] focus-visible:ring-0"
            placeholder={t("auth.placeholders.password")}
            {...form.register("confirmPassword")}
          />
        </div>
        {form.formState.errors.confirmPassword?.message && (
          <p className="text-xs text-red-600">
            {t(
              `validation.${form.formState.errors.confirmPassword.message}` as never,
            )}
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
        {t("auth.register.submit")}
      </Button>

      <div className="text-center text-sm text-[var(--color-text-muted)]">
        {t("auth.register.haveAccount")}{" "}
        <Link
          href="/login"
          locale={locale}
          className="font-semibold text-[var(--color-link)]"
        >
          {t("auth.register.loginCta")}
        </Link>
      </div>
    </form>
  );
}
