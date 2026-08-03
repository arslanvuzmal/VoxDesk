import "server-only";
import { env } from "@/lib/config/env";
import { getDemoSessionStoreStatus } from "@/lib/demo/store";
import { prisma } from "@/lib/database";

export interface InfrastructureStatus {
  sessionStore: {
    provider: "redis" | "memory" | "unavailable";
    ready: boolean;
  };
  database: {
    provider: "postgresql";
    ready: boolean;
  };
  cloudflareAI: {
    configured: boolean;
    ready: boolean;
  };
}

export async function getDemoInfrastructureStatus(): Promise<InfrastructureStatus> {
  const storeStatus = getDemoSessionStoreStatus();

  let dbReady = false;
  try {
    // Light ping on database
    await prisma.$queryRaw`SELECT 1`;
    dbReady = true;
  } catch {
    dbReady = false;
  }

  const cloudflareConfigured = !!(
    env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN
  );
  const cloudflareReady =
    cloudflareConfigured && env.CLOUDFLARE_AI_KILL_SWITCH !== "true";

  return {
    sessionStore: {
      provider: storeStatus.provider,
      ready: storeStatus.ready,
    },
    database: {
      provider: "postgresql",
      ready: dbReady,
    },
    cloudflareAI: {
      configured: cloudflareConfigured,
      ready: cloudflareReady,
    },
  };
}
