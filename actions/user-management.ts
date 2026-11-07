"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  CustomRoleDefinition,
  DEFAULT_SYSTEM_ROLES,
  RolePrivileges,
  ALL_PRIVILEGES_KEYS,
} from "@/lib/role-privileges";

const CUSTOM_ROLES_SETTING_KEY = "custom_cms_roles_config";

/**
 * Get all available roles (System roles + Custom user-defined roles)
 */
export async function getCustomRoles(): Promise<CustomRoleDefinition[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: CUSTOM_ROLES_SETTING_KEY },
    });

    if (!setting || !setting.value || !Array.isArray(setting.value)) {
      return DEFAULT_SYSTEM_ROLES;
    }

    const customRoles = setting.value as unknown as CustomRoleDefinition[];
    // Ensure standard system roles always exist at the head
    const merged = [
      ...DEFAULT_SYSTEM_ROLES,
      ...customRoles.filter((r) => r.id !== "ADMIN" && r.id !== "EDITOR"),
    ];
    return merged;
  } catch (error) {
    console.error("Error loading custom roles:", error);
    return DEFAULT_SYSTEM_ROLES;
  }
}

/**
 * Create or update a custom role definition with granular privileges
 */
export async function saveCustomRole(roleData: {
  id?: string;
  name: string;
  description: string;
  privileges: RolePrivileges;
}) {
  await requireAdmin();

  const name = roleData.name?.trim();
  const description = roleData.description?.trim() || "";
  if (!name) throw new Error("Role name is required.");

  const currentRoles = await getCustomRoles();
  const customOnly = currentRoles.filter((r) => !r.isSystem);

  let updatedList: CustomRoleDefinition[] = [];

  if (roleData.id && roleData.id !== "ADMIN" && roleData.id !== "EDITOR") {
    // Update existing custom role
    updatedList = customOnly.map((r) => {
      if (r.id === roleData.id) {
        return {
          ...r,
          name,
          description,
          privileges: roleData.privileges,
        };
      }
      return r;
    });
  } else {
    // Create new custom role
    const newId = `ROLE_${name.toUpperCase().replace(/[^A-Z0-9_]/g, "_")}_${Date.now().toString(36)}`;
    const newRole: CustomRoleDefinition = {
      id: newId,
      name,
      description,
      isSystem: false,
      privileges: roleData.privileges,
      createdAt: new Date().toISOString(),
    };
    updatedList = [...customOnly, newRole];
  }

  await prisma.siteSetting.upsert({
    where: { key: CUSTOM_ROLES_SETTING_KEY },
    update: { value: updatedList as any },
    create: {
      key: CUSTOM_ROLES_SETTING_KEY,
      value: updatedList as any,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Delete a custom role
 */
export async function deleteCustomRole(roleId: string) {
  await requireAdmin();

  if (roleId === "ADMIN" || roleId === "EDITOR") {
    throw new Error("Cannot delete core system roles (ADMIN or EDITOR).");
  }

  // Check if any user currently has this role
  // Note: Since Prisma schema enum currently holds ADMIN | EDITOR, custom roles map to standard users or mapped metadata
  const currentRoles = await getCustomRoles();
  const filtered = currentRoles.filter((r) => !r.isSystem && r.id !== roleId);

  await prisma.siteSetting.upsert({
    where: { key: CUSTOM_ROLES_SETTING_KEY },
    update: { value: filtered as any },
    create: {
      key: CUSTOM_ROLES_SETTING_KEY,
      value: filtered as any,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Create Admin/Editor user account
 */
export async function createAdminUser(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "EDITOR";

  if (!email || !password) throw new Error("Email and password are required.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) throw new Error("An admin user with this email already exists.");

  const passwordHash = await bcrypt.hash(password, 12);

  // Map role: if role starts with ROLE_ or is a custom role name, fallback DB enum to EDITOR
  const dbRole = role === "ADMIN" ? "ADMIN" : "EDITOR";

  await prisma.adminUser.create({
    data: {
      name: name || null,
      email,
      passwordHash,
      role: dbRole as any,
      active: true,
    },
  });

  revalidatePath("/admin/users");
}

/**
 * Update Admin/Editor user account
 */
export async function updateAdminUser(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const role = (formData.get("role") as string) || "EDITOR";
  const active = formData.get("active") === "true";
  const newPassword = formData.get("newPassword") as string;

  if (!id || !email) throw new Error("User ID and email are required.");

  const dbRole = role === "ADMIN" ? "ADMIN" : "EDITOR";

  const updateData: any = {
    name: name || null,
    email,
    role: dbRole as any,
    active,
  };

  if (newPassword && newPassword.length >= 8) {
    updateData.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await prisma.adminUser.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/users");
}

/**
 * Delete an admin user account
 */
export async function deleteAdminUser(id: string) {
  const session = await requireAdmin();

  if (session.id === id) {
    throw new Error("You cannot delete your own account.");
  }

  const adminCount = await prisma.adminUser.count({ where: { role: "ADMIN", active: true } });
  const userToDelete = await prisma.adminUser.findUnique({ where: { id } });

  if (userToDelete?.role === "ADMIN" && adminCount <= 1) {
    throw new Error("Cannot delete the last active admin user.");
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/users");
}

/**
 * Toggle user active/inactive status
 */
export async function toggleUserActive(id: string, active: boolean) {
  const session = await requireAdmin();

  if (session.id === id && !active) {
    throw new Error("You cannot deactivate your own account.");
  }

  await prisma.adminUser.update({
    where: { id },
    data: { active },
  });

  revalidatePath("/admin/users");
}

const USER_2FA_SETTINGS_KEY = "user_2fa_security_registry";

export interface User2FASetting {
  userId: string;
  enabled: boolean;
  pinCode: string; // 6-digit numeric security PIN
  updatedAt: string;
}

/**
 * Get all 2FA security settings for users
 */
export async function getUser2FASettings(): Promise<Record<string, User2FASetting>> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: USER_2FA_SETTINGS_KEY },
    });
    if (setting?.value && typeof setting.value === "object" && !Array.isArray(setting.value)) {
      return setting.value as unknown as Record<string, User2FASetting>;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Configure 2FA (Two-Factor Authentication) for an admin/staff user
 */
export async function configureUser2FA(userId: string, enabled: boolean, pinCode?: string) {
  await requireAdmin();

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User account not found.");

  if (enabled && (!pinCode || pinCode.trim().length < 4 || pinCode.trim().length > 8)) {
    throw new Error("Security 2FA PIN must be between 4 and 8 digits.");
  }

  const currentMap = await getUser2FASettings();
  const updatedMap = {
    ...currentMap,
    [userId]: {
      userId,
      enabled,
      pinCode: enabled ? pinCode!.trim() : "",
      updatedAt: new Date().toISOString(),
    },
  };

  await prisma.siteSetting.upsert({
    where: { key: USER_2FA_SETTINGS_KEY },
    update: { value: updatedMap as any },
    create: { key: USER_2FA_SETTINGS_KEY, value: updatedMap as any },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

