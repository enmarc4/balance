import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema } from "@/lib/validators/auth";
import { createAccountSchema } from "@/lib/validators/accounts";
import { onboardingSchema } from "@/lib/validators/onboarding";
import {
  QUICK_TRANSACTION_LIMITS,
  quickTransactionSchema,
} from "@/lib/validators/transactions";

function toDateInputValue(date: Date) {
  const localOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - localOffsetMs).toISOString().slice(0, 10);
}

describe("auth validators", () => {
  it("rejects invalid login email", () => {
    const result = signInSchema.safeParse({
      email: "bad-email",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = signUpSchema.safeParse({
      email: "test@example.com",
      password: "12345678",
      confirmPassword: "abcdefgh",
    });
    expect(result.success).toBe(false);
  });
});

describe("onboarding and account validators", () => {
  it("accepts onboarding payload", () => {
    const result = onboardingSchema.safeParse({
      fullName: "Marc",
      preferredCurrency: "EUR",
      firstAccountName: "Main account",
      firstAccountType: "checking",
      firstAccountCurrency: "EUR",
      firstAccountBalance: 200,
    });

    expect(result.success).toBe(true);
  });

  it("rejects short account name", () => {
    const result = createAccountSchema.safeParse({
      name: "A",
      type: "cash",
      currency: "EUR",
      currentBalance: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("quick transaction validator", () => {
  it("accepts a valid quick transaction payload", () => {
    const result = quickTransactionSchema.safeParse({
      accountId: "f8e803f7-b721-4eea-bf59-24b6b13a1250",
      categoryId: "b8effaf4-884f-4f4a-b4f6-77de1d48db53",
      name: "Groceries",
      notes: "Weekly supermarket run",
      amount: "89.35",
      transactionDate: toDateInputValue(new Date()),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(89.35);
    }
  });

  it("rejects future dates", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = quickTransactionSchema.safeParse({
      accountId: "f8e803f7-b721-4eea-bf59-24b6b13a1250",
      categoryId: "",
      name: "Salary",
      notes: "",
      amount: "1200",
      transactionDate: toDateInputValue(tomorrow),
    });

    expect(result.success).toBe(false);
  });

  it("rejects notes over maximum length", () => {
    const result = quickTransactionSchema.safeParse({
      accountId: "f8e803f7-b721-4eea-bf59-24b6b13a1250",
      categoryId: "",
      name: "Fuel",
      notes: "a".repeat(QUICK_TRANSACTION_LIMITS.notesMax + 1),
      amount: "55.2",
      transactionDate: toDateInputValue(new Date()),
    });

    expect(result.success).toBe(false);
  });
});
