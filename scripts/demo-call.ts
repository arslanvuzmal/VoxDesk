import { DEMO_SCENARIOS } from "../lib/demo/scenarios";

const scenario = DEMO_SCENARIOS[0]; // Appointment booking scenario

console.log("==========================================");
console.log(`VOXDESK AI — SIMULATED CALL EXECUTION`);
console.log(`Scenario: ${scenario.title}`);
console.log(`Caller: ${scenario.callerName} (${scenario.callerNumber})`);
console.log("==========================================");

scenario.dialogueScript.forEach((turn, i) => {
  console.log(`[Turn ${i + 1}] [State: ${turn.state}]`);
  console.log(`  ${turn.speaker.toUpperCase()}: "${turn.text}"`);
});

console.log("\n✅ Simulated call completed cleanly with outcome:", scenario.expectedOutcome);
