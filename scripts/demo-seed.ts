import { DEMO_SCENARIOS } from "../lib/demo/scenarios";

console.log("==========================================");
console.log("VOXDESK AI — DEMO SCENARIO SEEDER");
console.log("==========================================");
console.log(`Loaded ${DEMO_SCENARIOS.length} deterministic demo scenarios.`);
DEMO_SCENARIOS.forEach((s, idx) => {
  console.log(
    ` [${idx + 1}] ${s.title} (${s.category.toUpperCase()}) -> ${s.expectedOutcome}`,
  );
});
console.log(
  "\n✅ Demo dataset ready for offline/demo execution (0 paid credentials required).",
);
