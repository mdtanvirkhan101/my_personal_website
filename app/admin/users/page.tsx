import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { UsersManager } from "@/components/admin/users-manager";
import { getCustomRoles, getUser2FASettings } from "@/actions/user-management";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getAdminSession();

  // Only ADMIN role can access user management
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }

  const [users, roles, twoFaRegistry] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    }),
    getCustomRoles(),
    getUser2FASettings(),
  ]);

  return (
    <UsersManager
      users={users}
      roles={roles}
      twoFaRegistry={twoFaRegistry}
      currentUserId={session.id}
    />
  );
}
