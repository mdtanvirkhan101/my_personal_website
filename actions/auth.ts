"use server";

import { loginAdmin, logoutAdmin } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export interface AuthState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
  requiresTwoFactor?: boolean;
}

export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const twoFactorPin = (formData.get("twoFactorPin") as string) || undefined;

  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      error: "Validation failed",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const result = await loginAdmin(validation.data.email, validation.data.password, twoFactorPin);
  if (!result.success) {
    return {
      error: result.error || "Login failed",
      requiresTwoFactor: result.requiresTwoFactor,
    };
  }

  redirect("/admin/dashboard");
}

export async function logoutAction(): Promise<void> {
  await logoutAdmin();
  redirect("/admin/login");
}
