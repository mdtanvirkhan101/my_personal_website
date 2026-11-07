import { z } from "zod";

export const projectAttachmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Attachment name is required"),
  url: z.string().min(1, "File URL or Link is required"),
  size: z.number().optional().nullable(),
  sizeText: z.string().optional().nullable(),
  type: z.string().optional().nullable(), // "pdf" | "image" | "document" | "archive" | "link"
  isExternalLink: z.boolean().default(false),
  addedAt: z.string().optional(),
});

export type ProjectAttachment = z.infer<typeof projectAttachmentSchema>;

export const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(120, "Title is too long"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(120, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens (e.g., my-awesome-project)"),
  summary: z.string().min(10, "Summary must be at least 10 characters").max(300, "Summary cannot exceed 300 characters"),
  content: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable().or(z.literal("")),
  stack: z.array(z.string()).default([]),
  liveUrl: z.string().optional().nullable().or(z.literal("")),
  repoUrl: z.string().optional().nullable().or(z.literal("")),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  attachments: z.array(projectAttachmentSchema).optional().nullable(),

  // Optional attached case study
  caseStudy: z
    .object({
      problem: z.string().min(10, "Problem statement must be at least 10 characters"),
      process: z.string().optional().nullable(),
      solution: z.string().min(10, "Solution must be at least 10 characters"),
      outcome: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
