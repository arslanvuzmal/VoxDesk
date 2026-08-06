import { OrganizationProfile, SupportedLanguage } from "../types";
import { BusinessTrainingPack } from "../training-pack";

export const legalTrainingPack: BusinessTrainingPack = {
  business: {
    id: "biz-northstar-legal",
    name: "Northstar Legal Consultations",
    industry: "Legal Services & Corporate Advocacy",
    presetKey: "LEGAL",
    tagline: "Professional legal consultation intake & case qualification",
    description:
      "Specialized law practice handling corporate litigation, contract disputes, intellectual property, and estate planning.",
    timeZone: "America/New_York",
    primaryPhone: "+1 (212) 555-0188",
    primaryEmail: "intake@northstarlegal.demo",
    website: "https://northstarlegal.demo",
  },
  voice: {
    provider: "ELEVENLABS",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    displayName: "Maya",
    supportedLanguages: ["en-US", "ur-PK", "es-ES"],
    modelId: "eleven_flash_v2_5",
    stability: 0.4,
    similarityBoost: 0.85,
    style: 0.25,
    speed: 0.98,
    useSpeakerBoost: true,
    speakingStyle:
      "Mature, calm, warm and professional receptionist voice. Patient, attentive, concise, calm during emergency escalation.",
  },
  services: [
    {
      id: "srv-corp",
      name: "Corporate & Business Litigation",
      category: "Litigation",
      description:
        "Contractual disputes, partner disagreements, and regulatory compliance.",
      durationMinutes: 45,
      requiresConsultation: true,
    },
    {
      id: "srv-ip",
      name: "Intellectual Property & Trademarks",
      category: "IP Law",
      description:
        "Trademark registration, patent enforcement, and copyright protection.",
      durationMinutes: 45,
      requiresConsultation: true,
    },
    {
      id: "srv-estate",
      name: "Estate Planning & Wealth Protection",
      category: "Estate Planning",
      description:
        "Wills, trusts, probate administration, and asset shielding.",
      durationMinutes: 45,
      requiresConsultation: true,
    },
  ],
  locations: [
    {
      id: "loc-ny-main",
      name: "Northstar Legal HQ",
      address: "500 Fifth Avenue, Suite 2400",
      city: "New York",
      state: "NY",
      zip: "10110",
      timeZone: "America/New_York",
      isPrimary: true,
    },
  ],
  workingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    openTime: "08:30",
    closeTime: "18:00",
    timeZone: "America/New_York",
    afterHoursPolicy:
      "24/7 Voice Receptionist active for new consultation intake and emergency case escalation.",
    holidays: [
      "New Year's Day",
      "Memorial Day",
      "Independence Day",
      "Labor Day",
      "Thanksgiving",
      "Christmas",
    ],
  },
  pricing: [
    {
      serviceId: "srv-corp",
      pricingType: "FIXED",
      amount: 250,
      currency: "USD",
      description:
        "Initial 45-minute strategy consultation fee ($250). Fee is credited toward retainer if case is engaged.",
      disclaimer:
        "Formal retainer agreement required for ongoing legal representation.",
    },
  ],
  policies: [
    {
      id: "pol-cancellation",
      title: "Cancellation Policy",
      category: "Client Policies",
      content:
        "Consultations may be rescheduled or cancelled without fee up to 24 hours prior to scheduled appointment time.",
    },
    {
      id: "pol-conflict",
      title: "Conflict of Interest Policy",
      category: "Compliance",
      content:
        "All new client inquiries undergo a mandatory adverse-party conflict check prior to attorney engagement.",
    },
  ],
  faq: [
    {
      id: "know-legal-hours",
      category: "Hours & Location",
      keywords: [
        "hours",
        "open",
        "time",
        "office hours",
        "schedule",
        "location",
        "address",
      ],
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
      id: "know-legal-location",
      category: "Hours & Location",
      keywords: [
        "location",
        "address",
        "where",
        "office",
        "located",
        "suite",
        "avenue",
      ],
      question: "Where is your office located?",
      answer: {
        "en-US":
          "Our headquarters is located at 500 Fifth Avenue, Suite 2400, New York, NY 10110.",
        "ur-PK":
          "ہمارا ہیڈ کوارٹر 500 ففتھ ایونیو، سویٹ 2400، نیویارک میں واقع ہے۔",
        "es-ES":
          "Nuestra sede central está ubicada en 500 Fifth Avenue, Suite 2400, Nueva York, NY 10110.",
      },
      citation: "Northstar Legal Directory 2026",
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
        "much",
      ],
      question: "How much is an initial consultation?",
      answer: {
        "en-US":
          "Initial strategy consultations are $250 for up to 45 minutes. If your case is accepted and retainer signed, the fee is credited toward your retainer balance.",
        "ur-PK": "ابتدائی حکمت عملی کی مشاورت 45 منٹ کے لیے $250 ہے۔",
        "es-ES":
          "La consulta inicial de estrategia cuesta $250 por hasta 45 minutos.",
      },
      citation: "Northstar Billing Terms Sec 3.1",
    },
    {
      id: "know-legal-fee-refundable",
      category: "Pricing & Billing",
      keywords: ["refundable", "refund", "credit", "retainer fee"],
      question: "Is the consultation fee refundable?",
      answer: {
        "en-US":
          "The $250 consultation fee is non-refundable, but it is credited 100% toward your legal retainer balance if you engage our firm.",
        "ur-PK": "کنسلٹیشن فیس واپس نہیں ہوتی مگر ریٹینر میں شامل ہو جاتی ہے۔",
        "es-ES":
          "La tarifa de consulta de $250 no es reembolsable, pero se acredita al 100% a su saldo de honorarios.",
      },
      citation: "Northstar Billing Terms Sec 3.2",
    },
    {
      id: "know-legal-cancellation",
      category: "Policies",
      keywords: [
        "cancel",
        "reschedule",
        "cancellation",
        "change time",
        "policy",
      ],
      question: "What is your cancellation policy?",
      answer: {
        "en-US":
          "You may reschedule or cancel your consultation without charge up to 24 hours prior to your scheduled time.",
        "ur-PK":
          "آپ بغیر کسی چارج کے 24 گھنٹے پہلے تک ٹائم تبدیل یا منسوخ کر سکتے ہیں۔",
        "es-ES":
          "Puede reprogramar o cancelar su consulta sin cargo hasta 24 horas antes.",
      },
      citation: "Client Services Agreement Sec 4",
    },
    {
      id: "know-legal-corp-litigation",
      category: "Services",
      keywords: [
        "corporate",
        "litigation",
        "business",
        "contract",
        "dispute",
        "partner",
      ],
      question: "Do you handle corporate litigation?",
      answer: {
        "en-US":
          "Yes, our corporate litigation team handles contract disputes, shareholder disagreements, breach of fiduciary duty, and commercial arbitration.",
        "ur-PK":
          "جی ہاں، ہماری کارپوریٹ لٹیگیشن ٹیم کاروباری تنازعات سنبھالتی ہے۔",
        "es-ES":
          "Sí, nuestro equipo de litigios corporativos maneja disputas contractuales y societarias.",
      },
      citation: "Northstar Practice Group Index",
    },
    {
      id: "know-legal-ip-trademarks",
      category: "Services",
      keywords: [
        "patent",
        "trademark",
        "copyright",
        "intellectual",
        "ip",
        "registration",
      ],
      question: "Do you handle patent and trademark registration?",
      answer: {
        "en-US":
          "Yes, we specialize in federal trademark prosecution, patent portfolio management, copyright protection, and licensing agreements.",
        "ur-PK": "جی ہاں، ہم ٹریڈ مارک اور پیٹنٹ کی رجسٹریشن سنبھالتے ہیں۔",
        "es-ES":
          "Sí, nos especializamos en registro de marcas comerciales y patentes.",
      },
      citation: "Northstar IP Practice Guide",
    },
    {
      id: "know-legal-estate-planning",
      category: "Services",
      keywords: ["estate", "wills", "trusts", "probate", "wealth", "asset"],
      question: "Do you handle estate planning and wills?",
      answer: {
        "en-US":
          "Yes, we draft comprehensive wills, revocable living trusts, powers of attorney, healthcare proxies, and asset protection plans.",
        "ur-PK": "جی ہاں، ہم وصیت اور ٹرسٹ کے تمام قانونی امور انجام دیتے ہیں۔",
        "es-ES":
          "Sí, preparamos testamentos, fideicomisos y planes de protección de activos.",
      },
      citation: "Northstar Estate Group Guide",
    },
    {
      id: "know-legal-days-open",
      category: "Hours & Location",
      keywords: [
        "days",
        "week",
        "open",
        "monday",
        "friday",
        "saturday",
        "weekend",
      ],
      question: "What days of the week are you open?",
      answer: {
        "en-US":
          "We are open Monday through Friday for in-office and virtual consultations. Our voice receptionist handles intake 24/7.",
        "ur-PK": "ہم پیر سے جمعہ دفتر میں مشاورت کے لیے کھلے رہتے ہیں۔",
        "es-ES":
          "Abrimos de lunes a viernes para consultas presenciales y virtuales.",
      },
      citation: "Northstar Operating Schedule",
    },
    {
      id: "know-legal-friday-close",
      category: "Hours & Location",
      keywords: ["close", "friday", "time", "closing"],
      question: "What time do you close on Friday?",
      answer: {
        "en-US":
          "Our physical office closes at 6:00 PM Eastern Time on Fridays.",
        "ur-PK": "ہمارا دفتر جمعہ کو شام 6:00 بجے بند ہوتا ہے۔",
        "es-ES": "Nuestra oficina física cierra a las 6:00 PM los viernes.",
      },
      citation: "Northstar Operating Schedule",
    },
    {
      id: "know-legal-conflict-check",
      category: "Policies",
      keywords: [
        "conflict",
        "interest",
        "check",
        "adverse",
        "party",
        "opposing",
      ],
      question: "Do you have a conflict of interest check policy?",
      answer: {
        "en-US":
          "Yes. Before scheduling or accepting any client matter, we conduct a mandatory adverse-party conflict check to protect confidentiality.",
        "ur-PK": "جی ہاں، ہم تمام نئے معاملات سے پہلے تصدیق کرتے ہیں۔",
        "es-ES":
          "Sí, realizamos una verificación obligatoria de conflicto de intereses.",
      },
      citation: "Northstar Compliance Policy Sec 2",
    },
    {
      id: "know-legal-send-docs",
      category: "Intake",
      keywords: [
        "send",
        "court",
        "documents",
        "email",
        "mail",
        "files",
        "submit",
      ],
      question: "Where should I send court documents?",
      answer: {
        "en-US":
          "You can securely email court documents to intake@northstarlegal.demo or upload them through our client portal after your initial intake.",
        "ur-PK": "آپ اپنے برقی دستاویزات ہمارے ای میل پر بھیج سکتے ہیں۔",
        "es-ES":
          "Puede enviar documentos judiciales a intake@northstarlegal.demo.",
      },
      citation: "Northstar Intake Document Guide",
    },
    {
      id: "know-legal-phone",
      category: "Contact",
      keywords: ["phone", "number", "call", "contact", "telephone"],
      question: "What is your phone number?",
      answer: {
        "en-US": "Our primary office phone number is +1 (212) 555-0188.",
        "ur-PK": "ہمارا مرکزی فون نمبر +1 (212) 555-0188 ہے۔",
        "es-ES": "Nuestro número de teléfono principal es +1 (212) 555-0188.",
      },
      citation: "Northstar Directory",
    },
    {
      id: "know-legal-emergency-contact",
      category: "Emergency",
      keywords: ["emergency", "escalation", "urgent", "after-hours", "contact"],
      question: "What is your emergency escalation contact?",
      answer: {
        "en-US":
          "For emergency legal court orders or arrests, our on-call escalation number is +1 (800) 555-0199.",
        "ur-PK": "ہنگامی قانونی امور کے لیے ہمارا نمبر +1 (800) 555-0199 ہے۔",
        "es-ES":
          "Para emergencias judiciales, nuestro teléfono de guardia es +1 (800) 555-0199.",
      },
      citation: "Northstar Emergency Protocol",
    },
    {
      id: "know-legal-managing-partner",
      category: "Staff",
      keywords: [
        "partner",
        "managing",
        "attorney",
        "on-call",
        "director",
        "who",
      ],
      question: "Who is your managing partner on call?",
      answer: {
        "en-US":
          "Our Senior Managing Partner On-Call leads urgent escalations and strategy reviews.",
        "ur-PK": "ہمارے سینئر منیجنگ پارٹنر ہنگامی جائزہ لیتے ہیں۔",
        "es-ES":
          "Nuestro socio director sénior de guardia supervisa las escalaciones urgentes.",
      },
      citation: "Northstar Leadership Directory",
    },
    {
      id: "know-legal-credit-retainer",
      category: "Pricing & Billing",
      keywords: ["credit", "retainer", "fees", "deduct", "balance"],
      question: "Do you credit consultation fees toward retainers?",
      answer: {
        "en-US":
          "Yes! The full $250 initial consultation fee is credited directly toward your retainer balance upon signing an engagement agreement.",
        "ur-PK": "جی ہاں، $250 فیس ریٹینر کی رقم میں سے وضع کر دی جاتی ہے۔",
        "es-ES":
          "¡Sí! La tarifa de consulta de $250 se abona directamente a su saldo de honorarios.",
      },
      citation: "Northstar Billing Terms Sec 3.3",
    },
    {
      id: "know-legal-advance-booking",
      category: "Scheduling",
      keywords: ["advance", "far", "schedule", "book", "days", "calendar"],
      question: "How far in advance can I book?",
      answer: {
        "en-US":
          "Consultations can be booked up to 14 days in advance, with same-day emergency slots reserved daily.",
        "ur-PK": "آپ 14 دن پہلے تک بکنگ کر سکتے ہیں۔",
        "es-ES":
          "Las consultas se pueden agendar con hasta 14 días de anticipación.",
      },
      citation: "Northstar Scheduling Rules",
    },
    {
      id: "know-legal-small-business",
      category: "Services",
      keywords: [
        "small business",
        "services",
        "startup",
        "corporate",
        "agreements",
      ],
      question: "What services do you provide for small businesses?",
      answer: {
        "en-US":
          "We provide entity formation, commercial contract drafting, employment agreements, regulatory compliance audits, and litigation defense.",
        "ur-PK": "ہم چھوٹے کاروباروں کے لیے تمام قانونی خدمات فراہم کرتے ہیں۔",
        "es-ES":
          "Brindamos constitución de empresas, contratos comerciales y defensa de litigios.",
      },
      citation: "Northstar Business Services Guide",
    },
    {
      id: "know-legal-reschedule",
      category: "Scheduling",
      keywords: ["reschedule", "change date", "move appointment", "time"],
      question: "Can I reschedule a consultation?",
      answer: {
        "en-US":
          "Yes, you can reschedule your consultation free of charge up to 24 hours before your appointment time.",
        "ur-PK": "جی ہاں، آپ 24 گھنٹے پہلے مفت وقت تبدیل کر سکتے ہیں۔",
        "es-ES":
          "Sí, puede reprogramar su consulta sin costo hasta 24 horas antes.",
      },
      citation: "Northstar Client Services Policy",
    },
    {
      id: "know-legal-afterhours-calls",
      category: "Hours & Location",
      keywords: [
        "after-hours",
        "night",
        "weekend",
        "voice",
        "receptionist",
        "24/7",
      ],
      question: "Are after-hours voice calls answered?",
      answer: {
        "en-US":
          "Yes! Our AI voice receptionist is active 24/7 to answer approved business questions, collect intake information, and route emergency calls.",
        "ur-PK": "جی ہاں! ہمارا صوتی معاون 24/7 فعال رہتا ہے۔",
        "es-ES": "¡Sí! Nuestra recepcionista de voz de IA está activa 24/7.",
      },
      citation: "Northstar 24/7 Service Policy",
    },
  ],
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
      options: ["Corporate Litigation", "IP & Trademarks", "Estate Planning"],
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
      options: ["Standard", "Urgent Court Hearing", "Emergency Subpoena/Order"],
    },
  ],
  qualificationPolicy: {
    enabled: true,
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
    thresholds: {
      hot: 75,
      warm: 45,
      review: 20,
    },
  },
  appointmentPolicy: {
    enabled: true,
    slotDurationMinutes: 45,
    advanceNoticeHours: 24,
    maxDaysInAdvance: 14,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    timeZone: "America/New_York",
  },
  escalationPolicy: {
    enabled: true,
    destinationDepartment: "Senior Managing Partner On-Call",
    destinationPhone: "+1 (800) 555-0199",
    destinationEmail: "urgent@northstarlegal.demo",
    triggers: [
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
  },
  restrictedTopics: [
    {
      id: "res-substantive-advice",
      topic: "Providing substantive legal advice on ongoing cases",
      reason:
        "Administrative intake receptionists cannot issue formal legal opinions or legal counsel without an executed engagement contract.",
      mandatoryRefusal: {
        "en-US":
          "I cannot provide substantive legal advice or predict specific legal outcomes on this call. As an administrative voice receptionist, I can collect your details and schedule a formal consultation with one of our senior attorneys.",
        "ur-PK":
          "میں اس کال پر کوئی حتمی قانونی مشورہ یا مقدمے کے نتیجے کی ضمانت نہیں دے سکتی۔ بطور انتظامی صوتی معاون، میں آپ کی تفصیلات درج کر کے ہمارے سینئر وکیل کے ساتھ کنسلٹیشن بک کر سکتی ہوں۔",
        "es-ES":
          "No puedo brindar asesoramiento legal sustantivo ni predecir resultados específicos en esta llamada. Como recepcionista administrativa de voz, puedo registrar sus datos y agendar una consulta formal con un abogado sénior.",
      },
    },
    {
      id: "res-evade-law",
      topic: "Advising how to evade law enforcement or legal obligations",
      reason:
        "Ethical rules forbid assisting in unlawful or fraudulent activity.",
      mandatoryRefusal: {
        "en-US":
          "Northstar Legal cannot provide advice on circumventing legal obligations or evading law enforcement.",
        "ur-PK":
          "نارتھ اسٹار قانونی ذمہ داریوں سے بچنے کے بارے میں کوئی مشورہ نہیں دے سکتا۔",
        "es-ES":
          "Northstar Legal no puede brindar asesoramiento sobre cómo eludir obligaciones legales.",
      },
    },
  ],
  requiredDisclaimers: [
    {
      id: "disc-intake",
      category: "Administrative Representation Notice",
      text: {
        "en-US":
          "Notice: VoxDesk AI provides administrative intake assistance. Information exchanged during this call does not constitute legal representation or establish an attorney-client relationship until a formal retainer is signed.",
        "ur-PK":
          "توجہ فرمائیں: یہ صوتی معاون صرف معلوماتی اور دفتری مقاصد کے لیے ہے۔ رسمی معاہدے کے بغیر اس گفتگو سے کوئی قانون دان اور کلائنٹ کا رشتہ قائم نہیں ہوتا۔",
        "es-ES":
          "Aviso: Este asistente brinda ayuda administrativa de admisión. La información compartida no constituye representación legal ni crea una relación abogado-cliente sin un contrato firmado.",
      },
      mandatoryPosition: "GREETING",
    },
  ],
  pronunciationDictionary: [
    {
      term: "Northstar",
      phonetic: "NORTH-star",
      language: "en-US",
    },
    {
      term: "Probate",
      phonetic: "PRO-bait",
      language: "en-US",
    },
    {
      term: "Subpoena",
      phonetic: "suh-PEE-nuh",
      language: "en-US",
    },
  ],
  knowledgeSources: [
    {
      id: "src-office-guide",
      title: "Northstar Legal Office & Consultation Guide 2026",
      type: "STRUCTURED_FAQ",
      indexedAt: "2026-08-01T00:00:00Z",
      version: "2.5.0",
    },
    {
      id: "src-billing-terms",
      title: "Northstar Client Billing & Retainer Agreement Standard Terms",
      type: "PDF",
      sourceUrlOrPath: "/docs/northstar-billing-2026.pdf",
      indexedAt: "2026-08-01T00:00:00Z",
      version: "1.0.0",
    },
  ],
  supportedLanguages: ["en-US", "ur-PK", "es-ES"],
  version: "2.5.0",
  effectiveFrom: "2026-08-01",
};

export const legalPreset: OrganizationProfile = {
  id: "preset-legal",
  presetKey: "LEGAL",
  name: legalTrainingPack.business.name,
  industry: legalTrainingPack.business.industry,
  tagline: legalTrainingPack.business.tagline,
  description: legalTrainingPack.business.description,
  timeZone: legalTrainingPack.business.timeZone,
  workingHours: {
    days: "Monday through Friday",
    hours: "8:30 AM to 6:00 PM EST",
    afterHoursPolicy: legalTrainingPack.workingHours.afterHoursPolicy,
  },
  supportedLanguages: legalTrainingPack.supportedLanguages,
  defaultLanguage: "en-US",
  voiceIdentity: {
    name: legalTrainingPack.voice.displayName,
    gender: "female",
    accent: "North American Sweet & Professional Sales Specialist",
    defaultTone: "WARM_SALES",
  },
  greetings: {
    "en-US":
      "Hi there! Thank you so much for calling Northstar Legal Consultations. My name is Maya! 😊 I would be delighted to help you schedule your consultation or answer any legal questions today. How may I assist you?",
    "ur-PK":
      "نارتھ اسٹار لیگل کنسلٹیشنز میں کال کرنے کا شکریہ! میں مایا ہوں۔ میں آپ کے لیے لیگل کنسلٹیشن شیڈول کرنے یا کسی بھی سوال کا جواب دینے کے لیے حاضر ہوں۔",
    "es-ES":
      "¡Hola! Muchas gracias por llamar a Consultas Legales Northstar. Mi nombre es Maya. 😊 Me encantará ayudarle a agendar su consulta o responder sus preguntas legales hoy. ¿Cómo puedo ayudarle?",
  },
  services: legalTrainingPack.services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
  })),
  approvedKnowledge: legalTrainingPack.faq.map((f) => ({
    id: f.id,
    category: f.category,
    keywords: f.keywords,
    question: f.question,
    answer: f.answer as Record<SupportedLanguage, string>,
    citation: f.citation,
  })),
  restrictedTopics: legalTrainingPack.restrictedTopics.map((r) => r.topic),
  complianceDisclaimer: legalTrainingPack.requiredDisclaimers[0].text as Record<
    SupportedLanguage,
    string
  >,
  requiredIntakeFields: legalTrainingPack.requiredIntakeFields.map((f) => ({
    key: f.key,
    label: f.label,
    required: f.required,
    type: f.type,
    description: f.description,
  })),
  qualificationRules: {
    criteria: legalTrainingPack.qualificationPolicy.criteria,
    scoreThresholds: legalTrainingPack.qualificationPolicy.thresholds,
  },
  escalationTriggers: legalTrainingPack.escalationPolicy.triggers,
  escalationDestination: {
    department: legalTrainingPack.escalationPolicy.destinationDepartment,
    phone: legalTrainingPack.escalationPolicy.destinationPhone,
    email: legalTrainingPack.escalationPolicy.destinationEmail,
  },
  appointmentSettings: {
    slotDurationMinutes:
      legalTrainingPack.appointmentPolicy.slotDurationMinutes,
    advanceNoticeHours: legalTrainingPack.appointmentPolicy.advanceNoticeHours,
    availableDays: legalTrainingPack.appointmentPolicy.availableDays,
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
