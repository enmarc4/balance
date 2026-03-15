"use client";

import { X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/domain";

type QuickAccount = {
  id: string;
  name: string;
  currency: string;
  current_balance: number;
};

type QuickCategory = {
  id: string;
  name: string;
  kind: TransactionType;
};

type FormState = {
  accountId: string;
  categoryId: string;
  name: string;
  amount: string;
  transactionDate: string;
};

const INITIAL_FORM_STATE: FormState = {
  accountId: "",
  categoryId: "",
  name: "",
  amount: "",
  transactionDate: "",
};

function getTodayDateValue() {
  const now = new Date();
  const localOffsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - localOffsetMs).toISOString().slice(0, 10);
}

export function QuickTransactionSheet({
  mode,
  onClose,
}: {
  mode: TransactionType | null;
  onClose: () => void;
}) {
  const isOpen = mode !== null;
  const t = useTranslations("dashboard.quickEntry");
  const router = useRouter();

  const [accounts, setAccounts] = useState<QuickAccount[]>([]);
  const [categories, setCategories] = useState<QuickCategory[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const handleClose = useCallback(() => {
    if (!submitting) {
      onClose();
    }
  }, [onClose, submitting]);

  useEffect(() => {
    if (!isOpen || !mode) {
      return;
    }

    let active = true;
    setStatus(null);
    setLoadingOptions(true);

    const loadOptions = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (active) {
            setStatus(t("errors.authRequired"));
          }
          return;
        }

        const [{ data: accountRows, error: accountsError }, { data: categoryRows, error: categoriesError }] =
          await Promise.all([
            supabase
              .from("accounts")
              .select("id,name,currency,current_balance")
              .eq("user_id", user.id)
              .eq("status", "active")
              .order("created_at", { ascending: false }),
            supabase
              .from("categories")
              .select("id,name,kind")
              .eq("user_id", user.id)
              .eq("kind", mode)
              .order("name", { ascending: true }),
          ]);

        if (!active) {
          return;
        }

        if (accountsError || categoriesError) {
          setStatus(t("errors.loadOptions"));
          return;
        }

        const nextAccounts = (accountRows ?? []).map((account) => ({
          id: account.id as string,
          name: account.name as string,
          currency: account.currency as string,
          current_balance: Number(account.current_balance ?? 0),
        }));
        const nextCategories = (categoryRows ?? []).map((category) => ({
          id: category.id as string,
          name: category.name as string,
          kind: category.kind as TransactionType,
        }));

        setAccounts(nextAccounts);
        setCategories(nextCategories);
        setForm({
          accountId: nextAccounts[0]?.id ?? "",
          categoryId: nextCategories[0]?.id ?? "",
          name: "",
          amount: "",
          transactionDate: getTodayDateValue(),
        });

        if (nextAccounts.length === 0) {
          setStatus(t("errors.noAccounts"));
        }
      } catch {
        if (active) {
          setStatus(t("errors.loadOptions"));
        }
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      active = false;
    };
  }, [isOpen, mode, t]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        handleClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleClose, isOpen, submitting]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!mode) {
      return;
    }

    const parsedAmount = Number(form.amount);
    const trimmedName = form.name.trim();

    if (
      !form.accountId ||
      trimmedName.length < 2 ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setStatus(t("errors.invalidForm"));
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus(t("errors.authRequired"));
        return;
      }

      const selectedAccount = accounts.find((account) => account.id === form.accountId);
      if (!selectedAccount) {
        setStatus(t("errors.invalidForm"));
        return;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          account_id: selectedAccount.id,
          category_id: form.categoryId || null,
          type: mode,
          name: trimmedName,
          amount: parsedAmount,
          currency: selectedAccount.currency,
          transaction_date: form.transactionDate || getTodayDateValue(),
        })
        .select("id")
        .single();

      if (insertError || !inserted?.id) {
        setStatus(t("errors.save"));
        return;
      }

      const nextBalance =
        mode === "income"
          ? selectedAccount.current_balance + parsedAmount
          : selectedAccount.current_balance - parsedAmount;

      const { error: balanceError } = await supabase
        .from("accounts")
        .update({ current_balance: nextBalance })
        .eq("id", selectedAccount.id);

      if (balanceError) {
        await supabase.from("transactions").delete().eq("id", inserted.id);
        setStatus(t("errors.save"));
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setStatus(t("errors.save"));
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "income" ? t("titleIncome") : t("titleExpense");
  const submitLabel = mode === "income" ? t("submitIncome") : t("submitExpense");

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <button
        type="button"
        aria-label={t("close")}
        onClick={handleClose}
        className={cn(
          "absolute inset-0 bg-black/35 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px] rounded-t-[30px] border border-[var(--color-border)] bg-[var(--color-shell)] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 shadow-[var(--shadow-shell)] transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-[var(--color-text)]">
              {title}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {t("subtitle")}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("close")}
            onClick={handleClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="quick-transaction-account">{t("account")}</Label>
              <Select
                id="quick-transaction-account"
                value={form.accountId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, accountId: event.target.value }))
                }
                disabled={loadingOptions || submitting}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-transaction-category">{t("category")}</Label>
              <Select
                id="quick-transaction-category"
                value={form.categoryId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, categoryId: event.target.value }))
                }
                disabled={loadingOptions || submitting}
              >
                <option value="">{t("noCategory")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-transaction-name">{t("name")}</Label>
            <Input
              id="quick-transaction-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder={t("namePlaceholder")}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="quick-transaction-amount">{t("amount")}</Label>
              <Input
                id="quick-transaction-amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="0.00"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-transaction-date">{t("date")}</Label>
              <Input
                id="quick-transaction-date"
                type="date"
                value={form.transactionDate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    transactionDate: event.target.value,
                  }))
                }
                disabled={submitting}
              />
            </div>
          </div>

          {status && (
            <p className="rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {status}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting || loadingOptions || accounts.length === 0}
            >
              {submitting ? t("saving") : submitLabel}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
