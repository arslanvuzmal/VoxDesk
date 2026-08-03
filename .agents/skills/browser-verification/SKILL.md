---
name: browser-verification
description: Runs end-to-end browser user journey checks, console log audits, visual inspection, and mobile responsiveness validation for VoxDesk AI.
---

# Browser Verification Skill

## When to Use
Use after launching local dev server (`npm run dev`) or deploying to production (`https://voxdesk-ai.vercel.app`) to verify full interactive functionality.

## Inputs Required
- Target application URL.
- Test user credentials.
- Verification scenarios list.

## Step-by-Step Process
1. Navigate to target URL (Landing page, Auth, Dashboard, Call Console, Guided Story).
2. Execute user journey steps (Login -> Create Agent -> Run Demo Call -> Book Appointment -> Review Lead Score -> Check Transcript).
3. Inspect browser developer console for zero unhandled runtime errors or 404 assets.
4. Test responsive layout at 1280px (Desktop), 768px (Tablet), and 375px (Mobile).
5. Document verification results in `docs/BROWSER_VERIFICATION_REPORT.md`.

## Decision Tree
- **Are console errors detected or buttons unclickable?**
  - YES -> Fail verification -> Repair underlying UI/API logic -> Re-run check.
  - NO -> Pass verification -> Generate report.

## Validation Checklist
- [ ] 23+ user journey checkpoints verified.
- [ ] Zero unhandled JS exceptions in browser console.
- [ ] Guided Client Story (`/demo/story`) plays smoothly within ~60 seconds.

## Failure Conditions
- Dead navigation buttons, broken API responses, or unresponsive layouts.

## Expected Output
Browser verification report with route status, mobile responsiveness proof, and console audit logs.
