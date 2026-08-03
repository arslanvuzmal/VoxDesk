import { OrganizationProfile } from "@/lib/organization/types";

export type LeadCategory = "HOT" | "WARM" | "REVIEW" | "COLD";

export interface LeadQualificationInput {
  serviceInterest?: string;
  budgetRange?: string;
  timeline?: string;
  authority?: string;
  urgency?: string;
  extractedFields?: Record<string, any>;
}

export interface QualificationCriterionScore {
  criterion: string;
  score: number;
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
  followUpPriority: "IMMEDIATE" | "HIGH" | "MEDIUM" | "LOW";
  requiresHumanReview: boolean;
}

export function calculateLeadQualification(
  input: LeadQualificationInput,
  profile?: OrganizationProfile,
): QualificationResult {
  const breakdown: QualificationCriterionScore[] = [];
  const missingFields: string[] = [];
  const fields = input.extractedFields || {};

  // If Organization Profile provides custom rules, evaluate against profile rules
  if (profile?.qualificationRules) {
    const rules = profile.qualificationRules;
    const thresholds = rules.scoreThresholds;

    for (const crit of rules.criteria) {
      let collected = false;
      let score = 0;
      let evidence = "Not discussed in call";

      // Match criteria against collected fields
      const lowerName = crit.name.toLowerCase();
      if (
        lowerName.includes("budget") ||
        lowerName.includes("price") ||
        lowerName.includes("retainer")
      ) {
        const val =
          input.budgetRange ||
          fields.budgetRange ||
          fields.estimatedBudget ||
          fields.priceBudget;
        if (val) {
          collected = true;
          score = crit.weight;
          evidence = `Stated budget/price: ${val}`;
        }
      } else if (
        lowerName.includes("service") ||
        lowerName.includes("substance") ||
        lowerName.includes("need") ||
        lowerName.includes("symptom")
      ) {
        const val =
          input.serviceInterest ||
          fields.legalCategory ||
          fields.primarySymptom ||
          fields.intentType ||
          fields.issueCategory;
        if (val) {
          collected = true;
          score = crit.weight;
          evidence = `Stated interest/need: ${val}`;
        }
      } else if (
        lowerName.includes("timeline") ||
        lowerName.includes("deadline") ||
        lowerName.includes("urgency") ||
        lowerName.includes("pain")
      ) {
        const val =
          input.timeline ||
          input.urgency ||
          fields.urgencyLevel ||
          fields.isEmergency ||
          fields.buyingTimeline;
        if (val) {
          collected = true;
          score = crit.weight;
          evidence = `Stated timeline/urgency: ${val}`;
        }
      } else if (
        lowerName.includes("authority") ||
        lowerName.includes("owner") ||
        lowerName.includes("role") ||
        lowerName.includes("preapproved")
      ) {
        const val =
          input.authority ||
          fields.financingStatus ||
          fields.teamSize ||
          fields.authority;
        if (val) {
          collected = true;
          score = crit.weight;
          evidence = `Stated status/authority: ${val}`;
        }
      } else {
        // General credit if caller provided details
        if (Object.keys(fields).length > 2) {
          collected = true;
          score = Math.round(crit.weight * 0.75);
          evidence = `Relevant qualification signal captured for ${crit.name}`;
        }
      }

      if (!collected) {
        missingFields.push(crit.name);
      }

      breakdown.push({
        criterion: crit.name,
        score,
        weight: crit.weight,
        evidence,
        collected,
      });
    }

    const totalScore = Math.min(
      100,
      breakdown.reduce((acc, b) => acc + b.score, 0),
    );

    let category: LeadCategory = "COLD";
    let priority: "IMMEDIATE" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
    let recommendedAction =
      "Store in CRM database and place in standard nurture sequence.";
    let requiresHumanReview = false;

    if (totalScore >= thresholds.hot) {
      category = "HOT";
      priority = "IMMEDIATE";
      recommendedAction = `Immediate priority callback or calendar consultation dispatch for ${profile.name}`;
    } else if (totalScore >= thresholds.warm) {
      category = "WARM";
      priority = "HIGH";
      recommendedAction = `Schedule follow-up consultation and send ${profile.name} service summary`;
    } else if (totalScore >= thresholds.review) {
      category = "REVIEW";
      priority = "MEDIUM";
      requiresHumanReview = true;
      recommendedAction =
        "Route to human receptionist queue for qualification review";
    }

    return {
      score: totalScore,
      category,
      breakdown,
      missingFields,
      recommendedAction,
      followUpPriority: priority,
      requiresHumanReview,
    };
  }

  // Standard Fallback Qualification Algorithm
  if (input.serviceInterest && input.serviceInterest.trim().length > 0) {
    breakdown.push({
      criterion: "Service Fit",
      score: 25,
      weight: 25,
      evidence: `Requested service: ${input.serviceInterest}`,
      collected: true,
    });
  } else {
    missingFields.push("Service Interest");
    breakdown.push({
      criterion: "Service Fit",
      score: 0,
      weight: 25,
      evidence: "Service interest not specified",
      collected: false,
    });
  }

  if (input.budgetRange) {
    breakdown.push({
      criterion: "Budget Range",
      score: 20,
      weight: 20,
      evidence: `Stated budget: ${input.budgetRange}`,
      collected: true,
    });
  } else {
    missingFields.push("Budget Range");
    breakdown.push({
      criterion: "Budget Range",
      score: 0,
      weight: 20,
      evidence: "Budget not discussed",
      collected: false,
    });
  }

  if (input.timeline) {
    breakdown.push({
      criterion: "Timeline",
      score: 20,
      weight: 20,
      evidence: `Desired timeline: ${input.timeline}`,
      collected: true,
    });
  } else {
    missingFields.push("Timeline");
    breakdown.push({
      criterion: "Timeline",
      score: 0,
      weight: 20,
      evidence: "Timeline not specified",
      collected: false,
    });
  }

  if (input.authority) {
    breakdown.push({
      criterion: "Decision Authority",
      score: 15,
      weight: 15,
      evidence: `Authority role: ${input.authority}`,
      collected: true,
    });
  } else {
    missingFields.push("Decision Authority");
    breakdown.push({
      criterion: "Decision Authority",
      score: 0,
      weight: 15,
      evidence: "Authority unknown",
      collected: false,
    });
  }

  if (input.urgency) {
    breakdown.push({
      criterion: "Urgency Level",
      score: 20,
      weight: 20,
      evidence: `Urgency signal: ${input.urgency}`,
      collected: true,
    });
  } else {
    missingFields.push("Urgency Level");
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
  let priority: "IMMEDIATE" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
  let requiresHumanReview = false;

  if (totalScore >= 75) {
    category = "HOT";
    priority = "IMMEDIATE";
    recommendedAction =
      "Assign to senior account executive for immediate calendar consultation";
  } else if (totalScore >= 50) {
    category = "WARM";
    priority = "HIGH";
    recommendedAction = "Schedule consultation and trigger nurture sequence";
  } else if (totalScore >= 30) {
    category = "REVIEW";
    priority = "MEDIUM";
    requiresHumanReview = true;
    recommendedAction =
      "Route to operator queue for manual qualification review";
  }

  return {
    score: totalScore,
    category,
    breakdown,
    missingFields,
    recommendedAction,
    followUpPriority: priority,
    requiresHumanReview,
  };
}
