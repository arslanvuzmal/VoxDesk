import { OrganizationProfile } from "../types";

export const realEstatePreset: OrganizationProfile = {
  id: "preset-real-estate",
  presetKey: "REAL_ESTATE",
  name: "Vanguard Realty & Property Management",
  industry: "Real Estate & Residential Property Sales",
  tagline:
    "24/7 Voice qualification for home buyers, sellers & listing enquiries",
  description:
    "Full-service residential brokerage and property management firm serving premium suburban and urban property markets.",
  timeZone: "America/Los_Angeles",
  workingHours: {
    days: "Monday through Sunday",
    hours: "8:00 AM to 8:00 PM PST",
    afterHoursPolicy:
      "Voice receptionist active 24/7 to capture property buyer inquiries, schedule private tours, and qualify sellers.",
  },
  supportedLanguages: ["en-US", "ur-PK", "es-ES"],
  defaultLanguage: "en-US",
  voiceIdentity: {
    name: "Maya",
    gender: "female",
    accent: "West Coast Sweet & Professional Sales Specialist",
    defaultTone: "WARM_SALES",
  },
  greetings: {
    "en-US":
      "Hi there! Welcome to Vanguard Realty. My name is Maya! 😊 Are you looking to tour one of our exclusive property listings or get a complimentary valuation on your home today?",
    "ur-PK":
      "وینگارڈ رئیلٹی میں خوش آمدید! میں مایا ہوں۔ کیا آپ کسی شاندار گھر کا جائزہ لینا چاہتے ہیں یا اپنے گھر کی قیمت کا اندازہ لگانا چاہتے ہیں؟",
    "es-ES":
      "¡Hola! Bienvenido a Vanguard Realty. Mi nombre es Maya. 😊 ¿Le gustaría visitar una de nuestras exclusivas propiedades o recibir una valoración gratuita de su casa hoy?",
  },
  services: [
    {
      id: "srv-home-tour",
      name: "Private Property Showing & Tour",
      description:
        "In-person or virtual guided property tours for qualified home buyers.",
    },
    {
      id: "srv-home-valuation",
      name: "Comparative Market Valuation & Home Listing",
      description:
        "Professional market valuation and listing strategy for home sellers.",
    },
    {
      id: "srv-property-mgmt",
      name: "Property Management & Tenant Placement",
      description:
        "Leasing, tenant screening, and maintenance management for property investors.",
    },
  ],
  approvedKnowledge: [
    {
      id: "know-realty-commission",
      category: "Commission & Fees",
      keywords: ["commission", "fee", "seller fee", "percentage", "cost"],
      question: "What is your listing agent commission structure?",
      answer: {
        "en-US":
          "Our full-service listing representation is competitive and negotiable based on price point, typically ranging between 4% to 5% split between buyer and seller brokers, including professional staging and photography.",
        "ur-PK":
          "ہماری کمیشن کی شرح 4% سے 5% تک ہے جس میں پیشہ ورانہ فوٹوگرافی شامل ہے۔",
        "es-ES":
          "Nuestra comisión de representación es competitiva, generalmente entre 4% y 5% dividido entre corredores, e incluye fotos profesionales.",
      },
      citation: "Vanguard Listing Agreement Standard Terms 2026",
    },
    {
      id: "know-realty-preapproval",
      category: "Buyer Requirements",
      keywords: [
        "preapproval",
        "mortgage",
        "loan",
        "financing",
        "down payment",
        "cash",
      ],
      question: "Do I need a mortgage pre-approval before booking a tour?",
      answer: {
        "en-US":
          "For luxury listings over $1M, seller instructions require a mortgage pre-approval letter or proof of funds prior to confirming a private showing.",
        "ur-PK":
          "$1M سے اوپر کی خریداریاں کرنے کے لیے مارٹگیج پری منظوری یا فنڈز کا ثبوت ضروری ہے۔",
        "es-ES":
          "Para propiedades de más de $1M, las instrucciones del vendedor requieren carta de preaprobación o prueba de fondos antes del recorrido.",
      },
      citation: "Vanguard Showing Policy Sec 2.4",
    },
  ],
  restrictedTopics: [
    "Steering or violating Fair Housing Act guidelines regarding demographic disclosures",
    "Guaranteeing specific home sale appreciation values or future market returns",
    "Advising on complex tax laws or legal title disputes without qualified attorney review",
  ],
  complianceDisclaimer: {
    "en-US":
      "Notice: Vanguard Realty fully complies with the Fair Housing Act and Equal Opportunity Housing laws.",
    "ur-PK":
      "توجہ فرمائیں: وینگارڈ رئیلٹی تمام فیئر ہاؤسنگ اور مساوی مواقع کے قوانین کی پاسداری کرتی ہے۔",
    "es-ES":
      "Aviso: Vanguard Realty cumple plenamente con la Ley de Vivienda Justa y las leyes de Igualdad de Oportunidades.",
  },
  requiredIntakeFields: [
    {
      key: "clientName",
      label: "Client Full Name",
      required: true,
      type: "text",
      description: "Caller's full name",
    },
    {
      key: "contactPhone",
      label: "Phone Number",
      required: true,
      type: "phone",
      description: "Primary contact phone",
    },
    {
      key: "intentType",
      label: "Buyer vs Seller",
      required: true,
      type: "select",
      description: "Buyer looking to tour vs Seller looking to list",
    },
    {
      key: "targetPropertyAddress",
      label: "Property Address or MLS #",
      required: false,
      type: "text",
      description: "Listing address of interest",
    },
    {
      key: "priceBudget",
      label: "Target Price / Budget",
      required: true,
      type: "number",
      description: "Approximate home price budget or target sale price",
    },
    {
      key: "financingStatus",
      label: "Financing Status",
      required: true,
      type: "select",
      description: "Pre-approved, Cash, or Needs Mortgage Referral",
    },
  ],
  qualificationRules: {
    criteria: [
      {
        id: "crit-budget-range",
        name: "Price Point & Commercial Viability",
        weight: 35,
        condition:
          "Target home budget > $600,000 or seller property value > $750,000.",
        scoringGuide:
          "35 pts for high-tier price point, 20 pts for standard market average.",
      },
      {
        id: "crit-preapproved",
        name: "Financial Readiness",
        weight: 30,
        condition:
          "Caller has active pre-approval letter or proof of liquid cash funds.",
        scoringGuide:
          "30 pts for verified pre-approval/cash, 15 pts for pending application.",
      },
      {
        id: "crit-buying-timeline",
        name: "Purchase / Sale Timeline",
        weight: 20,
        condition: "Planning to buy or list home within 30 days.",
        scoringGuide:
          "20 pts for immediate <30 day timeline, 10 pts for 60-90 day horizon.",
      },
      {
        id: "crit-representation",
        name: "Unrepresented Status",
        weight: 15,
        condition:
          "Not currently under exclusive buyer/seller representation contract.",
        scoringGuide:
          "15 pts for unrepresented lead ready for Vanguard agent agreement.",
      },
    ],
    scoreThresholds: {
      hot: 80,
      warm: 50,
      review: 25,
    },
  },
  escalationTriggers: [
    {
      id: "trig-high-value-seller",
      condition:
        "Seller with property valued over $2,000,000 requesting immediate listing agent",
      reason:
        "High-value luxury listing opportunity requires Senior Broker immediate callback",
      urgency: "HIGH",
    },
  ],
  escalationDestination: {
    department: "Luxury Listing Lead Broker",
    phone: "+1 (800) 555-0177",
    email: "luxury@vanguardrealty.demo",
  },
  appointmentSettings: {
    slotDurationMinutes: 60,
    advanceNoticeHours: 12,
    availableDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    sampleSlots: [
      "Saturday at 11:00 AM PST",
      "Saturday at 3:00 PM PST",
      "Sunday at 1:30 PM PST",
      "Monday at 4:00 PM PST",
    ],
  },
  crmPipelineStages: [
    "New Lead",
    "Pre-Approval Verified",
    "Private Tour Scheduled",
    "Listing Consultation",
    "Offer Submitted",
    "Under Contract",
    "Closed / Won",
  ],
  followUpPolicy:
    "Immediate SMS & Agent phone response within 15 minutes for pre-approved buyers and high-value sellers.",
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
