import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  candidateFind: vi.fn(),
  candidateUpdate: vi.fn(),
  candidateUpdateMany: vi.fn(),
  runsFind: vi.fn(),
  auditCreate: vi.fn(),
  deploymentFind: vi.fn(),
  deploymentUpdate: vi.fn(),
  deploymentUpdateMany: vi.fn(),
  deploymentCreate: vi.fn(),
  rollbackCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    deploymentCandidate: {
      findFirst: mocks.candidateFind,
      update: mocks.candidateUpdate,
      updateMany: mocks.candidateUpdateMany,
    },
    evaluationRun: { findMany: mocks.runsFind },
    auditLog: { create: mocks.auditCreate },
    agentDeployment: {
      findFirst: mocks.deploymentFind,
      update: mocks.deploymentUpdate,
      updateMany: mocks.deploymentUpdateMany,
      create: mocks.deploymentCreate,
    },
    rollbackRecord: { create: mocks.rollbackCreate },
    $transaction: mocks.transaction,
  },
}));

import {
  completeCandidateCanary,
  evaluateCandidate,
  promoteCandidate,
  rollbackCandidate,
} from '@/lib/improvement/lifecycle';

describe('supervised improvement lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auditCreate.mockResolvedValue({});
    mocks.candidateUpdate.mockResolvedValue({});
    mocks.candidateUpdateMany.mockResolvedValue({ count: 1 });
    mocks.transaction.mockImplementation(async value => {
      if (typeof value === 'function') {
        return value({
          deploymentCandidate: {
            update: mocks.candidateUpdate,
            updateMany: mocks.candidateUpdateMany,
          },
          agentDeployment: {
            update: mocks.deploymentUpdate,
            updateMany: mocks.deploymentUpdateMany,
            create: mocks.deploymentCreate,
          },
          rollbackRecord: { create: mocks.rollbackCreate },
          auditLog: { create: mocks.auditCreate },
        });
      }
      return Promise.all(value);
    });
  });

  it('blocks a candidate when any required golden suite is missing', async () => {
    mocks.candidateFind.mockResolvedValue({
      id: 'candidate-a',
      workspaceId: 'workspace-a',
      agentVersionId: 'version-a',
      status: 'CANDIDATE',
      evaluationSuiteIds: ['suite-a', 'suite-b'],
    });
    mocks.runsFind.mockResolvedValue([
      {
        id: 'run-a',
        suiteId: 'suite-a',
        results: { passed: true, criticalFailures: 0 },
      },
    ]);

    const result = await evaluateCandidate('workspace-a', 'candidate-a', 'reviewer-a');

    expect(result).toEqual(expect.objectContaining({ ok: false, code: 'EVALUATION_FAILED' }));
    expect(mocks.candidateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'EVALUATION_FAILED',
          regressionDetected: true,
        }),
      })
    );
  });

  it('requires the configured canary sample and zero critical failures', async () => {
    mocks.candidateFind.mockResolvedValue({
      id: 'candidate-a',
      canaryResults: { minimumConversations: 20, status: 'RUNNING' },
    });

    const result = await completeCandidateCanary('workspace-a', 'candidate-a', 'reviewer-a', {
      totalConversations: 19,
      criticalFailures: 0,
      regressionDetected: false,
      dimensionResults: { businessCorrectness: 1 },
    });

    expect(result).toEqual(expect.objectContaining({ ok: false, code: 'CANARY_FAILED' }));
    expect(mocks.candidateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CANARY_FAILED',
          regressionDetected: true,
        }),
      })
    );
  });

  it('promotes only a candidate that passed evaluation and canary gates', async () => {
    mocks.candidateFind.mockResolvedValue({
      id: 'candidate-a',
      workspaceId: 'workspace-a',
      agentId: 'agent-a',
      agentVersionId: 'version-a',
      status: 'READY_TO_PROMOTE',
      regressionDetected: false,
    });
    mocks.deploymentUpdateMany.mockResolvedValue({ count: 1 });
    mocks.deploymentCreate.mockResolvedValue({ id: 'deployment-a' });

    const result = await promoteCandidate('workspace-a', 'candidate-a', 'reviewer-a');

    expect(result).toEqual({
      ok: true,
      data: {
        candidateId: 'candidate-a',
        deploymentId: 'deployment-a',
        status: 'DEPLOYED',
      },
    });
    expect(mocks.deploymentCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        agentVersionId: 'version-a',
        environment: 'PRODUCTION',
        active: true,
      }),
    });
  });

  it('rolls back to the most recent known previous deployment', async () => {
    mocks.deploymentFind
      .mockResolvedValueOnce({
        id: 'deployment-current',
        agentId: 'agent-a',
      })
      .mockResolvedValueOnce({
        id: 'deployment-previous',
        agentVersionId: 'version-previous',
      });
    mocks.deploymentUpdateMany.mockResolvedValue({ count: 1 });
    mocks.deploymentUpdate.mockResolvedValue({
      id: 'deployment-previous',
      agentVersionId: 'version-previous',
    });
    mocks.rollbackCreate.mockResolvedValue({ id: 'rollback-a' });

    const result = await rollbackCandidate(
      'workspace-a',
      'candidate-a',
      'reviewer-a',
      'Canary regression detected after promotion.'
    );

    expect(result).toEqual({
      ok: true,
      data: {
        candidateId: 'candidate-a',
        restoredDeploymentId: 'deployment-previous',
        status: 'ROLLED_BACK',
      },
    });
    expect(mocks.deploymentUpdate).toHaveBeenCalledWith({
      where: { id: 'deployment-previous' },
      data: { active: true, rollbackReason: null },
    });
  });
});
