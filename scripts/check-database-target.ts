import path from "path";
import { configureScriptEnvironment, DatabaseTargetInfo } from "./env-config";

export interface CheckTargetOptions {
  exitProcess?: boolean;
  staging?: boolean;
  dbUrl?: string;
}

export function checkTarget(options: CheckTargetOptions = {}): {
  target: string;
  targetInfo: DatabaseTargetInfo;
  loadedFrom: string;
  exitCode: number;
} {
  const args = process.argv.slice(2);
  const isStaging = options.staging ?? (args.includes("--staging") || process.env.STAGING === "true");
  const isCli = require.main === module || (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename));
  const shouldExit = options.exitProcess ?? isCli;

  const envResult = configureScriptEnvironment({ staging: isStaging, dbUrl: options.dbUrl });

  // 1. Missing staging configuration handling
  if (isStaging && envResult.fileMissing) {
    console.error(`\n======================================================`);
    console.error(`❌ Staging Configuration Error: Staging File Missing`);
    console.error(`======================================================`);
    console.error(`  Requested Target : Staging Environment (--staging)`);
    console.error(`  Required File    : ${envResult.missingFile || ".env.staging"}`);
    console.error(`  Status           : FILE NOT FOUND`);
    console.error(`======================================================\n`);
    console.error(`⚠️ Staging mode strictly requires an isolated configuration file (.env.staging).`);
    console.error(`   Silent fallback to default '.env' or remote production is strictly blocked.\n`);
    console.error(`📋 Next Steps to Safely Configure Staging:`);
    console.error(`   1. Copy '.env.staging.example' to '.env.staging':`);
    console.error(`      powershell: Copy-Item .env.staging.example .env.staging`);
    console.error(`   2. Set your isolated staging DATABASE_URL inside '.env.staging'.`);
    console.error(`   3. Re-run: npm run env:check -- --staging\n`);

    if (shouldExit) {
      process.exit(1);
    }
    return { target: "staging", targetInfo: envResult.targetInfo, loadedFrom: "none", exitCode: 1 };
  }

  const { target, targetInfo, loadedFrom } = envResult;

  console.log(`\n======================================================`);
  console.log(`🔍 Database Target Environment Inspection`);
  console.log(`======================================================`);
  console.log(`  Source Configuration File : ${loadedFrom}`);
  console.log(`  Target Classification     : ${targetInfo.classification}`);
  console.log(`  Target Hostname           : ${targetInfo.hostname}`);
  console.log(`  Target Port               : ${targetInfo.port}`);
  console.log(`  Target Database Name      : ${targetInfo.database}`);
  console.log(`  Is Production Target?     : ${targetInfo.isProduction ? "YES (MUTATION BLOCKED)" : "NO"}`);
  console.log(`  Target Access Status      : ${targetInfo.isBlocked ? "BLOCKED" : "ALLOWED"}`);
  console.log(`  Safety Status Message     : ${targetInfo.statusMessage}`);
  console.log(`======================================================\n`);

  let exitCode = 0;

  // 2. Target safety verdict
  if (targetInfo.classification === "UNKNOWN" || targetInfo.isBlocked) {
    if (targetInfo.classification === "UNKNOWN") {
      console.error(`🚨 BLOCKED: Database target is UNKNOWN or unconfigured.`);
      console.error(`   Reason: ${targetInfo.statusMessage}`);
      console.error(`   Safety Rule: Missing, invalid, or unrecognized database targets are strictly blocked.`);
      console.error(`   Please check your ${loadedFrom} and configure a verified isolated staging database.\n`);
      exitCode = 1;
    } else if (isStaging && targetInfo.isProduction) {
      console.error(`🚨 FATAL: Staging environment configuration points to REMOTE PRODUCTION!`);
      console.error(`   Target Host: ${targetInfo.hostname}`);
      console.error(`   Staging operations against production targets are strictly prohibited.`);
      console.error(`   Please update ${loadedFrom} to point to an isolated staging database.\n`);
      exitCode = 1;
    } else if (targetInfo.isProduction) {
      console.log(`⚠️ CAUTION: The current configuration targets REMOTE PRODUCTION.`);
      console.log(`   All mutation scripts (sync, migrations, resets) are blocked from execution.`);
      console.log(`   To test against staging, create an isolated database and specify in .env.staging.\n`);
      exitCode = 0;
    }
  } else {
    console.log(`✅ Verified safe for isolated operations (${targetInfo.classification}).`);
    console.log(`   Safe for non-production operations and test hydration.\n`);
    exitCode = 0;
  }

  if (shouldExit && exitCode !== 0) {
    process.exit(exitCode);
  }

  return { target, targetInfo, loadedFrom, exitCode };
}

const isDirectCli = require.main === module || (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename));
if (isDirectCli) {
  checkTarget();
}
