import { OrganizationProfile } from '../types';

export const homeServicesPreset: OrganizationProfile = {
  id: 'preset-home-services',
  presetKey: 'HOME_SERVICES',
  name: 'ProCraft Heating, Plumbing & AC',
  industry: 'HVAC, Plumbing & Electrical Residential Services',
  tagline: 'Rapid emergency dispatch & automated service appointment scheduling',
  description:
    'Licensed residential contractor providing emergency plumbing repair, HVAC heating/cooling replacement, and electrical system diagnostics.',
  timeZone: 'America/Chicago',
  workingHours: {
    days: 'Monday through Sunday',
    hours: '24/7 Emergency Dispatch',
    afterHoursPolicy:
      'Voice receptionist active 24/7 with automated technician dispatch for water leaks, AC failures, and heating outages.',
  },
  supportedLanguages: ['en-US', 'ur-PK', 'es-ES'],
  defaultLanguage: 'en-US',
  voiceIdentity: {
    name: 'Maya',
    gender: 'female',
    accent: 'Friendly Professional Sales Specialist',
    defaultTone: 'WARM_SALES',
  },
  greetings: {
    'en-US':
      'Hi! Thanks so much for calling ProCraft Home Services. This is Maya! 😊 I can schedule a licensed technician for you right away or help you get a free service estimate. How can I assist you today?',
    'ur-PK':
      'پرو کرافٹ ہوم سروسز میں کال کرنے کا شکریہ! میں مایا ہوں۔ میں فوری طور پر آپ کے لیے ٹیکنیشن شیڈول کر سکتی ہوں یا مفت تخمینہ فراہم کر سکتی ہوں۔',
    'es-ES':
      '¡Hola! Muchas gracias por llamar a Servicios del Hogar ProCraft. Le habla Maya. 😊 Puedo agendar un técnico para usted de inmediato o darle un estimado gratis. ¿Cómo le ayudo hoy?',
  },
  services: [
    {
      id: 'srv-ac-repair',
      name: 'Air Conditioning Repair & System Replacement',
      description:
        'AC non-cooling diagnostic, refrigerant leak fix, and energy-efficient system installs.',
    },
    {
      id: 'srv-plumbing-leak',
      name: 'Emergency Plumbing & Pipe Repair',
      description:
        'Burst pipe repair, water heater replacement, drain unclogging, and sewer camera inspection.',
    },
    {
      id: 'srv-furnace-tuneup',
      name: 'Heating & Furnace Seasonal Tune-up',
      description:
        'Comprehensive heat exchanger safety inspection, thermostat calibration, and filter swaps.',
    },
  ],
  approvedKnowledge: [
    {
      id: 'know-service-call-fee',
      category: 'Pricing & Diagnostic Fee',
      keywords: ['service call', 'diagnostic fee', 'cost to come out', 'estimate', 'trip fee'],
      question: 'What is your diagnostic service call fee?',
      answer: {
        'en-US':
          'Our standard diagnostic service call is $89. A licensed technician comes out, performs a complete diagnostic inspection, and provides a guaranteed upfront repair quote before any work starts. If you proceed with the repair, the $89 fee is waived!',
        'ur-PK':
          'ہمارا معیاری ٹیسٹنگ چارج $89 ہے۔ اگر آپ کام شروع کرواتے ہیں تو یہ فیس معاف کر دی جاتی ہے۔',
        'es-ES':
          'Nuestra tarifa de diagnóstico estándar es de $89. Si decide hacer la reparación con nosotros, ¡se descuenta esa tarifa!',
      },
      citation: 'ProCraft Service Rate Card 2026',
    },
    {
      id: 'know-after-hours-charge',
      category: 'Emergency Rates',
      keywords: ['after hours', 'weekend', 'holiday', 'emergency fee', 'night'],
      question: 'Do you charge extra for emergency weekend or night service?',
      answer: {
        'en-US':
          'We offer flat-rate pricing 7 days a week! Emergency calls after 10 PM have a flat $49 after-hours dispatch fee.',
        'ur-PK':
          'ہم ہفتے کے ساتوں دن یکساں فلیٹ ریٹ پیش کرتے ہیں۔ رات 10 بجے کے بعد ایمرجنسی ڈسپیچ فیس $49 ہے۔',
        'es-ES':
          '¡Ofrecemos tarifas fijas los 7 días de la semana! Las llamadas de emergencia después de las 10 PM tienen una tarifa adicional de $49.',
      },
      citation: 'ProCraft Emergency Dispatch Policy Sec 2',
    },
  ],
  restrictedTopics: [
    'Instructing homeowners to handle gas lines or dangerous high-voltage electrical panels without a licensed technician',
    'Providing fixed binding quotes without inspecting the physical plumbing or HVAC unit first',
  ],
  complianceDisclaimer: {
    'en-US':
      'Notice: If you smell natural gas, evacuate your home immediately and call your gas utility company or 911 from outside.',
    'ur-PK':
      'توجہ فرمائیں: اگر آپ کو سوئی گیس کی بو محسوس ہو تو فوراً گھر سے باہر نکلیں اور ایمرجنسی سروسز پر کال کریں۔',
    'es-ES':
      'Aviso: Si huele a gas natural, evacúe su casa de inmediato y llame a la compañía de gas o al 911.',
  },
  requiredIntakeFields: [
    {
      key: 'customerName',
      label: 'Customer Name',
      required: true,
      type: 'text',
      description: 'Full name of property owner or tenant',
    },
    {
      key: 'contactPhone',
      label: 'Phone Number',
      required: true,
      type: 'phone',
      description: 'Direct mobile callback number',
    },
    {
      key: 'propertyAddress',
      label: 'Service Street Address',
      required: true,
      type: 'text',
      description: 'Physical street address for technician dispatch',
    },
    {
      key: 'issueCategory',
      label: 'Issue Type',
      required: true,
      type: 'select',
      description: 'HVAC Non-cooling, Plumbing Leak, Electrical Outage',
    },
    {
      key: 'isEmergency',
      label: 'Active Leak / Extreme Temp',
      required: true,
      type: 'select',
      description: 'Active water leak or indoor temp extreme',
    },
  ],
  qualificationRules: {
    criteria: [
      {
        id: 'crit-emergency-severity',
        name: 'Active Water Leak or Heating Failure',
        weight: 40,
        condition:
          'Active indoor water flooding, gas odor concern, or freezing indoor temperature.',
        scoringGuide: '40 pts for active leak/emergency outage, 20 pts for standard repair.',
      },
      {
        id: 'crit-replacement-potential',
        name: 'System Replacement / Upgrade Intent',
        weight: 30,
        condition:
          'System is >10 years old and homeowner wants a complete AC or furnace replacement quote.',
        scoringGuide: '30 pts for system replacement project (>=$5,000 value).',
      },
      {
        id: 'crit-homeowner',
        name: 'Property Ownership Status',
        weight: 15,
        condition: 'Caller is the property owner authorized to approve repairs on site.',
        scoringGuide:
          '15 pts for property owner, 10 pts for authorized tenant with landlord approval.',
      },
      {
        id: 'crit-dispatch-ready',
        name: 'Immediate Dispatch Confirmation',
        weight: 15,
        condition: 'Someone over 18 available at the property for technician arrival window.',
        scoringGuide: '15 pts for immediate technician arrival window confirmation.',
      },
    ],
    scoreThresholds: {
      hot: 70,
      warm: 45,
      review: 20,
    },
  },
  escalationTriggers: [
    {
      id: 'trig-gas-leak',
      condition: 'Caller reports smelling natural gas inside the house',
      reason:
        'Critical gas safety emergency requires immediate safety evacuation instruction and dispatch',
      urgency: 'CRITICAL',
    },
    {
      id: 'trig-flooding',
      condition: 'Caller reports main water line burst flooding living areas',
      reason:
        'Active property damage emergency requiring main shutoff instructions & priority dispatch',
      urgency: 'CRITICAL',
    },
  ],
  escalationDestination: {
    department: 'Master On-Call Technician & Emergency Dispatch',
    phone: '+1 (800) 555-0122',
    email: 'dispatch@procrafthome.demo',
  },
  appointmentSettings: {
    slotDurationMinutes: 120,
    advanceNoticeHours: 2,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    sampleSlots: [
      'Today 2:00 PM - 4:00 PM Window',
      'Tomorrow 8:00 AM - 10:00 AM Window',
      'Tomorrow 12:00 PM - 2:00 PM Window',
    ],
  },
  crmPipelineStages: [
    'New Service Call',
    'Technician Dispatched',
    'Diagnostic Complete',
    'Quote Approved',
    'Job Completed',
    'Payment Received',
    'Emergency Handoff',
  ],
  followUpPolicy:
    'Emergency dispatch confirmation within 10 minutes; routine maintenance scheduling within 1 hour.',
  allowedBusinessActions: [
    'checkAvailability',
    'reserveAppointment',
    'scoreLead',
    'createLead',
    'updateLead',
    'prepareFollowUp',
    'prepareHandoff',
    'answerApprovedQuestion',
    'requestHumanReview',
    'completeCall',
  ],
};
