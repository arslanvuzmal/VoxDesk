import { describe, it, expect } from "vitest";
import { calculateLeadQualification } from "../../lib/conversation/qualification";

describe("Lead Qualification Engine", () => {
  it("should classify high budget, immediate commercial lead as HOT", () => {
    const result = calculateLeadQualification({
      serviceInterest: "Commercial Contract Review",
      budgetRange: "> $10,000",
      timeline: "Immediate (This Week)",
      authority: "Business Owner",
      urgency: "High Emergency",
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.category).toBe("HOT");
    expect(result.missingFields.length).toBe(0);
  });

  it("should classify incomplete lead as REVIEW or COLD", () => {
    const result = calculateLeadQualification({
      serviceInterest: "General Enquiry",
    });

    expect(result.score).toBeLessThan(50);
    expect(result.category).toBe("COLD");
    expect(result.missingFields).toContain("budgetRange");
  });
});
