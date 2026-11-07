import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { ResumeManager } from "@/components/admin/resume-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume & CV Console | Admin CMS",
  description: "Configure downloadable CV PDF, candidate ATS profile, photo, education, training, references and contact metadata.",
};

export default async function AdminResumePage() {
  await getAdminSession();

  const [profile, settings, experiences, certifications] = await Promise.all([
    prisma.profile.findFirst({
      where: { id: "default-owner-profile" },
    }),
    prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "resume_pdf_url",
            "resume_photo_url",
            "contact_phone",
            "resume_location",
            "resume_linkedin",
            "resume_skills_custom",
            "resume_training_custom",
            "resume_education_custom",
            "resume_references_custom",
          ],
        },
      },
    }),
    prisma.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }] }),
    prisma.certification.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  return (
    <ResumeManager
      initialProfile={profile as any}
      initialSettings={settingsMap}
      experiences={experiences}
      certifications={certifications}
    />
  );
}
