import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("invalidEmail"),
  password: z.string().min(8, "passwordMin"),
});

export const signUpSchema = z
  .object({
    email: z.string().email("invalidEmail"),
    password: z.string().min(8, "passwordMin"),
    confirmPassword: z.string().min(8, "passwordMin"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("invalidEmail"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
