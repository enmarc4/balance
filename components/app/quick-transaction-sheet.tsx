"use client";

import { Search, X } from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import {
  QUICK_TRANSACTION_LIMITS,
  quickTransactionSchema,
} from "@/lib/validators/transactions";
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
  icon: string | null;
};

type FormState = {
  accountId: string;
  categoryId: string;
  name: string;
  notes: string;
  amount: string;
  transactionDate: string;
};

type FormField = keyof FormState;
type FormErrors = Partial<Record<FormField, string>>;

const INITIAL_FORM_STATE: FormState = {
  accountId: "",
  categoryId: "",
  name: "",
  notes: "",
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
  const [categoryQuery, setCategoryQuery] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const validationMessages = useMemo(
    () => ({
      invalidAccount: t("errors.validation.invalidAccount"),
      invalidAccountSelection: t("errors.validation.invalidAccountSelection"),
      invalidCategory: t("errors.validation.invalidCategory"),
      invalidCategorySelection: t("errors.validation.invalidCategorySelection"),
      nameMin: t("errors.validation.nameMin"),
      nameMax: t("errors.validation.nameMax"),
      amountRequired: t("errors.validation.amountRequired"),
      amountFormat: t("errors.validation.amountFormat"),
      amountPositive: t("errors.validation.amountPositive"),
      dateRequired: t("errors.validation.dateRequired"),
      dateInvalid: t("errors.validation.dateInvalid"),
      dateFuture: t("errors.validation.dateFuture"),
      notesMax: t("errors.validation.notesMax"),
    }),
    [t],
  );

  const filteredCategories = useMemo(() => {
    const normalizedQuery = categoryQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery),
    );
  }, [categories, categoryQuery]);

  const clearFieldError = useCallback((field: FormField) => {
    setFieldErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const nextErrors = { ...previous };
      delete nextErrors[field];
      return nextErrors;
    });
  }, []);

  const setFormValue = useCallback(
    (field: FormField, value: string) => {
      setForm((previous) => ({ ...previous, [field]: value }));
      clearFieldError(field);
    },
    [clearFieldError],
  );

  const getFieldMessage = useCallback(
    (messageKey: string) =>
      validationMessages[messageKey as keyof typeof validationMessages] ??
      t("errors.invalidForm"),
    [t, validationMessages],
  );

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
    setCategoryQuery("");
    setFieldErrors({});
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

        const [
          { data: accountRows, error: accountsError },
          { data: categoryRows, error: categoriesError },
        ] = await Promise.all([
          supabase
            .from("accounts")
            .select("id,name,currency,current_balance")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("created_at", { ascending: false }),
          supabase
            .from("categories")
            .select("id,name,kind,icon")
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
          icon: (category.icon as string | null) ?? null,
        }));

        setAccounts(nextAccounts);
        setCategories(nextCategories);
        setForm({
          accountId: nextAccounts[0]?.id ?? "",
          categoryId: nextCategories[0]?.id ?? "",
          name: "",
          notes: "",
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

    const parsedForm = quickTransactionSchema.safeParse(form);

    if (!parsedForm.success) {
      const nextErrors: FormErrors = {};

      for (const issue of parsedForm.error.issues) {
        const field = issue.path[0];
        if (typeof field !== "string") {
          continue;
        }

        if (!Object.prototype.hasOwnProperty.call(form, field)) {
          continue;
        }

        const typedField = field as FormField;
        if (nextErrors[typedField]) {
          continue;
        }

        nextErrors[typedField] = getFieldMessage(issue.message);
      }

      setFieldErrors(nextErrors);
      setStatus(t("errors.invalidForm"));
      return;
    }

    const selectedAccount = accounts.find(
      (account) => account.id === parsedForm.data.accountId,
    );

    if (!selectedAccount) {
      setFieldErrors((previous) => ({
        ...previous,
        accountId: getFieldMessage("invalidAccountSelection"),
      }));
      setStatus(t("errors.invalidForm"));
      return;
    }

    const hasCategorySelection = parsedForm.data.categoryId.length > 0;
    const selectedCategoryId = hasCategorySelection
      ? parsedForm.data.categoryId
      : null;

    if (
      selectedCategoryId &&
      !categories.some((category) => category.id === selectedCategoryId)
    ) {
      setFieldErrors((previous) => ({
        ...previous,
        categoryId: getFieldMessage("invalidCategorySelection"),
      }));
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

      const { data: inserted, error: insertError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          account_id: selectedAccount.id,
          category_id: selectedCategoryId,
          type: mode,
          name: parsedForm.data.name,
          notes: parsedForm.data.notes || null,
          amount: parsedForm.data.amount,
          currency: selectedAccount.currency,
          transaction_date: parsedForm.data.transactionDate,
        })
        .select("id")
        .single();

      if (insertError || !inserted?.id) {
        setStatus(t("errors.save"));
        return;
      }

      const nextBalance =
        mode === "income"
          ? selectedAccount.current_balance + parsedForm.data.amount
          : selectedAccount.current_balance - parsedForm.data.amount;

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
          <div className="space-y-2">
            <Label htmlFor="quick-transaction-account">{t("account")}</Label>
            <Select
              id="quick-transaction-account"
              value={form.accountId}
              onChange={(event) => setFormValue("accountId", event.target.value)}
              disabled={loadingOptions || submitting}
              className={cn(
                fieldErrors.accountId &&
                  "border-red-300 bg-red-50/70 focus-visible:ring-red-300",
              )}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
            {fieldErrors.accountId && (
              <p className="text-xs font-medium text-red-700">
                {fieldErrors.accountId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="quick-transaction-category-search">
                {t("category")}
              </Label>
              <span className="text-xs text-[var(--color-text-muted)]">
                {t("optional")}
              </span>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <Input
                id="quick-transaction-category-search"
                value={categoryQuery}
                onChange={(event) => setCategoryQuery(event.target.value)}
                placeholder={t("categorySearchPlaceholder")}
                disabled={loadingOptions || submitting}
                className="pl-9"
              />
            </div>

            <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
              <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setFormValue("categoryId", "")}
                  disabled={submitting}
                  className={cn(
                    "col-span-2 inline-flex h-10 items-center justify-center rounded-[var(--radius-pill)] border px-3 text-sm font-semibold transition-colors",
                    form.categoryId.length === 0
                      ? "border-[var(--color-action-hover)] bg-[var(--color-accent)] text-[var(--color-accent-text)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface)]",
                  )}
                >
                  {t("noCategory")}
                </button>

                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setFormValue("categoryId", category.id)}
                    disabled={submitting}
                    className={cn(
                      "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-pill)] border px-3 text-sm font-semibold transition-colors",
                      form.categoryId === category.id
                        ? "border-[var(--color-action-hover)] bg-[var(--color-accent)] text-[var(--color-accent-text)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface)]",
                    )}
                  >
                    {category.icon && (
                      <span aria-hidden className="text-sm leading-none">
                        {category.icon}
                      </span>
                    )}
                    <span className="truncate">{category.name}</span>
                  </button>
                ))}

                {categories.length > 0 && filteredCategories.length === 0 && (
                  <p className="col-span-2 rounded-[var(--radius-pill)] border border-dashed border-[var(--color-border)] px-3 py-2 text-center text-xs text-[var(--color-text-muted)]">
                    {t("categoryNoMatches")}
                  </p>
                )}

                {categories.length === 0 && (
                  <p className="col-span-2 rounded-[var(--radius-pill)] border border-dashed border-[var(--color-border)] px-3 py-2 text-center text-xs text-[var(--color-text-muted)]">
                    {t("categoryEmpty")}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              {t("categoryHelper")}
            </p>
            {fieldErrors.categoryId && (
              <p className="text-xs font-medium text-red-700">
                {fieldErrors.categoryId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-transaction-name">{t("name")}</Label>
            <Input
              id="quick-transaction-name"
              value={form.name}
              onChange={(event) => setFormValue("name", event.target.value)}
              placeholder={t("namePlaceholder")}
              disabled={submitting}
              className={cn(
                fieldErrors.name &&
                  "border-red-300 bg-red-50/70 focus-visible:ring-red-300",
              )}
            />
            {fieldErrors.name && (
              <p className="text-xs font-medium text-red-700">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="quick-transaction-notes">{t("notes")}</Label>
              <span className="text-xs text-[var(--color-text-muted)]">
                {t("optional")}
              </span>
            </div>
            <textarea
              id="quick-transaction-notes"
              value={form.notes}
              onChange={(event) => setFormValue("notes", event.target.value)}
              placeholder={t("notesPlaceholder")}
              maxLength={QUICK_TRANSACTION_LIMITS.notesMax}
              disabled={submitting}
              className={cn(
                "min-h-[84px] w-full resize-none rounded-[20px] border border-transparent bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action)]",
                fieldErrors.notes &&
                  "border-red-300 bg-red-50/70 focus-visible:ring-red-300",
              )}
            />
            <p className="text-xs text-[var(--color-text-muted)]">
              {t("notesCount", {
                count: String(form.notes.length),
                max: String(QUICK_TRANSACTION_LIMITS.notesMax),
              })}
            </p>
            {fieldErrors.notes && (
              <p className="text-xs font-medium text-red-700">
                {fieldErrors.notes}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="quick-transaction-amount">{t("amount")}</Label>
              <Input
                id="quick-transaction-amount"
                inputMode="decimal"
                value={form.amount}
                onChange={(event) => setFormValue("amount", event.target.value)}
                placeholder="0.00"
                disabled={submitting}
                className={cn(
                  fieldErrors.amount &&
                    "border-red-300 bg-red-50/70 focus-visible:ring-red-300",
                )}
              />
              {fieldErrors.amount && (
                <p className="text-xs font-medium text-red-700">
                  {fieldErrors.amount}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-transaction-date">{t("date")}</Label>
              <Input
                id="quick-transaction-date"
                type="date"
                value={form.transactionDate}
                max={getTodayDateValue()}
                onChange={(event) =>
                  setFormValue("transactionDate", event.target.value)
                }
                disabled={submitting}
                className={cn(
                  fieldErrors.transactionDate &&
                    "border-red-300 bg-red-50/70 focus-visible:ring-red-300",
                )}
              />
              {fieldErrors.transactionDate && (
                <p className="text-xs font-medium text-red-700">
                  {fieldErrors.transactionDate}
                </p>
              )}
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
