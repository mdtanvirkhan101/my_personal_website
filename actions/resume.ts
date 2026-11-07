"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateResumeSettings(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const headline = (formData.get("headline") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();
  const resumeUrl = (formData.get("resumeUrl") as string)?.trim();
  const photoUrl = (formData.get("photoUrl") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const linkedin = (formData.get("linkedin") as string)?.trim();

  // Custom CV JSON sections
  const skillsJson = (formData.get("skillsJson") as string)?.trim();
  const trainingJson = (formData.get("trainingJson") as string)?.trim();
  const educationJson = (formData.get("educationJson") as string)?.trim();
  const referencesJson = (formData.get("referencesJson") as string)?.trim();

  // 1. Update Profile
  await prisma.profile.upsert({
    where: { id: "default-owner-profile" },
    update: {
      name: name || "MD TANVIR KHAN",
      headline: headline || null,
      bio: bio || null,
      resumeUrl: resumeUrl || null,
      avatarUrl: photoUrl || null,
      email: email || null,
      location: location || null,
      socialLinks: {
        phone: phone || null,
        linkedin: linkedin || null,
      },
    },
    create: {
      id: "default-owner-profile",
      name: name || "MD TANVIR KHAN",
      headline: headline || null,
      bio: bio || null,
      resumeUrl: resumeUrl || null,
      avatarUrl: photoUrl || null,
      email: email || null,
      location: location || null,
      socialLinks: {
        phone: phone || null,
        linkedin: linkedin || null,
      },
    },
  });

  // 2. Save siteSettings keys
  const settingsToSave: Record<string, any> = {
    resume_pdf_url: resumeUrl || "/uploads/1793964968919-CV_of_MD_Tanvir_Khan.pdf",
    resume_photo_url: photoUrl || "/uploads/cv_photo_extracted.jpg",
    contact_phone: phone || "+8801601501775",
    resume_location: location || "Kuril, Bhatara, Dhaka-1229, Bangladesh",
    resume_linkedin: linkedin || "https://linkedin.com/in/mdtanvirkhan101/",
  };

  if (skillsJson) {
    try {
      settingsToSave.resume_skills_custom = JSON.parse(skillsJson);
    } catch (e) {
      // ignore invalid json or save as string
    }
  }

  if (trainingJson) {
    try {
      settingsToSave.resume_training_custom = JSON.parse(trainingJson);
    } catch (e) {}
  }

  if (educationJson) {
    try {
      settingsToSave.resume_education_custom = JSON.parse(educationJson);
    } catch (e) {}
  }

  if (referencesJson) {
    try {
      settingsToSave.resume_references_custom = JSON.parse(referencesJson);
    } catch (e) {}
  }

  for (const [key, value] of Object.entries(settingsToSave)) {
    if (value !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }

  revalidatePath("/admin/resume");
  revalidatePath("/admin/profile");
  revalidatePath("/resume");
  revalidatePath("/about");
  revalidatePath("/");
}
