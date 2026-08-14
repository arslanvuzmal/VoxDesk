import 'server-only';

import { prisma } from '@/lib/database';

const DEMO_WORKSPACE_SLUG = 'demo-workspace';

/**
 * Creates only the configuration records required to persist a real Web Voice
 * conversation. It never creates calls, contacts, leads, metrics, or outcomes.
 */
export async function ensureDemoVoiceConfiguration(providerAgentId: string): Promise<{
  workspaceId: string;
  businessId: string;
  agentId: string;
}> {
  return prisma.$transaction(async tx => {
    const workspace = await tx.workspace.upsert({
      where: { slug: DEMO_WORKSPACE_SLUG },
      update: {
        name: 'Northstar Legal',
        industry: 'Legal Services',
        timezone: 'America/New_York',
        status: 'ACTIVE',
      },
      create: {
        name: 'Northstar Legal',
        slug: DEMO_WORKSPACE_SLUG,
        industry: 'Legal Services',
        timezone: 'America/New_York',
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    const business = await tx.businessProfile.upsert({
      where: { workspaceId: workspace.id },
      update: {
        businessName: 'Northstar Legal',
        description: 'Fictional legal-services workspace used for the VoxDesk portfolio demo.',
        timezone: 'America/New_York',
        defaultLanguage: 'en-US',
      },
      create: {
        workspaceId: workspace.id,
        businessName: 'Northstar Legal',
        description: 'Fictional legal-services workspace used for the VoxDesk portfolio demo.',
        timezone: 'America/New_York',
        defaultLanguage: 'en-US',
      },
      select: { id: true },
    });

    const existingAgent = await tx.voiceAgent.findFirst({
      where: {
        workspaceId: workspace.id,
        voiceProvider: 'ELEVENLABS',
      },
      select: { id: true },
    });

    const agent = existingAgent
      ? await tx.voiceAgent.update({
          where: { id: existingAgent.id },
          data: {
            businessProfileId: business.id,
            status: 'ACTIVE',
            voiceId: providerAgentId,
            language: 'en-US',
          },
          select: { id: true },
        })
      : await tx.voiceAgent.create({
          data: {
            workspaceId: workspace.id,
            businessProfileId: business.id,
            name: 'Maya — Reception and Intake',
            description: 'Professional reception, intake, scheduling, and escalation agent.',
            status: 'ACTIVE',
            voiceProvider: 'ELEVENLABS',
            voiceId: providerAgentId,
            language: 'en-US',
            greeting: 'Good afternoon, Northstar Legal. This is Maya. How can I help?',
            systemInstructions:
              'Use approved business context, collect one meaningful detail at a time, and request only authorized VoxDesk tools.',
          },
          select: { id: true },
        });

    return {
      workspaceId: workspace.id,
      businessId: business.id,
      agentId: agent.id,
    };
  });
}
