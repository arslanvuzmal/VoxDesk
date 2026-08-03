import "server-only";
import { demoSessionStore } from "@/lib/demo/store";

export async function withSessionLock<T>(
  sessionId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const acquired = await demoSessionStore.acquireRequestLock(sessionId);
  if (!acquired) {
    throw new Error(
      "CONCURRENT_REQUEST_BLOCKED: Another request is currently being processed for this session.",
    );
  }

  try {
    return await fn();
  } finally {
    await demoSessionStore.releaseRequestLock(sessionId);
  }
}
