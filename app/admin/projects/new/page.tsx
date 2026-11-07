import { ProjectForm } from "@/components/admin/project-form";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return <ProjectForm mode="create" />;
}
