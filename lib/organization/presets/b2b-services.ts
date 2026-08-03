import { OrganizationProfile } from "../types";

export const b2bServicesPreset: OrganizationProfile = {
  id: "preset-b2b-services",
  presetKey: "B2B_SERVICES",
  name: "Nexus Global B2B Software Solutions",
  industry: "B2B Enterprise SaaS & Cloud Technology",
  tagline:
    "High-value inbound B2B sales qualification & enterprise demo scheduling",
  description:
    "Enterprise AI software provider specializing in cloud data pipeline orchestration, workflow automation, and custom API integrations for mid-market and Fortune 500 teams.",
  timeZone: "America/New_York",
  workingHours: {
    days: "Monday through Friday",
    hours: "8:00 AM to 7:00 PM EST",
    afterHoursPolicy:
      "24/7 AI Voice Sales Receptionist capturing enterprise inbound leads and scheduling executive product walkthroughs.",
  },
  supportedLanguages: ["en-US", "ur-PK", "es-ES"],
  defaultLanguage: "en-US",
  voiceIdentity: {
    name: "Alex",
    gender: "male",
    accent: "Tech Executive Professional",
    defaultTone: "CONFIDENT",
  },
  greetings: {
    "en-US":
      "Welcome to Nexus Global Software Solutions. My name is Alex. Are you exploring our enterprise AI automation platform for your engineering team today?",
    "ur-PK":
      "نیکسس گلوبل سافٹ ویئر سلوشنز میں خوش آمدید۔ میں الیکس ہوں۔ کیا آپ آج اپنی ٹیم کے لیے ہمارے انٹرپرائز صوتی پلیٹ فارم کو دیکھ رہے ہیں؟",
    "es-ES":
      "Bienvenido a Nexus Global Software Solutions. Mi nombre es Alex. ¿Está explorando nuestra plataforma empresarial de automatización hoy?",
  },
  services: [
    {
      id: "srv-enterprise-saas",
      name: "Enterprise Workflow Automation Platform",
      description:
        "Cloud-native event-driven workflow engine with SOC2 & HIPAA compliance.",
    },
    {
      id: "srv-data-integration",
      name: "Custom API & Cloud Data Connectors",
      description:
        "Managed data pipeline infrastructure connecting legacy databases to modern LLM endpoints.",
    },
    {
      id: "srv-support-plan",
      name: "24/7 Dedicated Solution Architect Support",
      description:
        "Dedicated TAMs, 99.99% uptime SLAs, and custom security review assistance.",
    },
  ],
  approvedKnowledge: [
    {
      id: "know-b2b-pricing",
      category: "Licensing & Tiers",
      keywords: [
        "pricing",
        "tiers",
        "cost",
        "per user",
        "enterprise tier",
        "contract",
      ],
      question: "How does your enterprise software licensing work?",
      answer: {
        "en-US":
          "We offer flexible tiering! Growth plans start at $1,500/month for up to 50 active workflows. Enterprise plans are customized based on concurrency volume, SSO/SAML integration, and dedicated SLA requirements.",
        "ur-PK":
          "ہماری گروتھ اسکیم $1,500 ماہانہ سے شروع ہوتی ہے۔ بڑے اداروں کے لیے کسٹم پلانز دستیاب ہیں۔",
        "es-ES":
          "Nuestros planes Growth comienzan en $1,500/mes para hasta 50 flujos. Los planes Enterprise son personalizados según el volumen y SLA.",
      },
      citation: "Nexus Enterprise Pricing Guide Q3 2026",
    },
    {
      id: "know-b2b-security",
      category: "Security & Compliance",
      keywords: [
        "soc2",
        "gdpr",
        "hipaa",
        "security",
        "encryption",
        "compliance",
        "iso",
      ],
      question: "Are your cloud services SOC2 Type II and HIPAA compliant?",
      answer: {
        "en-US":
          "Yes! Nexus platform holds independently audited SOC2 Type II certification, ISO 27001 compliance, HIPAA BAAs, and end-to-end AES-256 data encryption at rest and in transit.",
        "ur-PK":
          "جی ہاں! ہمارا پلیٹ فارم تصدیق شدہ SOC2 اور HIPAA معیار کی پاسداری کرتا ہے۔",
        "es-ES":
          "¡Sí! La plataforma posee certificación SOC2 Type II, cumplimiento ISO 27001, BAA de HIPAA y cifrado AES-256.",
      },
      citation: "Nexus Security & Trust Portal 2026",
    },
  ],
  restrictedTopics: [
    "Signing binding enterprise non-disclosure agreements (NDAs) over the phone",
    "Committing to custom engineering feature development without Solution Engineering review",
  ],
  complianceDisclaimer: {
    "en-US":
      "Notice: Nexus Software terms are governed by standard enterprise master service agreements.",
    "ur-PK":
      "توجہ فرمائیں: تمام نیکسس خدمات معیاری انٹرپرائز معاہدوں کے تحت دی جاتی ہیں۔",
    "es-ES":
      "Aviso: Los términos de Nexus están regidos por acuerdos marco de servicios empresariales.",
  },
  requiredIntakeFields: [
    {
      key: "fullName",
      label: "Full Name",
      required: true,
      type: "text",
      description: "Caller's full name",
    },
    {
      key: "workEmail",
      label: "Corporate Work Email",
      required: true,
      type: "email",
      description: "Business domain email address",
    },
    {
      key: "companyName",
      label: "Company Name",
      required: true,
      type: "text",
      description: "Name of organization",
    },
    {
      key: "teamSize",
      label: "Engineering / Operations Team Size",
      required: true,
      type: "select",
      description: "1-20, 20-100, 100-500, or 500+ employees",
    },
    {
      key: "estimatedBudget",
      label: "Annual Software Budget",
      required: true,
      type: "select",
      description: "Under $25k, $25k-$50k, $50k-$100k, $100k+",
    },
  ],
  qualificationRules: {
    criteria: [
      {
        id: "crit-company-size",
        name: "Enterprise Account Size & Employee Count",
        weight: 35,
        condition:
          "Company size > 100 employees or annual software budget > $50,000.",
        scoringGuide:
          "35 pts for >100 employees/$50k budget, 20 pts for mid-market (20-100 employees).",
      },
      {
        id: "crit-buyer-role",
        name: "Executive / Technical Decision Maker",
        weight: 30,
        condition:
          "Caller is VP Engineering, CTO, CIO, Chief Architect, or Operations Director.",
        scoringGuide:
          "30 pts for C-level/VP, 15 pts for Senior Engineering Manager.",
      },
      {
        id: "crit-implementation-timeline",
        name: "Target Deployment Timeline",
        weight: 20,
        condition: "Active project scheduled to launch within 60 days.",
        scoringGuide:
          "20 pts for <60 day timeline, 10 pts for general evaluation.",
      },
      {
        id: "crit-compliance-fit",
        name: "Security & Feature Fit",
        weight: 15,
        condition:
          "Requires standard cloud SaaS, SOC2 compliance, or existing API connector.",
        scoringGuide: "15 pts for standard enterprise alignment.",
      },
    ],
    scoreThresholds: {
      hot: 75,
      warm: 50,
      review: 25,
    },
  },
  escalationTriggers: [
    {
      id: "trig-fortune500",
      condition:
        "Caller from Fortune 500 enterprise with >$100k ARR potential requesting VP Sales",
      reason:
        "Strategic Tier-1 Enterprise Opportunity requiring immediate Account Executive handoff",
      urgency: "HIGH",
    },
  ],
  escalationDestination: {
    department: "VP of Enterprise Sales & Solutions",
    phone: "+1 (800) 555-0188",
    email: "enterprise@nexussoftware.demo",
  },
  appointmentSettings: {
    slotDurationMinutes: 45,
    advanceNoticeHours: 12,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    sampleSlots: [
      "Tomorrow at 10:00 AM EST",
      "Tomorrow at 2:00 PM EST",
      "Thursday at 11:30 AM EST",
      "Friday at 1:00 PM EST",
    ],
  },
  crmPipelineStages: [
    "Inbound MQL",
    "Technical Discovery Booked",
    "SQL / Qualified",
    "Demo Completed",
    "Security Review",
    "Proposal Sent",
    "Closed Won",
  ],
  followUpPolicy:
    "Dedicated Account Executive callback within 30 minutes for HOT qualified enterprise leads.",
  allowedBusinessActions: [
    "checkAvailability",
    "reserveAppointment",
    "scoreLead",
    "createLead",
    "updateLead",
    "prepareFollowUp",
    "prepareHandoff",
    "answerApprovedQuestion",
    "requestHumanReview",
    "completeCall",
  ],
};
