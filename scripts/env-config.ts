import fs from "fs";
import path from "path";

export type TargetEnvironment = "production" | "staging" | "development" | "test";

export interface DatabaseTargetInfo {
  protocol: string;
  hostname: string;
  port: string;
  database: string;
  classification: "REMOTE_PRODUCTION" | "CLOUD_STAGING" | "LOCAL_ISOLATED" | "UNKNOWN";
  isProduction: boolean;
  isBlocked: boolean;
  statusMessage: string;
}

export interface ConfigureEnvOptions {
  staging?: boolean;
  dev?: boolean;
  dbUrl?: string;
}

export interface ConfigureEnvResult {
  target: TargetEnvironment;
  targetInfo: DatabaseTargetInfo;
  loadedFrom: string;
  isStaging: boolean;
  fileMissing?: boolean;
  missingFile?: string;
}

/**
 * Safely parse a database URL into non-sensitive target information.
 * NEVER prints or returns usernames, passwords, or the full connection string.
 */
export function getDatabaseTargetInfo(dbUrl?: string): DatabaseTargetInfo {
  const urlString = (dbUrl !== undefined ? dbUrl : process.env.DATABASE_URL || "").trim();

  // Missing or empty URL
  if (!urlString) {
    return {
      protocol: "none",
      hostname: "unspecified",
      port: "0",
      database: "none",
      classification: "UNKNOWN",
      isProduction: false,
      isBlocked: true,
      statusMessage: "Database connection string is missing or empty",
    };
  }

  // Placeholder strings check (e.g. <STAGING_HOST>, your-staging-host, etc.)
  if (
    urlString.includes("<") ||
    urlString.includes(">") ||
    urlString.includes("your-staging-host") ||
    urlString.includes("your-db-host")
  ) {
    return {
      protocol: "placeholder",
      hostname: "placeholder-detected",
      port: "0",
      database: "none",
      classification: "UNKNOWN",
      isProduction: false,
      isBlocked: true,
      statusMessage: "Database connection string contains unconfigured placeholders (<...>/your-staging-host)",
    };
  }

  try {
    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase();
    const database = parsed.pathname.replace(/^\//, "");

    // Invalid or missing hostname
    if (!host || host === "unspecified") {
      return {
        protocol: parsed.protocol ? parsed.protocol.replace(":", "") : "invalid",
        hostname: "unspecified",
        port: "0",
        database: database || "none",
        classification: "UNKNOWN",
        isProduction: false,
        isBlocked: true,
        statusMessage: "Database connection string has no valid hostname",
      };
    }

    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".local") ||
      host === "host.docker.internal";

    // Production detection criteria
    const isProduction =
      !isLocal &&
      (host.includes("pooled.db.prisma.io") ||
        host.includes("prod") ||
        host.includes("production") ||
        database.includes("prod") ||
        parsed.searchParams.get("pool") === "true" ||
        process.env.APP_ENV === "production");

    let classification: DatabaseTargetInfo["classification"] = "UNKNOWN";
    let isBlocked = false;
    let statusMessage = "";

    if (isLocal) {
      classification = "LOCAL_ISOLATED";
      isBlocked = false;
      statusMessage = "Local isolated PostgreSQL instance";
    } else if (isProduction) {
      classification = "REMOTE_PRODUCTION";
      isBlocked = true;
      statusMessage = "Remote production database target (mutations strictly blocked)";
    } else {
      // Check if it qualifies as an isolated cloud staging branch:
      // Must be a recognized cloud database domain or have staging keywords in host/db
      const isCloudStaging =
        host.includes("neon.tech") ||
        host.includes("supabase.co") ||
        host.includes("supabase.net") ||
        host.includes("render.com") ||
        host.includes("railway.app") ||
        host.includes("staging") ||
        host.includes("stage") ||
        host.includes("dev") ||
        host.includes("test") ||
        database.includes("staging") ||
        database.includes("dev");

      if (isCloudStaging) {
        classification = "CLOUD_STAGING";
        isBlocked = false;
        statusMessage = "Isolated cloud staging database branch";
      } else {
        // Unknown, unrecognized remote host -> classified as UNKNOWN and BLOCKED
        classification = "UNKNOWN";
        isBlocked = true;
        statusMessage = `Unrecognized or unverified remote database host '${host}'`;
      }
    }

    return {
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
      port: parsed.port || "5432",
      database: database || "postgres",
      classification,
      isProduction,
      isBlocked,
      statusMessage,
    };
  } catch {
    return {
      protocol: "invalid",
      hostname: "unparseable",
      port: "0",
      database: "none",
      classification: "UNKNOWN",
      isProduction: false,
      isBlocked: true,
      statusMessage: "Database connection string is malformed and could not be parsed as a URL",
    };
  }
}

/**
 * Loads environment variables from a specific env file (e.g. .env.staging, .env.development, .env).
 * If the file does not exist, returns false without throwing.
 */
export function loadEnvFile(filename: string, override: boolean = true): boolean {
  const fullPath = path.isAbsolute(filename) ? filename : path.join(process.cwd(), filename);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (override || process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }

  return true;
}

/**
 * Configures the active environment for scripts based on CLI arguments or explicit target options.
 * When staging mode is requested, strictly checks .env.staging and NEVER silently falls back to .env.
 */
export function configureScriptEnvironment(options: ConfigureEnvOptions = {}): ConfigureEnvResult {
  const args = process.argv.slice(2);
  const isStaging = options.staging ?? (args.includes("--staging") || process.env.STAGING === "true");
  const isDev = options.dev ?? (args.includes("--dev") || process.env.NODE_ENV === "development");

  let loadedFrom = ".env";

  if (isStaging) {
    const stagingFile = ".env.staging";
    const stagingPath = path.join(process.cwd(), stagingFile);
    if (!fs.existsSync(stagingPath) && !options.dbUrl) {
      // Do NOT fall back to .env or .env.development!
      return {
        target: "staging",
        targetInfo: getDatabaseTargetInfo(""),
        loadedFrom: "none",
        isStaging: true,
        fileMissing: true,
        missingFile: stagingFile,
      };
    }
    if (fs.existsSync(stagingPath)) {
      loadEnvFile(stagingFile, true);
      loadedFrom = stagingFile;
    } else {
      loadedFrom = "custom";
    }
  } else if (isDev) {
    const devFile = ".env.development";
    if (fs.existsSync(path.join(process.cwd(), devFile))) {
      loadEnvFile(devFile, true);
      loadedFrom = devFile;
    } else {
      loadEnvFile(".env", false);
      loadedFrom = ".env";
    }
  } else if (!options.dbUrl) {
    loadEnvFile(".env", false);
    loadedFrom = ".env";
  } else {
    loadedFrom = "custom";
  }

  const targetInfo = getDatabaseTargetInfo(options.dbUrl);
  let target: TargetEnvironment = "production";
  if (targetInfo.isProduction) {
    target = "production";
  } else if (targetInfo.classification === "LOCAL_ISOLATED") {
    target = "development";
  } else if (targetInfo.classification === "CLOUD_STAGING") {
    target = "staging";
  } else {
    target = isStaging ? "staging" : "production";
  }

  return { target, targetInfo, loadedFrom, isStaging };
}

/**
 * Hard safety assertion: Throws an error immediately if the active database target is remote production.
 */
export function assertNotProduction(actionDescription: string): void {
  const targetInfo = getDatabaseTargetInfo();
  if (targetInfo.isProduction) {
    throw new Error(
      `🚨 SAFETY BLOCKED: '${actionDescription}' cannot be executed against production database target (${targetInfo.hostname}:${targetInfo.port}/${targetInfo.database}).\n` +
      `   Please configure an isolated staging/local database in .env.staging before running this operation.`
    );
  }
}

/**
 * Hard safety assertion: Throws an error immediately if the active database target is
 * production, UNKNOWN, or not verified as safe.
 */
export function assertSafeTarget(actionDescription: string): void {
  const targetInfo = getDatabaseTargetInfo();
  if (targetInfo.isProduction) {
    throw new Error(
      `🚨 SAFETY BLOCKED: '${actionDescription}' cannot be executed against production database target (${targetInfo.hostname}:${targetInfo.port}/${targetInfo.database}).\n` +
      `   Please configure an isolated staging/local database in .env.staging before running this operation.`
    );
  }
  if (targetInfo.classification === "UNKNOWN" || targetInfo.isBlocked) {
    throw new Error(
      `🚨 SAFETY BLOCKED: '${actionDescription}' cannot be executed against an UNKNOWN or unverified database target.\n` +
      `   Status Reason: ${targetInfo.statusMessage}.\n` +
      `   Please configure a valid isolated staging database in .env.staging.`
    );
  }
}
