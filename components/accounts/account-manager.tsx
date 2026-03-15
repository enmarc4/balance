"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine, Wallet } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CURRENCIES } from "@/lib/currencies";
import { formatMoney } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  createAccountSchema,
  type CreateAccountInput,
} from "@/lib/validators/accounts";
import type { AccountItem, Locale } from "@/types/domain";

const ACCOUNT_TYPES = [
  "cash",
  "checking",
  "savings",
  "investment",
  "credit",
  "wallet",
] as const;

export function AccountManager({
  locale,
  initialAccounts,
}: {
  locale: Locale;
  initialAccounts: AccountItem[];
}) {
  const t = useTranslations();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const createForm = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: "",
      type: "checking",
      currency: "EUR",
      currentBalance: 0,
    },
  });

  const updateForm = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: "",
      type: "checking",
      currency: "EUR",
      currentBalance: 0,
    },
  });

  const createAccount = (values: CreateAccountInput) => {
    setStatus(null);

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setStatus(t("accounts.createError"));
          return;
        }

        const { data, error } = await supabase
          .from("accounts")
          .insert({
            user_id: user.id,
            name: values.name,
            type: values.type,
            currency: values.currency,
            current_balance: values.currentBalance,
            status: "active",
          })
          .select(
            "id,user_id,name,type,currency,current_balance,status,created_at,updated_at",
          )
          .single();

        if (error || !data) {
          setStatus(t("accounts.createError"));
          return;
        }

        setAccounts((previous) => [data as AccountItem, ...previous]);
        createForm.reset({
          name: "",
          type: values.type,
          currency: values.currency,
          currentBalance: 0,
        });
      } catch {
        setStatus(t("accounts.createError"));
      }
    });
  };

  const beginEdit = (account: AccountItem) => {
    setEditingId(account.id);
    updateForm.reset({
      name: account.name,
      type: account.type,
      currency: account.currency,
      currentBalance: account.current_balance,
    });
  };

  const saveEdit = (values: CreateAccountInput) => {
    if (!editingId) {
      return;
    }

    setStatus(null);

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("accounts")
          .update({
            name: values.name,
            type: values.type,
            currency: values.currency,
            current_balance: values.currentBalance,
          })
          .eq("id", editingId)
          .select(
            "id,user_id,name,type,currency,current_balance,status,created_at,updated_at",
          )
          .single();

        if (error || !data) {
          setStatus(t("accounts.updateError"));
          return;
        }

        setAccounts((previous) =>
          previous.map((item) =>
            item.id === editingId ? (data as AccountItem) : item,
          ),
        );
        setEditingId(null);
      } catch {
        setStatus(t("accounts.updateError"));
      }
    });
  };

  const archiveAccount = (accountId: string) => {
    updateAccountStatus(accountId, "archived", "accounts.archiveError");
  };

  const unarchiveAccount = (accountId: string) => {
    updateAccountStatus(accountId, "active", "accounts.unarchiveError");
  };

  const updateAccountStatus = (
    accountId: string,
    nextStatus: AccountItem["status"],
    errorKey: "accounts.archiveError" | "accounts.unarchiveError",
  ) => {
    setStatus(null);

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("accounts")
          .update({ status: nextStatus })
          .eq("id", accountId)
          .select(
            "id,user_id,name,type,currency,current_balance,status,created_at,updated_at",
          )
          .single();

        if (error || !data) {
          setStatus(t(errorKey));
          return;
        }

        setAccounts((previous) =>
          previous.map((item) =>
            item.id === accountId ? (data as AccountItem) : item,
          ),
        );
      } catch {
        setStatus(t(errorKey));
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          {t("accounts.createTitle")}
        </h2>
        <form
          className="mt-4 space-y-3"
          onSubmit={createForm.handleSubmit(createAccount)}
        >
          <div className="space-y-2">
            <Label htmlFor="create-name">{t("accounts.name")}</Label>
            <Input id="create-name" {...createForm.register("name")} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="create-type">{t("accounts.type")}</Label>
              <Select id="create-type" {...createForm.register("type")}>
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`accountType.${type}`)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-currency">{t("accounts.currency")}</Label>
              <Select id="create-currency" {...createForm.register("currency")}>
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-balance">{t("accounts.balance")}</Label>
            <Input
              id="create-balance"
              type="number"
              step="0.01"
              {...createForm.register("currentBalance", {
                valueAsNumber: true,
              })}
            />
          </div>

          <Button type="submit" className="w-full">
            {t("accounts.create")}
          </Button>
        </form>
      </Card>

      {status && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {status}
        </p>
      )}

      {accounts.length === 0 && (
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("accounts.empty")}
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {accounts.map((account) => {
          const isEditing = editingId === account.id;

          return (
            <Card key={account.id} className="bg-[var(--color-card)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-surface)]">
                    <Wallet className="h-4 w-4 text-[var(--color-text)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-text)]">
                      {account.name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {formatMoney(
                        account.current_balance,
                        locale,
                        account.currency,
                      )}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={account.status === "active" ? "active" : "archived"}
                >
                  {account.status === "active"
                    ? t("common.active")
                    : t("common.archived")}
                </Badge>
              </div>

              {isEditing ? (
                <form
                  className="mt-4 space-y-3"
                  onSubmit={updateForm.handleSubmit(saveEdit)}
                >
                  <div className="space-y-2">
                    <Label htmlFor={`edit-name-${account.id}`}>
                      {t("accounts.name")}
                    </Label>
                    <Input
                      id={`edit-name-${account.id}`}
                      {...updateForm.register("name")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-type-${account.id}`}>
                        {t("accounts.type")}
                      </Label>
                      <Select
                        id={`edit-type-${account.id}`}
                        {...updateForm.register("type")}
                      >
                        {ACCOUNT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {t(`accountType.${type}`)}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-currency-${account.id}`}>
                        {t("accounts.currency")}
                      </Label>
                      <Select
                        id={`edit-currency-${account.id}`}
                        {...updateForm.register("currency")}
                      >
                        {CURRENCIES.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`edit-balance-${account.id}`}>
                      {t("accounts.balance")}
                    </Label>
                    <Input
                      id={`edit-balance-${account.id}`}
                      type="number"
                      step="0.01"
                      {...updateForm.register("currentBalance", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {t("accounts.update")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setEditingId(null)}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => beginEdit(account)}
                  >
                    <PencilLine className="mr-1 h-4 w-4" />
                    {t("common.edit")}
                  </Button>
                  {account.status === "active" && (
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => archiveAccount(account.id)}
                    >
                      {t("common.archive")}
                    </Button>
                  )}
                  {account.status === "archived" && (
                    <Button
                      className="flex-1"
                      onClick={() => unarchiveAccount(account.id)}
                    >
                      {t("common.unarchive")}
                    </Button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
