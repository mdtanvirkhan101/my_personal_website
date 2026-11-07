import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Calculates human-readable duration between two dates (e.g. "2 years 4 months", "1 year", "8 months")
 */
export function calculateDuration(
  startDateStr: Date | string | null | undefined,
  endDateStr?: Date | string | null | undefined,
  current?: boolean
): string {
  if (!startDateStr) return "";
  const start = typeof startDateStr === "string" ? new Date(startDateStr) : startDateStr;
  const end =
    current || !endDateStr
      ? new Date()
      : typeof endDateStr === "string"
      ? new Date(endDateStr)
      : endDateStr;

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return "";
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (end.getDate() < start.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  }

  if (parts.length === 0) {
    return "< 1 month";
  }

  return parts.join(" ");
}
