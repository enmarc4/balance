import { z } from "zod";

export const QUICK_TRANSACTION_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  notesMax: 280,
} as const;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getTodayDateValue() {
  const now = new Date();
  const localOffsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - localOffsetMs).toISOString().slice(0, 10);
}

function isValidIsoDate(dateValue: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return false;
  }

  const parsed = new Date(`${dateValue}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.toISOString().slice(0, 10) === dateValue;
}

const amountSchema = z
  .string()
  .trim()
  .min(1, "amountRequired")
  .refine((value) => /^\d+(?:[.,]\d{1,2})?$/.test(value), "amountFormat")
  .transform((value) => Number(value.replace(",", ".")))
  .refine((value) => Number.isFinite(value) && value > 0, "amountPositive");

const dateSchema = z
  .string()
  .min(1, "dateRequired")
  .refine((value) => isValidIsoDate(value), "dateInvalid")
  .refine((value) => value <= getTodayDateValue(), "dateFuture");

export const quickTransactionSchema = z.object({
  accountId: z
    .string()
    .trim()
    .refine((value) => UUID_REGEX.test(value), "invalidAccount"),
  categoryId: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || UUID_REGEX.test(value),
      "invalidCategory",
    ),
  name: z
    .string()
    .trim()
    .min(QUICK_TRANSACTION_LIMITS.nameMin, "nameMin")
    .max(QUICK_TRANSACTION_LIMITS.nameMax, "nameMax"),
  notes: z
    .string()
    .trim()
    .max(QUICK_TRANSACTION_LIMITS.notesMax, "notesMax")
    .optional(),
  amount: amountSchema,
  transactionDate: dateSchema,
});

export type QuickTransactionInput = z.output<typeof quickTransactionSchema>;
