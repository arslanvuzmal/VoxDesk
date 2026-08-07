import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(
    "🌱 Seeding VoxDesk AI database with demo workspace 'Northstar Legal Consultations'..."
  );

  // 1. Create Default Owner User
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@northstarlegal.com' },
    update: {},
    create: {
      name: 'Arslan Vuzmal Lone',
      email: 'owner@northstarlegal.com',
      passwordHash: '$2a$10$e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // hashed fallback
      status: 'ACTIVE',
      systemRole: 'ADMIN',
    },
  });

  // 2. Create Fictional Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'northstar-legal' },
    update: {},
    create: {
      name: 'Northstar Legal Consultations',
      slug: 'northstar-legal',
      industry: 'Legal Services',
      timezone: 'America/New_York',
      plan: 'PRO',
      status: 'ACTIVE',
      members: {
        create: {
          userId: ownerUser.id,
          role: 'OWNER',
        },
      },
      businessProfile: {
        create: {
          businessName: 'Northstar Legal Consultations',
          description:
            'Premier commercial and corporate law practice offering contract review, litigation defense, and estate planning.',
          timezone: 'America/New_York',
          openingHours: {
            monday: '09:00 - 17:00',
            tuesday: '09:00 - 17:00',
            wednesday: '09:00 - 17:00',
            thursday: '09:00 - 17:00',
            friday: '09:00 - 17:00',
          },
          defaultLanguage: 'en-US',
        },
      },
    },
  });

  // 3. Create Voice Agent: Maya
  const agentMaya = await prisma.voiceAgent.create({
    data: {
      workspaceId: workspace.id,
      name: 'Maya — Reception & Appointments',
      description:
        'Inbound call receptionist handling FAQs, booking, rescheduling, and lead intake.',
      voiceProvider: 'DEMO',
      voiceId: 'demo-voice-maya',
      language: 'en-US',
      greeting:
        'Thank you for calling Northstar Legal Consultations. My name is Maya. How can I assist you today?',
      systemInstructions:
        'You are a professional AI legal receptionist. Answer approved FAQs, collect caller names, check calendar availability, and book appointments.',
    },
  });

  // 4. Create Voice Agent: Alex
  await prisma.voiceAgent.create({
    data: {
      workspaceId: workspace.id,
      name: 'Alex — Lead Qualification',
      description: 'Sales lead qualification voice agent executing BANT qualification scoring.',
      voiceProvider: 'DEMO',
      voiceId: 'demo-voice-alex',
      language: 'en-US',
      greeting:
        'Thank you for contacting Northstar Legal Commercial Practice. My name is Alex. May I ask what business legal services you are looking to retain?',
      systemInstructions:
        'Qualify commercial legal leads by assessing project scope, budget range, timeline, and decision authority.',
    },
  });

  // 5. Seed Initial Calls & Outcomes
  const call1 = await prisma.call.create({
    data: {
      workspaceId: workspace.id,
      agentId: agentMaya.id,
      provider: 'DEMO',
      direction: 'INBOUND',
      callerNumberMasked: '+1 (555) 019-2834',
      callerName: 'Sarah Miller',
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3600 * 1000),
      endedAt: new Date(Date.now() - 3480 * 1000),
      durationSeconds: 120,
      outcome: 'APPOINTMENT_SCHEDULED',
      qualificationCategory: 'HOT',
      qualificationScore: 85.0,
      summary: {
        create: {
          summary:
            'Caller Sarah Miller booked a legal consultation appointment for next Tuesday at 2:00 PM EST.',
          intent: 'Schedule Legal Consultation',
          sentiment: 'positive',
          urgency: 'high',
          actionItems: ['Dispatch calendar invite to sarah.miller@example.com'],
          commitments: ['Appointment confirmed for Tuesday 2:00 PM EST'],
        },
      },
      transcriptSegments: {
        create: [
          {
            speaker: 'agent',
            text: 'Thank you for calling Northstar Legal. My name is Maya. How can I help you?',
            startMs: 0,
            endMs: 4000,
          },
          {
            speaker: 'caller',
            text: 'Hi, I need to book a consultation next Tuesday afternoon.',
            startMs: 4500,
            endMs: 8000,
          },
          {
            speaker: 'agent',
            text: 'I can help with that! We have 2:00 PM EST available. Would that work?',
            startMs: 8500,
            endMs: 12000,
          },
          {
            speaker: 'caller',
            text: '2:00 PM EST is perfect.',
            startMs: 12500,
            endMs: 14500,
          },
        ],
      },
    },
  });

  // 6. Seed Lead Record
  await prisma.lead.create({
    data: {
      workspaceId: workspace.id,
      callId: call1.id,
      name: 'Sarah Miller',
      phoneEncrypted: '+15550192834',
      emailEncrypted: 'sarah.miller@example.com',
      company: 'Miller Miller LLP',
      serviceInterest: 'Commercial Contract Review',
      budgetRange: '$5,000 - $10,000',
      timeline: 'Immediate (This Week)',
      authority: 'Partner / Owner',
      urgency: 'High',
      score: 85.0,
      category: 'HOT',
      status: 'QUALIFIED',
    },
  });

  console.log('✅ Seed completed successfully for workspace:', workspace.name);
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
