import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

const COOKIE_NAME = "portfolio_admin_session";
const SECRET_KEY = process.env.AUTH_SECRET || "super-secret-jwt-portfolio-auth-key-change-in-production-12345";
const key = new TextEncoder().encode(SECRET_KEY);

export interface AdminSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Sign a new JWT session token (expires in 7 days)
 */
export async function signSessionToken(payload: AdminSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Verify and decode an existing JWT session token
 */
export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

/**
 * Retrieve the active admin session from cookies
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

/**
 * Authoritative guard for server actions and protected components
 * Throws an error if not authorized
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized: Administrator privileges required.");
  }
  return session;
}

/**
 * Authenticate admin with email and password, setting secure HttpOnly cookie
 */
export async function loginAdmin(
  email: string,
  password: string,
  twoFactorPin?: string
): Promise<{ success: boolean; error?: string; requiresTwoFactor?: boolean }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Anti-bruteforce Rate Limiting (Max 5 failed attempts per 15 mins per email/account)
    const rateCheck = checkRateLimit(`login:${normalizedEmail}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return {
        success: false,
        error: `Too many login attempts. Account access is temporarily locked for security. Please try again in ${Math.ceil(rateCheck.resetInSec / 60)} minutes.`,
      };
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin || !admin.active) {
      return { success: false, error: "Invalid credentials or account is inactive." };
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      return { success: false, error: "Invalid credentials or password mismatch." };
    }

    // 2. Check Two-Factor Authentication (2FA) status
    const twoFaSetting = await prisma.siteSetting.findUnique({
      where: { key: "user_2fa_security_registry" },
    });
    if (twoFaSetting?.value && typeof twoFaSetting.value === "object") {
      const user2Fa = (twoFaSetting.value as Record<string, any>)[admin.id];
      if (user2Fa?.enabled && user2Fa.pinCode) {
        if (!twoFactorPin) {
          return {
            success: false,
            requiresTwoFactor: true,
            error: "Two-Factor Authentication (2FA) is active. Please enter your 2FA Security PIN.",
          };
        }
        if (twoFactorPin.trim() !== user2Fa.pinCode.trim()) {
          return {
            success: false,
            requiresTwoFactor: true,
            error: "Invalid 2FA Security PIN. Authentication rejected.",
          };
        }
      }
    }

    const sessionPayload: AdminSession = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    const token = await signSessionToken(sessionPayload);

    cookies().set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "An authentication error occurred." };
  }
}

/**
 * Log out admin by clearing the session cookie
 */
export async function logoutAdmin(): Promise<void> {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
