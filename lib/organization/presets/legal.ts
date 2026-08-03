import { OrganizationProfile } from "../types";

export const legalPreset: OrganizationProfile = {
  id: "preset-legal",
  presetKey: "LEGAL",
  name: "Northstar Legal Consultations",
  industry: "Legal Services & Corporate Advocacy",
  tagline: "Professional legal consultation intake & case qualification",
  description:
    "Specialized law practice handling corporate litigation, contract disputes, intellectual property, and estate planning.",
  timeZone: "America/New_York",
  workingHours: {
    days: "Monday through Friday",
    hours: "8:30 AM to 6:00 PM EST",
    afterHoursPolicy:
      "24/7 Voice Receptionist active for new consultation intake and emergency case escalation.",
  },
  supportedLanguages: ["en-US", "ur-PK", "es-ES"],
  defaultLanguage: "en-US",
  voiceIdentity: {
    name: "Maya",
    gender: "female",
    accent: "North American Business",
    defaultTone: "PROFESSIONAL",
  },
  greetings: {
    "en-US":
      "Thank you for calling Northstar Legal Consultations. My name is Maya. How may I assist with your legal matter today?",
    "ur-PK":
      "نارتھ اسٹار لیگل کنسلٹیشنز میں کال کرنے کا شکریہ। میں مایا ہوں۔ آج میں آپ کے قانونی معاملے میں کس طرح مدد کر سکتی ہوں؟",
    "es-ES":
      "Gracias por llamar a Consultas Legales Northstar. Mi nombre es Maya. ¿Cómo puedo ayudarle con su asunto legal hoy?",
  },
  services: [
    {
      id: "srv-corp",
      name: "Corporate & Business Litigation",
      description:
        "Contractual disputes, partner disagreements, and regulatory compliance.",
    },
    {
      id: "srv-ip",
      name: "Intellectual Property & Trademarks",
      description:
        "Trademark registration, patent enforcement, and copyright protection.",
    },
    {
      id: "srv-estate",
      name: "Estate Planning & Wealth Protection",
      description:
        "Wills, trusts, probate administration, and asset shielding.",
    },
  ],
  approvedKnowledge: [
    {
      id: "know-legal-hours",
      category: "Hours & Location",
      keywords: ["hours", "open", "time", "location", "address", "office"],
      question: "What are your office hours and location?",
      answer: {
        "en-US":
          "Our main office is located at 500 Fifth Avenue, Suite 2400, New York. We are open Monday through Friday from 8:30 AM to 6:00 PM Eastern Time.",
        "ur-PK":
          "ہمارا مرکزی دفتر 500 ففتھ ایونیو، سویٹ 2400، نیویارک میں واقع ہے۔ ہم پیر سے جمعہ صبح 8:30 سے شام 6:00 بجے تک کھلے رہتے ہیں۔",
        "es-ES":
          "Nuestra oficina principal está en 500 Fifth Avenue, Suite 2400, Nueva York. Abrimos de lunes a viernes de 8:30 AM a 6:00 PM hora del Este.",
      },
      citation: "Northstar Legal Office Guide 2026",
    },
    {
      id: "know-legal-consultation-fee",
      category: "Pricing & Billing",
      keywords: [
        "fee",
        "cost",
        "price",
        "charge",
        "consultation fee",
        "retainer",
      ],
      question: "How much is an initial legal consultation?",
      answer: {
        "en-US":
          "Initial strategy consultations are $250 for up to 45 minutes. If your case is accepted and retainer signed, the fee is credited toward your retainer balance.",
        "ur-PK":
          "ابتدائی حکمت عملی کی مشاورت 45 منٹ کے لیے $250 ہے۔ اگر آپ کا کیس قبول ہو جاتا ہے، تو یہ فیس آپ کے ریٹینر میں شامل کر دی جاتی ہے۔",
        "es-ES":
          "La consulta inicial de estrategia cuesta $250 por hasta 45 minutos. Si se acepta su caso y se firma el contrato, esa tarifa se abona a su saldo.",
      },
      citation: "Northstar Billing Terms Sec 3.1",
    },
    {
      id: "know-legal-cancellation",
      category: "Policies",
      keywords: ["cancel", "reschedule", "cancellation", "change time"],
      question: "What is your cancellation and rescheduling policy?",
      answer: {
        "en-US":
          "You may reschedule or cancel your consultation without charge up to 24 hours prior to your scheduled time.",
        "ur-PK":
          "آپ بغیر کسی اضافی چارج کے اپنی ملاقات سے 24 گھنٹے پہلے تک ٹائم تبدیل یا منسوخ کر سکتے ہیں۔",
        "es-ES":
          "Puede reprogramar o cancelar su consulta sin cargo hasta 24 horas antes de la hora programada.",
      },
      citation: "Client Services Agreement Sec 4",
    },
  ],
  restrictedTopics: [
    "Providing definitive legal advice on ongoing cases",
    "Guaranteeing lawsuit trial outcomes or specific damage awards",
    "Advising how to bypass law enforcement or statutory requirements",
  ],
  complianceDisclaimer: {
    "en-US":
      "Notice: VoxDesk AI provides administrative intake assistance. Information exchanged during this call does not constitute legal representation or establish an attorney-client relationship until a formal retainer is signed.",
    "ur-PK":
      "توجہ فرمائیں: یہ صوتی معاون صرف معلوماتی اور دفتری مقاصد کے لیے ہے۔ رسمی معاہدے کے بغیر اس گفتگو سے کوئی قانون دان اور کلائنٹ کا رشتہ قائم نہیں ہوتا۔",
    "es-ES":
      "Aviso: Este asistente brinda ayuda administrativa de admisión. La información compartida no constituye representación legal ni crea una relación abogado-cliente sin un contrato firmado.",
  },
  requiredIntakeFields: [
    {
      key: "fullName",
      label: "Full Name",
      required: true,
      type: "text",
      description: "Caller's first and last name",
    },
    {
      key: "contactPhone",
      label: "Phone Number",
      required: true,
      type: "phone",
      description: "Direct callback phone number",
    },
    {
      key: "legalCategory",
      label: "Legal Category",
      required: true,
      type: "select",
      description: "Corporate, IP, Litigation, or Estate",
    },
    {
      key: "opposingParty",
      label: "Opposing Party / Company",
      required: false,
      type: "text",
      description: "Name of adverse company or individual for conflict check",
    },
    {
      key: "urgencyLevel",
      label: "Urgency Level",
      required: true,
      type: "select",
      description: "Immediate court deadline vs general planning",
    },
  ],
  qualificationRules: {
    criteria: [
      {
        id: "crit-budget",
        name: "Retainer & Budget Fit",
        weight: 30,
        condition:
          "Caller demonstrates budget for commercial legal retainers (>=$5,000).",
        scoringGuide:
          "30 pts for commercial budget, 15 pts for standard, 0 for pro-bono only.",
      },
      {
        id: "crit-commercial",
        name: "Commercial / Case Substance",
        weight: 30,
        condition:
          "Substantial business, IP dispute, or complex litigation contract.",
        scoringGuide:
          "30 pts for clear commercial dispute or corporate matter.",
      },
      {
        id: "crit-timeline",
        name: "Timeline & Court Deadlines",
        weight: 25,
        condition:
          "Upcoming hearing or pending filing deadline within 14 days.",
        scoringGuide:
          "25 pts for urgent/active matter, 15 pts for planning within 30 days.",
      },
      {
        id: "crit-authority",
        name: "Decision Authority",
        weight: 15,
        condition:
          "Caller is business owner, CEO, managing director, or executive.",
        scoringGuide:
          "15 pts for direct officer/owner, 10 pts for authorized employee.",
      },
    ],
    scoreThresholds: {
      hot: 75,
      warm: 45,
      review: 20,
    },
  },
  escalationTriggers: [
    {
      id: "trig-court-order",
      condition:
        "Caller mentions active injunction, subpoena, or emergency court order today",
      reason:
        "Immediate legal court deadline requires emergency attorney response",
      urgency: "CRITICAL",
    },
    {
      id: "trig-law-enforcement",
      condition:
        "Caller mentions law enforcement search warrant or regulatory raid",
      reason: "Urgent criminal / regulatory compliance emergency",
      urgency: "CRITICAL",
    },
  ],
  escalationDestination: {
    department: "Senior Managing Partner On-Call",
    phone: "+1 (800) 555-0199",
    email: "urgent@northstarlegal.demo",
  },
  appointmentSettings: {
    slotDurationMinutes: 45,
    advanceNoticeHours: 24,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    sampleSlots: [
      "Tuesday 10:00 AM EST",
      "Tuesday 2:30 PM EST",
      "Wednesday 11:15 AM EST",
      "Thursday 3:00 PM EST",
    ],
  },
  crmPipelineStages: [
    "New Intake",
    "Conflict Check Pending",
    "Qualified Strategy Session",
    "Consultation Booked",
    "Retainer Sent",
    "Engaged Client",
    "Declined / Escalated",
  ],
  followUpPolicy:
    "Follow up within 2 business hours for HOT qualified leads, or within 24 hours for general enquiries.",
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
