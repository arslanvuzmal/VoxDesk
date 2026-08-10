import { describe, expect, it } from 'vitest';
import { ConcurrencyManager } from '@/lib/telephony/concurrency';

describe('call concurrency leases', () => {
  it('releases a lease instead of extending its heartbeat', async () => {
    const manager = new ConcurrencyManager();
    const first = await manager.acquireLease('PHONE_NUMBER', 'number-a', 'call-a', 'INBOUND');
    expect(first.acquired).toBe(true);
    expect(first.leaseId).toBeTruthy();

    const blocked = await manager.acquireLease('PHONE_NUMBER', 'number-a', 'call-b', 'INBOUND');
    expect(blocked.acquired).toBe(false);

    await expect(manager.releaseLeaseById(first.leaseId!)).resolves.toBe(true);
    const replacement = await manager.acquireLease('PHONE_NUMBER', 'number-a', 'call-b', 'INBOUND');
    expect(replacement.acquired).toBe(true);
  });

  it('does not release the same lease twice', async () => {
    const manager = new ConcurrencyManager();
    const lease = await manager.acquireLease('BUSINESS', 'business-a', 'call-a', 'OUTBOUND');
    expect(lease.acquired).toBe(true);
    await expect(manager.releaseLeaseById(lease.leaseId!)).resolves.toBe(true);
    await expect(manager.releaseLeaseById(lease.leaseId!)).resolves.toBe(false);
  });
});
