import type { AppLocale } from "@/i18n/locales";

export type Locale = AppLocale;

export type CurrencyCode =
  | "EUR"
  | "USD"
  | "GBP"
  | "CHF"
  | "JPY"
  | "CAD"
  | "AUD"
  | "MXN";

export type AccountType =
  | "cash"
  | "checking"
  | "savings"
  | "investment"
  | "credit"
  | "wallet";

export type AccountStatus = "active" | "archived";

export type TransactionType = "income" | "expense";

export type MoneyAmount = number;

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  preferredCurrency: CurrencyCode;
  onboardingCompletedAt: string | null;
}

export interface AccountItem {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  current_balance: MoneyAmount;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
}
