import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { getDatabaseTargetInfo, loadEnvFile } from "./env-config";

export function runPrismaStaging() {
  const args = process.argv.slice(2);
  const stagingFile = ".env.staging";

  if (!fs.existsSync(path.join(process.cwd(), stagingFile))) {
    console.error(`\n======================================================`);
    console.error(`❌ Staging Configuration Error: Staging File Missing`);
    console.error(`======================================================`);
    console.error(`  Required File : ${stagingFile}`);
    console.error(`  Status        : FILE NOT FOUND`);
    console.error(`======================================================\n`);
    console.error(`⚠️ Prisma Staging runner strictly requires '${stagingFile}'.`);
    console.error(`   Silent fallback to default '.env' or production is strictly prohibited.\n`);
    console.error(`📋 Next Steps:`);
    console.error(`   1. Create '${stagingFile}' from '.env.staging.example':`);
    console.error(`      powershell: Copy-Item .env.staging.example .env.staging`);
    console.error(`   2. Set your isolated staging DATABASE_URL inside '${stagingFile}'.`);
    console.error(`   3. Re-run: npm run prisma:staging -- <command>\n`);
    process.exit(1);
  }

  // Load staging file
  loadEnvFile(stagingFile);
  const targetInfo = getDatabaseTargetInfo();

  console.log(`\n======================================================`);
  console.log(`🛡️ Prisma Staging CLI Runner`);
  console.log(`======================================================`);
  console.log(`  Configuration File : ${stagingFile}`);
  console.log(`  Target Host        : ${targetInfo.hostname}:${targetInfo.port}`);
  console.log(`  Target Database    : ${targetInfo.database}`);
  console.log(`  Classification     : ${targetInfo.classification}`);
  console.log(`  Target Status      : ${targetInfo.isBlocked ? "BLOCKED" : "ALLOWED"}`);
  console.log(`======================================================\n`);

  if (targetInfo.isProduction) {
    console.error(`🚨 FATAL: Staging environment configuration resolved to a REMOTE PRODUCTION database!`);
    console.error(`   Hostname: ${targetInfo.hostname}`);
    console.error(`   Execution aborted to protect production data.\n`);
    process.exit(1);
  }

  if (targetInfo.classification === "UNKNOWN" || targetInfo.isBlocked) {
    console.error(`🚨 FATAL: Staging environment target is UNKNOWN or invalid!`);
    console.error(`   Reason: ${targetInfo.statusMessage}`);
    console.error(`   Execution aborted to prevent undefined database operations.\n`);
    process.exit(1);
  }

  const prismaBin = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    process.platform === "win32" ? "prisma.cmd" : "prisma"
  );

  const env = {
    ...process.env,
    PRISMA_DOTENV_PATH: path.join(process.cwd(), stagingFile),
  };

  const child = spawn(prismaBin, args, {
    stdio: "inherit",
    env,
    shell: true,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

if (require.main === module || process.argv[1]?.includes("prisma-staging.ts")) {
  runPrismaStaging();
}
