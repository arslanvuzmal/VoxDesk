export type LeadCategory = "HOT" | "WARM" | "REVIEW" | "COLD";

export interface LeadQualificationInput {
  serviceInterest?: string;
  budgetRange?: string;
  timeline?: string;
  authority?: string;
  urgency?: string;
}

export interface QualificationCriterionScore {
  criterion: string;
  score: number; // 0 to 20
  weight: number;
  evidence: string;
  collected: boolean;
}

export interface QualificationResult {
  score: number; // 0 to 100
  category: LeadCategory;
  breakdown: QualificationCriterionScore[];
  missingFields: string[];
  recommendedAction: string;
}

export function calculateLeadQualification(
  input: LeadQualificationInput,
): QualificationResult {
  const breakdown: QualificationCriterionScore[] = [];
  const missingFields: string[] = [];

  // 1. Service Fit (Weight 25)
  if (input.serviceInterest && input.serviceInterest.trim().length > 0) {
    breakdown.push({
      criterion: "Service Fit",
      score: 25,
      weight: 25,
      evidence: `Requested service: ${input.serviceInterest}`,
      collected: true,
    });
  } else {
    missingFields.push("serviceInterest");
    breakdown.push({
      criterion: "Service Fit",
      score: 0,
      weight: 25,
      evidence: "Service interest not specified",
      collected: false,
    });
  }

  // 2. Budget (Weight 20)
  if (input.budgetRange) {
    const text = input.budgetRange.toLowerCase();
    const isHigh =
      text.includes("10,000") ||
      text.includes("25,000") ||
      text.includes("10k") ||
      text.includes("high") ||
      text.includes("above") ||
      text.includes(">");
    const isMedium =
      text.includes("5,000") || text.includes("5k") || text.includes("medium");
    const score = isHigh ? 20 : isMedium ? 15 : 10;
    breakdown.push({
      criterion: "Budget Range",
      score,
      weight: 20,
      evidence: `Stated budget: ${input.budgetRange}`,
      collected: true,
    });
  } else {
    missingFields.push("budgetRange");
    breakdown.push({
      criterion: "Budget Range",
      score: 0,
      weight: 20,
      evidence: "Budget not discussed",
      collected: false,
    });
  }

  // 3. Timeline (Weight 20)
  if (input.timeline) {
    const text = input.timeline.toLowerCase();
    const isImmediate =
      text.includes("immediate") ||
      text.includes("this week") ||
      text.includes("today") ||
      text.includes("now");
    const score = isImmediate ? 20 : 12;
    breakdown.push({
      criterion: "Timeline",
      score,
      weight: 20,
      evidence: `Desired timeline: ${input.timeline}`,
      collected: true,
    });
  } else {
    missingFields.push("timeline");
    breakdown.push({
      criterion: "Timeline",
      score: 0,
      weight: 20,
      evidence: "Timeline not specified",
      collected: false,
    });
  }

  // 4. Decision Authority (Weight 15)
  if (input.authority) {
    const text = input.authority.toLowerCase();
    const isDecisionMaker =
      text.includes("owner") ||
      text.includes("decision") ||
      text.includes("director") ||
      text.includes("self") ||
      text.includes("partner");
    const score = isDecisionMaker ? 15 : 8;
    breakdown.push({
      criterion: "Decision Authority",
      score,
      weight: 15,
      evidence: `Authority role: ${input.authority}`,
      collected: true,
    });
  } else {
    missingFields.push("authority");
    breakdown.push({
      criterion: "Decision Authority",
      score: 0,
      weight: 15,
      evidence: "Authority unknown",
      collected: false,
    });
  }

  // 5. Urgency (Weight 20)
  if (input.urgency) {
    const text = input.urgency.toLowerCase();
    const isHighUrgency =
      text.includes("high") ||
      text.includes("urgent") ||
      text.includes("emergency");
    const score = isHighUrgency ? 20 : 10;
    breakdown.push({
      criterion: "Urgency Level",
      score,
      weight: 20,
      evidence: `Urgency signal: ${input.urgency}`,
      collected: true,
    });
  } else {
    missingFields.push("urgency");
    breakdown.push({
      criterion: "Urgency Level",
      score: 0,
      weight: 20,
      evidence: "Urgency not evaluated",
      collected: false,
    });
  }

  const totalScore = breakdown.reduce((acc, b) => acc + b.score, 0);

  let category: LeadCategory = "COLD";
  let recommendedAction =
    "Send general business brochure and follow-up in 30 days";

  if (totalScore >= 75) {
    category = "HOT";
    recommendedAction =
      "Assign to senior account executive for immediate calendar consultation";
  } else if (totalScore >= 50) {
    category = "WARM";
    recommendedAction =
      "Schedule consultation and trigger nurture email sequence";
  } else if (totalScore >= 30) {
    category = "REVIEW";
    recommendedAction =
      "Route to operator queue for manual qualification review";
  }

  return {
    score: totalScore,
    category,
    breakdown,
    missingFields,
    recommendedAction,
  };
}
