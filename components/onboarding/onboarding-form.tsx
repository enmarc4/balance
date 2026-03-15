"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CURRENCIES } from "@/lib/currencies";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/validators/onboarding";
import type { Locale } from "@/types/domain";
import { useRouter } from "@/i18n/navigation";

const STEPS = [
  {
    key: "profile",
    fields: ["fullName", "preferredCurrency"] as const,
  },
  {
    key: "account",
    fields: [
      "firstAccountName",
      "firstAccountType",
      "firstAccountCurrency",
    ] as const,
  },
  {
    key: "balance",
    fields: ["firstAccountBalance"] as const,
  },
] as const;

export function OnboardingForm({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: "",
      preferredCurrency: "EUR",
      firstAccountName: "",
      firstAccountType: "checking",
      firstAccountCurrency: "EUR",
      firstAccountBalance: 0,
    },
  });

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const formValues = useWatch({ control: form.control });

  const handleNext = async () => {
    const isStepValid = await form.trigger(currentStep.fields, {
      shouldFocus: true,
    });

    if (!isStepValid) {
      return;
    }

    setStepIndex((previous) => Math.min(previous + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStepIndex((previous) => Math.max(previous - 1, 0));
  };

  const onSubmit = (values: OnboardingInput) => {
    setStatus(null);

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setStatus(t("onboarding.error"));
          return;
        }

        const nowIso = new Date().toISOString();
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            user_id: user.id,
            display_name: values.fullName,
            preferred_currency: values.preferredCurrency,
            onboarding_completed_at: nowIso,
          },
          { onConflict: "user_id" },
        );

        if (profileError) {
          setStatus(t("onboarding.error"));
          return;
        }

        const { error: accountError } = await supabase.from("accounts").insert({
          user_id: user.id,
          name: values.firstAccountName,
          type: values.firstAccountType,
          currency: values.firstAccountCurrency,
          current_balance: values.firstAccountBalance,
          status: "active",
        });

        if (accountError) {
          setStatus(t("onboarding.error"));
          return;
        }

        router.replace("/app", { locale });
        router.refresh();
      } catch {
        setStatus(t("onboarding.error"));
      }
    });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[30px] bg-black px-5 pb-7 pt-6 text-white shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
          {t("onboarding.stepLabel", {
            current: String(stepIndex + 1),
            total: String(STEPS.length),
          })}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {t("onboarding.title")}
        </h1>
        <p className="mt-2 text-sm text-white/75">{t("onboarding.subtitle")}</p>
        <div className="mt-5 h-2 w-full rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </section>

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            {t(`onboarding.steps.${currentStep.key}.title` as never)}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {t(`onboarding.steps.${currentStep.key}.subtitle` as never)}
          </p>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {currentStep.key === "profile" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="full-name">{t("onboarding.fullName")}</Label>
                <Input id="full-name" {...form.register("fullName")} />
                {form.formState.errors.fullName?.message && (
                  <p className="text-xs text-red-600">
                    {t(
                      `validation.${form.formState.errors.fullName.message}` as never,
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred-currency">
                  {t("onboarding.preferredCurrency")}
                </Label>
                <Select
                  id="preferred-currency"
                  {...form.register("preferredCurrency")}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}

          {currentStep.key === "account" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="first-account-name">
                  {t("onboarding.firstAccountName")}
                </Label>
                <Input
                  id="first-account-name"
                  {...form.register("firstAccountName")}
                />
                {form.formState.errors.firstAccountName?.message && (
                  <p className="text-xs text-red-600">
                    {t(
                      `validation.${form.formState.errors.firstAccountName.message}` as never,
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="first-account-type">
                  {t("onboarding.firstAccountType")}
                </Label>
                <Select
                  id="first-account-type"
                  {...form.register("firstAccountType")}
                >
                  <option value="cash">{t("accountType.cash")}</option>
                  <option value="checking">{t("accountType.checking")}</option>
                  <option value="savings">{t("accountType.savings")}</option>
                  <option value="investment">{t("accountType.investment")}</option>
                  <option value="credit">{t("accountType.credit")}</option>
                  <option value="wallet">{t("accountType.wallet")}</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first-account-currency">
                  {t("onboarding.firstAccountCurrency")}
                </Label>
                <Select
                  id="first-account-currency"
                  {...form.register("firstAccountCurrency")}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}

          {currentStep.key === "balance" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="first-account-balance">
                  {t("onboarding.firstAccountBalance")}
                </Label>
                <Input
                  id="first-account-balance"
                  type="number"
                  step="0.01"
                  {...form.register("firstAccountBalance", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="rounded-2xl bg-[var(--color-surface)] p-4">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {t("onboarding.reviewTitle")}
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {formValues.fullName || "-"} · {formValues.preferredCurrency}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {formValues.firstAccountName || "-"} ·{" "}
                  {t(`accountType.${formValues.firstAccountType}` as never)}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {formValues.firstAccountCurrency} ·{" "}
                  {Number(formValues.firstAccountBalance || 0).toFixed(2)}
                </p>
              </div>
            </>
          )}

          {status && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {status}
            </p>
          )}

          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={handleBack}
              >
                {t("onboarding.back")}
              </Button>
            )}
            {isLastStep ? (
              <Button
                size="lg"
                className="flex-1"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {t("onboarding.submit")}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                className="flex-1"
                onClick={handleNext}
              >
                {t("onboarding.next")}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
