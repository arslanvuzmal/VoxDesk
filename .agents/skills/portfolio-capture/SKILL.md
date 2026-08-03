---
name: portfolio-capture
description: Captures high-resolution, professional application screenshots and video scripts for Fiverr portfolio galleries and client demonstrations.
---

# Portfolio Capture Skill

## When to Use

Use after completing UI development and verifying browser journeys to generate clean marketing screenshots for Fiverr gig listings.

## Inputs Required

- Running VoxDesk AI instance with populated demo database.
- Target screenshot resolutions (1280 × 769 px for Fiverr gallery).

## Step-by-Step Process

1. Ensure application is loaded with high-quality demo data ("Northstar Legal Consultations").
2. Set browser viewport to 1280 × 769 px.
3. Capture 12 required screenshot perspectives:
   - 01-landing-page.png
   - 02-overview-dashboard.png
   - 03-live-call-console.png
   - 04-appointment-booking.png
   - 05-call-transcript.png
   - 06-call-summary.png
   - 07-lead-qualification.png
   - 08-human-escalation.png
   - 09-call-history.png
   - 10-analytics.png
   - 11-agent-configuration.png
   - 12-mobile-dashboard.png
4. Save screenshots under `portfolio/screenshots/`.
5. Verify no sensitive credentials or real personal data appear in captures.

## Decision Tree

- **Do screenshots expose real secrets or look sparse?**
  - YES -> Re-seed demo database -> Re-capture screenshots.
  - NO -> Finalize portfolio asset bundle.

## Validation Checklist

- [ ] 12 distinct portfolio screenshots captured at 1280 × 769 px.
- [ ] Gallery composition plan (`portfolio/fiverr/GALLERY_PLAN.md`) created.
- [ ] Video script (`portfolio/video/VIDEO_SCRIPT.md`) aligned with UI capabilities.

## Failure Conditions

- Distorted image ratios, missing demo elements, or credential leaks.

## Expected Output

Complete set of 12 portfolio screenshot images and Fiverr gallery collateral.
