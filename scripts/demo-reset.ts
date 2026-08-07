import { demoSessionStore } from '../lib/demo/store';

async function main() {
  console.log('🧹 Resetting VoxDesk AI demo session stores and rate limit counters...');
  try {
    await demoSessionStore.clearAllSessions();
    console.log('✅ Demo session store successfully reset.');
  } catch (err) {
    console.error('❌ Failed to reset demo store:', err);
  }
}

main();
