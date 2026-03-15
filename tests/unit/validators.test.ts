import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema } from "@/lib/validators/auth";
import { createAccountSchema } from "@/lib/validators/accounts";
import { onboardingSchema } from "@/lib/validators/onboarding";

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
