"use server";

import { PublishStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type TaxonomyItem = { id: string; label: string };
type JsonRecord = Prisma.InputJsonObject;

const CATEGORY_SETTINGS_KEY = "project_categories";
const TYPE_SETTINGS_KEY = "project_types";
const ENVIRONMENT_SETTINGS_KEY = "project_environments";

const DEFAULT_CATEGORIES: TaxonomyItem[] = [
    { id: "network-infra", label: "Network Infrastructure" },
    { id: "systems-virtualization", label: "Systems & Virtualization" },
    { id: "telephony-voip", label: "VoIP & Telephony" },
    { id: "network-security", label: "Perimeter Defense & Security" },
    { id: "soc-hardening", label: "SOC Telemetry & Hardening" },
    { id: "devops-automation", label: "DevOps & Infrastructure as Code" },
];

const DEFAULT_PROJECT_TYPES: TaxonomyItem[] = [
    { id: "LAB", label: "Lab" },
    { id: "PERSONAL", label: "Personal" },
    { id: "CLIENT", label: "Client" },
    { id: "PRODUCTION", label: "Production" },
];

const DEFAULT_PROJECT_ENVIRONMENTS: TaxonomyItem[] = [
    { id: "PHYSICAL", label: "Physical" },
    { id: "VIRTUAL", label: "Virtual" },
    { id: "CLOUD", label: "Cloud" },
    { id: "HYBRID", label: "Hybrid" },
];

function normalizeId(value: string, uppercase = false) {
    const normalized = value
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
    return uppercase ? normalized.replace(/-/g, "_").toUpperCase() : normalized;
}

function parseTaxonomy(value: unknown, fallback: TaxonomyItem[]): TaxonomyItem[] {
    if (!Array.isArray(value)) return fallback;
    const valid = value.filter(
        (item): item is TaxonomyItem =>
            !!item &&
            typeof item === "object" &&
            typeof (item as TaxonomyItem).id === "string" &&
            typeof (item as TaxonomyItem).label === "string"
    );
    return valid.length ? valid : fallback;
}

async function readTaxonomy(key: string, fallback: TaxonomyItem[]) {
    const setting = await prisma.siteSetting.findUnique({
        where: { key },
        select: { value: true },
    });
    return setting ? parseTaxonomy(setting.value, fallback) : fallback;
}

async function writeTaxonomy(key: string, items: TaxonomyItem[]) {
    await prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: items },
        update: { value: items },
    });
    revalidateProjectPaths();
}

function revalidateProjectPaths(slug?: string) {
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/case-studies");
    revalidatePath("/admin/projects");
    if (slug) revalidatePath(`/projects/${slug}`);
}

async function saveTaxonomyItem(options: {
    key: string;
    fallback: TaxonomyItem[];
    input: { id?: string; label: string };
    uppercaseId?: boolean;
    noun: string;
}) {
    await requireAdmin();
    const label = options.input.label?.trim();
    if (!label) return { success: false as const, error: `${options.noun} name is required.` };
    if (label.length > 80) return { success: false as const, error: `${options.noun} name must be 80 characters or fewer.` };

    const items = await readTaxonomy(options.key, options.fallback);
    if (options.input.id) {
        // Keep IDs stable when editing labels so assigned projects do not break.
        const index = items.findIndex((item) => item.id === options.input.id);
        if (index < 0) return { success: false as const, error: `${options.noun} was not found.` };
        if (items.some((item, i) => i !== index && item.label.toLowerCase() === label.toLowerCase())) {
            return { success: false as const, error: `A ${options.noun.toLowerCase()} with this name already exists.` };
        }
        items[index] = { ...items[index], label };
    } else {
        const id = normalizeId(label, options.uppercaseId);
        if (!id) return { success: false as const, error: `Please enter a valid ${options.noun.toLowerCase()} name.` };
        if (items.some((item) => item.id === id || item.label.toLowerCase() === label.toLowerCase())) {
            return { success: false as const, error: `This ${options.noun.toLowerCase()} already exists.` };
        }
        items.push({ id, label });
    }

    await writeTaxonomy(options.key, items);
    return { success: true as const, items };
}

async function deleteTaxonomyItem(options: {
    key: string;
    fallback: TaxonomyItem[];
    id: string;
    attachmentField: "category" | "projectType" | "projectEnvironment";
    noun: string;
}) {
    await requireAdmin();
    const id = options.id?.trim();
    if (!id) return { success: false as const, error: `Invalid ${options.noun.toLowerCase()}.` };

    const projects = await prisma.project.findMany({ select: { attachments: true } });
    const assigned = projects.some((project) => {
        const attachments = project.attachments;
        return !!attachments && typeof attachments === "object" && !Array.isArray(attachments) &&
            (attachments as JsonRecord)[options.attachmentField] === id;
    });
    if (assigned) {
        return {
            success: false as const,
            error: `This ${options.noun.toLowerCase()} is assigned to one or more projects. Reassign those projects before deleting it.`,
        };
    }

    const items = await readTaxonomy(options.key, options.fallback);
    const next = items.filter((item) => item.id !== id);
    if (next.length === items.length) return { success: false as const, error: `${options.noun} was not found.` };
    if (!next.length) return { success: false as const, error: `At least one ${options.noun.toLowerCase()} must remain.` };

    await writeTaxonomy(options.key, next);
    return { success: true as const, items: next };
}

// -------------------- Category CRUD --------------------
export async function getProjectCategoriesAction() {
    try {
        await requireAdmin();
        return { success: true as const, categories: await readTaxonomy(CATEGORY_SETTINGS_KEY, DEFAULT_CATEGORIES) };
    } catch (error) {
        return { success: false as const, categories: DEFAULT_CATEGORIES, error: error instanceof Error ? error.message : "Could not load categories." };
    }
}

export async function saveProjectCategoryAction(input: { id?: string; label: string }) {
    try {
        const result = await saveTaxonomyItem({ key: CATEGORY_SETTINGS_KEY, fallback: DEFAULT_CATEGORIES, input, noun: "Category" });
        return result.success ? { success: true as const, categories: result.items } : result;
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : "Could not save category." };
    }
}

export async function deleteProjectCategoryAction(id: string) {
    try {
        const result = await deleteTaxonomyItem({ key: CATEGORY_SETTINGS_KEY, fallback: DEFAULT_CATEGORIES, id, attachmentField: "category", noun: "Category" });
        return result.success ? { success: true as const, categories: result.items } : result;
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : "Could not delete category." };
    }
}

// -------------------- Project Type CRUD --------------------
export async function getProjectTypesAction() {
    try {
        await requireAdmin();
        return { success: true as const, projectTypes: await readTaxonomy(TYPE_SETTINGS_KEY, DEFAULT_PROJECT_TYPES) };
    } catch (error) {
        return { success: false as const, projectTypes: DEFAULT_PROJECT_TYPES, error: error instanceof Error ? error.message : "Could not load project types." };
    }
}

export async function saveProjectTypeAction(input: { id?: string; label: string }) {
    try {
        const result = await saveTaxonomyItem({ key: TYPE_SETTINGS_KEY, fallback: DEFAULT_PROJECT_TYPES, input, uppercaseId: true, noun: "Project type" });
        return result.success ? { success: true as const, projectTypes: result.items } : result;
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : "Could not save project type." };
    }
}

export async function deleteProjectTypeAction(id: string) {
    try {
        const result = await deleteTaxonomyItem({ key: TYPE_SETTINGS_KEY, fallback: DEFAULT_PROJECT_TYPES, id, attachmentField: "projectType", noun: "Project type" });
        return result.success ? { success: true as const, projectTypes: result.items } : result;
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : "Could not delete project type." };
    }
}

// -------------------- Project Environment CRUD --------------------
export async function getProjectEnvironmentsAction() {
    try {
        await requireAdmin();
        return { success: true as const, projectEnvironments: await readTaxonomy(ENVIRONMENT_SETTINGS_KEY, DEFAULT_PROJECT_ENVIRONMENTS) };
    } catch (error) {
        return { success: false as const, projectEnvironments: DEFAULT_PROJECT_ENVIRONMENTS, error: error instanceof Error ? error.message : "Could not load project environments." };
    }
}

export async function saveProjectEnvironmentAction(input: { id?: string; label: string }) {
    try {
        const result = await saveTaxonomyItem({ key: ENVIRONMENT_SETTINGS_KEY, fallback: DEFAULT_PROJECT_ENVIRONMENTS, input, uppercaseId: true, noun: "Project environment" });
        return result.success ? { success: true as const, projectEnvironments: result.items } : result;
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : "Could not save project environment." };
    }
}

export async function deleteProjectEnvironmentAction(id: string) {
    try {
        const result = await deleteTaxonomyItem({ key: ENVIRONMENT_SETTINGS_KEY, fallback: DEFAULT_PROJECT_ENVIRONMENTS, id, attachmentField: "projectEnvironment", noun: "Project environment" });
        return result.success ? { success: true as const, projectEnvironments: result.items } : result;
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : "Could not delete project environment." };
    }
}

// -------------------- Project Create / Update --------------------
export async function saveProjectAction(formData: FormData) {
    try {
        await requireAdmin();

        const text = (key: string) => String(formData.get(key) ?? "").trim();
        const nullable = (key: string) => text(key) || null;
        const id = text("id") || null;
        const title = text("title");
        const slug = normalizeId(text("slug"));
        const summary = text("summary");
        const category = text("category");
        const projectType = text("projectType") || "LAB";
        const projectEnvironment = text("projectEnvironment") || "HYBRID";

        if (!title || !slug) return { success: false as const, error: "Title and Slug are required." };

        const statusRaw = text("status").toUpperCase();
        const status: PublishStatus = statusRaw === "DRAFT" ? PublishStatus.DRAFT : statusRaw === "ARCHIVED" ? PublishStatus.ARCHIVED : PublishStatus.PUBLISHED;
        const stack = text("stack").split(",").map((item) => item.trim()).filter(Boolean);
        const galleryUrls = text("galleryUrls").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);

        const fullDescription = text("fullDescription");
        const attachments: JsonRecord = {
            category,
            projectType,
            projectEnvironment,
            objective: text("objective"),
            roleResponsibilities: text("roleResponsibilities"),
            osPlatform: text("osPlatform"),
            protocolsServices: text("protocolsServices"),
            keyFeatures: text("keyFeatures"),
            implementationSteps: text("implementationSteps"),
            securityMeasures: text("securityMeasures"),
            monitoringLogging: text("monitoringLogging"),
            backupRecovery: text("backupRecovery"),
            galleryUrls,
            diagramUrl: text("diagramUrl"),
            documentationUrl: text("documentationUrl"),
            startDate: text("startDate"),
            completionDate: text("completionDate"),
            lessonsLearned: text("lessonsLearned"),
        };

        const projectData = {
            title,
            slug,
            summary,
            content: fullDescription || null,
            coverUrl: nullable("coverUrl"),
            liveUrl: nullable("liveUrl"),
            repoUrl: nullable("repoUrl"),
            featured: text("featured") === "true",
            status,
            stack,
            seoTitle: nullable("seoTitle"),
            seoDescription: nullable("seoMetaDescription"),
            attachments,
        };

        let projectId: string;
        if (id) {
            const project = await prisma.project.update({ where: { id }, data: projectData, select: { id: true } });
            projectId = project.id;
        } else {
            const project = await prisma.project.create({ data: projectData, select: { id: true } });
            projectId = project.id;
        }

        const hasCaseStudy = text("hasCaseStudy") === "true";
        if (hasCaseStudy) {
            await prisma.caseStudy.upsert({
                where: { projectId },
                create: {
                    projectId,
                    problem: text("caseStudyProblem"),
                    solution: text("caseStudySolution"),
                    outcome: nullable("caseStudyOutcome"),
                    architectureDiagram: nullable("diagramUrl"),
                    imageGallery: galleryUrls,
                },
                update: {
                    problem: text("caseStudyProblem"),
                    solution: text("caseStudySolution"),
                    outcome: nullable("caseStudyOutcome"),
                    architectureDiagram: nullable("diagramUrl"),
                    imageGallery: galleryUrls,
                },
            });
        } else {
            await prisma.caseStudy.deleteMany({ where: { projectId } });
        }

        revalidateProjectPaths(slug);
        return { success: true as const, id: projectId, slug };
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : "Failed to save project." };
    }
}

// -------------------- Project Delete --------------------
export async function deleteProjectAction(id: string) {
    try {
        await requireAdmin();
        if (!id?.trim()) return { success: false as const, error: "Invalid project ID." };

        const project = await prisma.project.findUnique({ where: { id }, select: { slug: true } });
        if (!project) return { success: false as const, error: "Project was not found." };

        await prisma.caseStudy.deleteMany({ where: { projectId: id } });
        await prisma.project.delete({ where: { id } });
        revalidateProjectPaths(project.slug);
        return { success: true as const };
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : "Failed to delete project." };
    }
}
