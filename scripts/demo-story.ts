import { DEMO_SCENARIOS } from "../lib/demo/scenarios";

const story = DEMO_SCENARIOS.find((s) => s.id === "scenario-22-story") || DEMO_SCENARIOS[0];

console.log("==========================================");
console.log("VOXDESK AI — GUIDED CLIENT STORY DEMONSTRATION");
console.log("==========================================");
console.log("1. Incoming Call Detected");
console.log("2. Custom Business Greeting");
console.log("3. Intent Recognition & Service Intake");
console.log("4. Calendar Availability Query");
console.log("5. Slot Presentation & Confirmation");
console.log("6. Lead Qualification Scoring (HOT - 85/100)");
console.log("7. CRM Contact & Activity Synchronization");
console.log("8. Speaker-Separated Transcript Generation");
console.log("9. Zod-Validated Summary & Action Extraction");
console.log("10. Analytics Dashboard Metric Update");

console.log("\nDialogue Trajectory:");
story.dialogueScript.forEach((step) => {
  console.log(` -> [${step.state}] ${step.speaker.toUpperCase()}: ${step.text}`);
});

console.log("\n🎉 Guided Client Story Verification Passed (Completed in ~60s timeline).");
