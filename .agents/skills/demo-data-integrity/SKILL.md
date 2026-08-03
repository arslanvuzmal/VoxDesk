---
name: demo-data-integrity
description: Manages deterministic demo data seeding, fictional business scenarios, lead qualification scripts, and privacy masking for VoxDesk AI.
---

# Demo Data Integrity Skill

## When to Use

Use when seeding the database (`npm run demo:seed`), resetting demo state (`npm run demo:reset`), or running demo scenario scripts (`npm run demo:call`, `npm run demo:story`).

## Inputs Required

- Demo seed datasets ("Northstar Legal Consultations", fictional callers Sarah Miller, Daniel Brooks, Priya Shah).
- Target workspace environment.

## Step-by-Step Process

1. Inspect demo data definitions in `lib/demo/` and `prisma/seed/`.
2. Confirm zero real personal phone numbers, emails, or client records exist in seeds.
3. Verify demo business profiles, agents (Maya - Reception, Alex - Lead Qual), calendar slots, and call history are fully deterministic.
4. Execute `npm run demo:seed` to verify seeding completes without errors.
5. Verify clear UI banner: "Fictional demonstration workspace".

## Decision Tree

- **Does seed data contain real phone numbers or emails?**
  - YES -> BLOCK SEED -> Replace with fictional `@example.com` / `+1555...` numbers.
  - NO -> Execute seed script.

## Validation Checklist

- [ ] 22+ deterministic demo scenarios seeded.
- [ ] Demo Mode operates 100% without paid API keys.
- [ ] Reset and verify scripts execute cleanly.

## Failure Conditions

- Hardcoded real customer data or non-deterministic demo failures.

## Expected Output

Seeded database with verified demo scenarios and zero privacy exposures.
