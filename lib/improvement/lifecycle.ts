import { prisma } from '@/lib/database';

type GateFailure = {
  ok: false;
  code: 'NOT_FOUND' | 'CONFLICT' | 'EVALUATION_FAILED' | 'CANARY_FAILED' | 'NO_ROLLBACK';
  message: string;
};

type GateSuccess<T> = { ok: true; data: T };

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function evaluationPassed(value: unknown): boolean {
  const result = objectValue(value);
  if (!result || result.passed !== true) return false;
  const criticalFailures = result.criticalFailures;
  return typeof criticalFailures !== 'number' || criticalFailures === 0;
}

export async function evaluateCandidate(
  workspaceId: string,
  candidateId: string,
  actorId: string
): Promise<GateFailure | GateSuccess<{ candidateId: string; status: string; runIds: string[] }>> {
  const candidate = await prisma.deploymentCandidate.findFirst({
    where: { id: candidateId, workspaceId },
  });
  if (!candidate || !candidate.agentVersionId) {
    return { ok: false, code: 'NOT_FOUND', message: 'Candidate version was not found.' };
  }
  if (!['CANDIDATE', 'EVALUATING', 'EVALUATION_FAILED'].includes(candidate.status)) {
    return {
      ok: false,
      code: 'CONFLICT',
      message: 'Candidate cannot be evaluated from its current state.',
    };
  }
  if (candidate.evaluationSuiteIds.length === 0) {
    return {
      ok: false,
      code: 'EVALUATION_FAILED',
      message: 'At least one approved golden evaluation suite is required.',
    };
  }

  const runs = await prisma.evaluationRun.findMany({
    where: {
      workspaceId,
      agentVersionId: candidate.agentVersionId,
      suiteId: { in: candidate.evaluationSuiteIds },
    },
    orderBy: { timestamp: 'desc' },
  });
  const latestBySuite = new Map<string, (typeof runs)[number]>();
  for (const run of runs) {
    if (!latestBySuite.has(run.suiteId)) latestBySuite.set(run.suiteId, run);
  }
  const missingSuites = candidate.evaluationSuiteIds.filter(id => !latestBySuite.has(id));
  const selectedRuns = [...latestBySuite.values()];
  const failedRuns = selectedRuns.filter(run => !evaluationPassed(run.results));
  const passed = missingSuites.length === 0 && failedRuns.length === 0;

  await prisma.$transaction([
    prisma.deploymentCandidate.update({
      where: { id: candidate.id },
      data: {
        status: passed ? 'READY_FOR_CANARY' : 'EVALUATION_FAILED',
        regressionDetected: !passed,
      },
    }),
    prisma.auditLog.create({
      data: {
        workspaceId,
        userId: actorId,
        action: passed ? 'CANDIDATE_EVALUATION_PASSED' : 'CANDIDATE_EVALUATION_FAILED',
        entityType: 'DEPLOYMENT_CANDIDATE',
        entityId: candidate.id,
        metadata: {
          runIds: selectedRuns.map(run => run.id),
          missingSuiteIds: missingSuites,
          failedRunIds: failedRuns.map(run => run.id),
        },
      },
    }),
  ]);

  if (!passed) {
    return {
      ok: false,
      code: 'EVALUATION_FAILED',
      message: 'Golden evaluation coverage is incomplete or contains a regression.',
    };
  }
  return {
    ok: true,
    data: {
      candidateId: candidate.id,
      status: 'READY_FOR_CANARY',
      runIds: selectedRuns.map(run => run.id),
    },
  };
}

export async function startCandidateCanary(
  workspaceId: string,
  candidateId: string,
  actorId: string,
  minimumConversations: number
): Promise<GateFailure | GateSuccess<{ candidateId: string; status: string }>> {
  const updated = await prisma.deploymentCandidate.updateMany({
    where: {
      id: candidateId,
      workspaceId,
      status: 'READY_FOR_CANARY',
      regressionDetected: false,
    },
    data: {
      status: 'CANARY',
      canaryResults: {
        minimumConversations,
        startedAt: new Date().toISOString(),
        startedBy: actorId,
        status: 'RUNNING',
      },
    },
  });
  if (updated.count !== 1) {
    return {
      ok: false,
      code: 'CONFLICT',
      message: 'Candidate is not ready for canary.',
    };
  }
  await prisma.auditLog.create({
    data: {
      workspaceId,
      userId: actorId,
      action: 'CANDIDATE_CANARY_STARTED',
      entityType: 'DEPLOYMENT_CANDIDATE',
      entityId: candidateId,
      metadata: { minimumConversations },
    },
  });
  return { ok: true, data: { candidateId, status: 'CANARY' } };
}

export async function completeCandidateCanary(
  workspaceId: string,
  candidateId: string,
  actorId: string,
  evidence: {
    totalConversations: number;
    criticalFailures: number;
    regressionDetected: boolean;
    dimensionResults: Record<string, number>;
  }
): Promise<GateFailure | GateSuccess<{ candidateId: string; status: string }>> {
  const candidate = await prisma.deploymentCandidate.findFirst({
    where: { id: candidateId, workspaceId, status: 'CANARY' },
    select: { id: true, canaryResults: true },
  });
  if (!candidate) {
    return { ok: false, code: 'CONFLICT', message: 'Candidate is not in canary.' };
  }
  const configured = objectValue(candidate.canaryResults);
  const minimum =
    typeof configured?.minimumConversations === 'number'
      ? configured.minimumConversations
      : Number.POSITIVE_INFINITY;
  const passed =
    evidence.totalConversations >= minimum &&
    evidence.criticalFailures === 0 &&
    !evidence.regressionDetected;
  const status = passed ? 'READY_TO_PROMOTE' : 'CANARY_FAILED';

  await prisma.$transaction([
    prisma.deploymentCandidate.update({
      where: { id: candidate.id },
      data: {
        status,
        regressionDetected: !passed,
        canaryResults: {
          ...configured,
          ...evidence,
          completedAt: new Date().toISOString(),
          completedBy: actorId,
          status: passed ? 'PASSED' : 'FAILED',
        },
      },
    }),
    prisma.auditLog.create({
      data: {
        workspaceId,
        userId: actorId,
        action: passed ? 'CANDIDATE_CANARY_PASSED' : 'CANDIDATE_CANARY_FAILED',
        entityType: 'DEPLOYMENT_CANDIDATE',
        entityId: candidate.id,
        metadata: {
          totalConversations: evidence.totalConversations,
          criticalFailures: evidence.criticalFailures,
          regressionDetected: evidence.regressionDetected,
        },
      },
    }),
  ]);
  if (!passed) {
    return {
      ok: false,
      code: 'CANARY_FAILED',
      message: 'Canary evidence did not satisfy the promotion gate.',
    };
  }
  return { ok: true, data: { candidateId: candidate.id, status } };
}

export async function promoteCandidate(
  workspaceId: string,
  candidateId: string,
  actorId: string
): Promise<
  GateFailure | GateSuccess<{ candidateId: string; deploymentId: string; status: string }>
> {
  const candidate = await prisma.deploymentCandidate.findFirst({
    where: {
      id: candidateId,
      workspaceId,
      status: 'READY_TO_PROMOTE',
      regressionDetected: false,
    },
  });
  if (!candidate?.agentVersionId) {
    return {
      ok: false,
      code: 'CONFLICT',
      message: 'Candidate has not passed every promotion gate.',
    };
  }

  const deployment = await prisma.$transaction(async tx => {
    const claim = await tx.deploymentCandidate.updateMany({
      where: {
        id: candidate.id,
        workspaceId,
        status: 'READY_TO_PROMOTE',
        regressionDetected: false,
      },
      data: { status: 'PROMOTING' },
    });
    if (claim.count !== 1) return null;

    await tx.agentDeployment.updateMany({
      where: {
        workspaceId,
        agentId: candidate.agentId,
        environment: 'PRODUCTION',
        active: true,
      },
      data: { active: false },
    });
    const created = await tx.agentDeployment.create({
      data: {
        workspaceId,
        agentId: candidate.agentId,
        agentVersionId: candidate.agentVersionId!,
        deploymentCandidateId: candidate.id,
        environment: 'PRODUCTION',
        active: true,
      },
    });
    await tx.deploymentCandidate.update({
      where: { id: candidate.id },
      data: { status: 'DEPLOYED', deployedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        workspaceId,
        userId: actorId,
        action: 'DEPLOYMENT_PROMOTED',
        entityType: 'DEPLOYMENT_CANDIDATE',
        entityId: candidate.id,
        metadata: {
          deploymentId: created.id,
          agentVersionId: candidate.agentVersionId,
        },
      },
    });
    return created;
  });
  if (!deployment) {
    return {
      ok: false,
      code: 'CONFLICT',
      message: 'Candidate changed before promotion completed.',
    };
  }
  return {
    ok: true,
    data: { candidateId, deploymentId: deployment.id, status: 'DEPLOYED' },
  };
}

export async function rollbackCandidate(
  workspaceId: string,
  candidateId: string,
  actorId: string,
  reason: string
): Promise<
  GateFailure | GateSuccess<{ candidateId: string; restoredDeploymentId: string; status: string }>
> {
  const current = await prisma.agentDeployment.findFirst({
    where: {
      workspaceId,
      deploymentCandidateId: candidateId,
      environment: 'PRODUCTION',
      active: true,
    },
  });
  if (!current) {
    return { ok: false, code: 'NOT_FOUND', message: 'Active candidate deployment was not found.' };
  }
  const previous = await prisma.agentDeployment.findFirst({
    where: {
      workspaceId,
      agentId: current.agentId,
      environment: 'PRODUCTION',
      active: false,
      id: { not: current.id },
    },
    orderBy: { deployedAt: 'desc' },
  });
  if (!previous) {
    return {
      ok: false,
      code: 'NO_ROLLBACK',
      message: 'No previously verified production deployment is available.',
    };
  }

  const restored = await prisma.$transaction(async tx => {
    const claim = await tx.agentDeployment.updateMany({
      where: { id: current.id, workspaceId, active: true },
      data: { active: false, rollbackReason: reason },
    });
    if (claim.count !== 1) return null;
    const restoredDeployment = await tx.agentDeployment.update({
      where: { id: previous.id },
      data: { active: true, rollbackReason: null },
    });
    const record = await tx.rollbackRecord.create({
      data: {
        workspaceId,
        deploymentCandidateId: candidateId,
        agentDeploymentId: current.id,
        rollbackReason: reason,
        rollbackPerformedBy: actorId,
      },
    });
    await tx.deploymentCandidate.update({
      where: { id: candidateId },
      data: {
        status: 'ROLLED_BACK',
        rolledBackAt: new Date(),
        rollbackRecordId: record.id,
      },
    });
    await tx.auditLog.create({
      data: {
        workspaceId,
        userId: actorId,
        action: 'ROLLBACK',
        entityType: 'DEPLOYMENT_CANDIDATE',
        entityId: candidateId,
        metadata: {
          rollbackRecordId: record.id,
          restoredDeploymentId: restoredDeployment.id,
          restoredAgentVersionId: restoredDeployment.agentVersionId,
          reason,
        },
      },
    });
    return restoredDeployment;
  });
  if (!restored) {
    return {
      ok: false,
      code: 'CONFLICT',
      message: 'Deployment changed before rollback completed.',
    };
  }
  return {
    ok: true,
    data: {
      candidateId,
      restoredDeploymentId: restored.id,
      status: 'ROLLED_BACK',
    },
  };
}
