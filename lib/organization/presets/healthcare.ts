import { OrganizationProfile } from "../types";

export const healthcarePreset: OrganizationProfile = {
  id: "preset-healthcare",
  presetKey: "HEALTHCARE",
  name: "Apex Dental & Medical Center",
  industry: "Healthcare & Patient Care Services",
  tagline: "Intelligent patient scheduling, intake & urgent triage reception",
  description:
    "Comprehensive outpatient healthcare and dental clinic offering preventative care, restorative dentistry, and general family medicine.",
  timeZone: "America/Chicago",
  workingHours: {
    days: "Monday through Saturday",
    hours: "7:00 AM to 7:00 PM CST",
    afterHoursPolicy:
      "Automated voice receptionist active 24/7 for appointment scheduling, rescheduling, and urgent dental pain triage.",
  },
  supportedLanguages: ["en-US", "ur-PK", "es-ES"],
  defaultLanguage: "en-US",
  voiceIdentity: {
    name: "Maya",
    gender: "female",
    accent: "Warm Professional Patient Intake & Sales Specialist",
    defaultTone: "WARM_SALES",
  },
  greetings: {
    "en-US":
      "Hello and welcome to Apex Dental & Medical Center! My name is Maya! 😊 I am delighted to help you book your consultation, verify insurance, or assist with urgent care today. How can I help you?",
    "ur-PK":
      "ایپیکس ڈینٹل اینڈ میڈیکل سینٹر میں خوش آمدید! میں مایا ہوں۔ میں آج آپ کے لیے اپائنٹمنٹ بک کرنے یا انشورنس کی تصدیق کے لیے حاضر ہوں۔",
    "es-ES":
      "¡Hola y bienvenido al Centro Médico y Dental Apex! Mi nombre es Maya. 😊 Con mucho gusto le ayudaré a agendar su cita o verificar su seguro hoy. ¿Cómo le puedo ayudar?",
  },
  services: [
    {
      id: "srv-dental-clean",
      name: "Preventative Dental Cleaning & Hygiene",
      description:
        "Routine examinations, teeth cleaning, digital X-rays, and fluoride treatment.",
    },
    {
      id: "srv-ortho",
      name: "Orthodontics & Clear Aligners",
      description: "Consultations for braces, Invisalign, and bite alignment.",
    },
    {
      id: "srv-primary-care",
      name: "General Primary Medical Care",
      description:
        "Annual wellness physicals, chronic condition checks, and minor illness care.",
    },
  ],
  approvedKnowledge: [
    {
      id: "know-health-insurance",
      category: "Insurance & Payment",
      keywords: ["insurance", "ppo", "medicaid", "coverage", "copay", "pay"],
      question: "Which insurance plans do you accept?",
      answer: {
        "en-US":
          "We accept major PPO dental and health insurance plans including Delta Dental, Cigna, Aetna, MetLife, and Blue Cross Blue Shield. We can verify your specific benefit coverage during your first check-in.",
        "ur-PK":
          "ہم تمام بڑے انشورنس منصوبوں کو قبول کرتے ہیں۔ ہم پہلی بار آمد پر آپ کی کوریج کی تصدیق کر سکتے ہیں۔",
        "es-ES":
          "Aceptamos los principales planes de seguro PPO, incluidos Delta Dental, Cigna, Aetna y Blue Cross. Verificamos su cobertura en su primera visita.",
      },
      citation: "Apex Patient Financial Policy 2026",
    },
    {
      id: "know-health-emergency",
      category: "Urgent Triage",
      keywords: [
        "emergency",
        "severe pain",
        "swelling",
        "toothache",
        "bleeding",
        "broken tooth",
      ],
      question: "What should I do in a dental or medical emergency?",
      answer: {
        "en-US":
          "If you are experiencing chest pain, severe shortness of breath, or uncontrolled bleeding, please dial 911 immediately. For acute tooth pain, facial swelling, or a knocked-out tooth, we reserve emergency same-day slots.",
        "ur-PK":
          "اگر آپ کو سینے میں شدید درد یا سانس کی تکلیف ہے تو فوری 911 پر کال کریں۔ دانت کے شدید درد اور سوجن کے لیے ہمارے پاس ہنگامی اپائنٹمنٹس موجود ہیں۔",
        "es-ES":
          "Si siente dolor de pecho o dificultad respiratoria, llame al 911 de inmediato. Para dolor dental agudo o inflamación, reservamos citas de emergencia el mismo día.",
      },
      citation: "Apex Clinical Triage Protocol Sec 1",
    },
  ],
  restrictedTopics: [
    "Diagnosing medical conditions over the phone",
    "Prescribing medication or altering prescription dosage",
    "Providing emergency medical advice for life-threatening conditions",
  ],
  complianceDisclaimer: {
    "en-US":
      "Notice: VoxDesk AI is an administrative patient intake system and does not provide medical diagnoses. If you are experiencing a medical emergency, please hang up and call 911 immediately.",
    "ur-PK":
      "توجہ فرمائیں: یہ صوتی نظام طبی تشخیصی خدمات فراہم نہیں کرتا۔ اگر آپ کو کوئی ہنگامی طبی مسئلہ ہے تو فوری 911 پر رابطہ کریں۔",
    "es-ES":
      "Aviso: Este sistema no brinda diagnósticos médicos. Si tiene una emergencia médica, cuelgue y llame al 911 de inmediato.",
  },
  requiredIntakeFields: [
    {
      key: "patientName",
      label: "Patient Full Name",
      required: true,
      type: "text",
      description: "Full name of the patient",
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      required: true,
      type: "date",
      description: "Patient date of birth for records check",
    },
    {
      key: "contactPhone",
      label: "Callback Phone",
      required: true,
      type: "phone",
      description: "Direct mobile phone number",
    },
    {
      key: "insuranceProvider",
      label: "Insurance Carrier",
      required: false,
      type: "text",
      description: "Name of insurance company",
    },
    {
      key: "primarySymptom",
      label: "Reason for Visit",
      required: true,
      type: "text",
      description: "Routine checkup vs specific symptom/pain",
    },
  ],
  qualificationRules: {
    criteria: [
      {
        id: "crit-urgency",
        name: "Clinical Need & Pain Level",
        weight: 35,
        condition:
          "Active dental pain, broken crown, or acute symptom needing prompt care.",
        scoringGuide:
          "35 pts for acute pain/symptom, 20 pts for routine preventative care.",
      },
      {
        id: "crit-insurance",
        name: "Insurance / Self-Pay Coverage",
        weight: 30,
        condition: "Accepted PPO insurance or verified self-pay patient.",
        scoringGuide: "30 pts for verified PPO or direct payment capability.",
      },
      {
        id: "crit-new-patient",
        name: "Patient Status & Comprehensive Need",
        weight: 20,
        condition:
          "New family patient seeking full diagnostic exams & treatment plan.",
        scoringGuide:
          "20 pts for new comprehensive patient, 10 pts for existing follow-up.",
      },
      {
        id: "crit-readiness",
        name: "Appointment Slot Availability Fit",
        weight: 15,
        condition:
          "Patient ready to confirm available appointment slot immediately.",
        scoringGuide: "15 pts for immediate booking confirmation.",
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
      id: "trig-severe-swelling",
      condition:
        "Patient reports facial swelling affecting throat, airway, or high fever",
      reason:
        "Potential severe oral infection requiring immediate clinical intervention",
      urgency: "CRITICAL",
    },
    {
      id: "trig-life-threat",
      condition:
        "Patient reports chest pain, difficulty breathing, or severe trauma",
      reason: "Immediate redirection to emergency services (911)",
      urgency: "CRITICAL",
    },
  ],
  escalationDestination: {
    department: "Apex On-Call Triage Nurse & Clinical Supervisor",
    phone: "+1 (800) 555-0144",
    email: "triage@apexdental.demo",
  },
  appointmentSettings: {
    slotDurationMinutes: 30,
    advanceNoticeHours: 4,
    availableDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    sampleSlots: [
      "Tomorrow at 9:15 AM CST",
      "Tomorrow at 2:00 PM CST",
      "Thursday at 10:30 AM CST",
      "Friday at 3:45 PM CST",
    ],
  },
  crmPipelineStages: [
    "New Patient Request",
    "Insurance Verification",
    "Appointment Booked",
    "Reminder Sent",
    "Checked In",
    "Completed Visit",
    "Triage Escalation",
  ],
  followUpPolicy:
    "Clinical triage follow-up within 15 minutes for acute pain requests; 4 hours for general scheduling.",
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
