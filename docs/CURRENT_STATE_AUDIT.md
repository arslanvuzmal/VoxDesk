# VoxDesk AI — Current State Audit & Redesign Roadmap

**Date:** 2026-08-03  
**Project Owner:** Arslan Vuzmal Lone  
**Repository:** `arslanvuzmal/voxdesk-ai`  
**Official URL Target:** `https://voxdesk-ai.vercel.app`

---

## 1. Initial State Inventory

| Metric / Aspect             | Audit Finding                                                              | Required Action                                                                                      |
| :-------------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| **Git Default Branch**      | `master`                                                                   | Rename branch to `main`, set `main` as default branch on GitHub                                      |
| **Official Production URL** | Displaying `voxdesk-1unay2tva-arslan-vuzmal-lone.vercel.app` in docs       | Replace all references with clean alias `https://voxdesk-ai.vercel.app`                              |
| **Metadata Canonical Base** | Unset or inconsistent                                                      | Configure `metadataBase: new URL("https://voxdesk-ai.vercel.app")`                                   |
| **Visual Aesthetics**       | Excessive glowing cards, animated sparkles, all-caps headers               | Overhaul with mature operations UI palette (`#0B0D10` bg, `#13171C` card, `#2DD4BF` teal)            |
| **Copywriting**             | Mentions "FIVERR FLAGSHIP PORTFOLIO PROOF", "100% DETERMINISTIC DEMO MODE" | Rewrite to professional B2B product copy ("Calls answered. Appointments booked. Context preserved.") |
| **Status Badge**            | Pulsing "Providers Operational" badge without live check                   | Change to honest "System status" link showing "Demo environment" on `/status`                        |
| **Public Demo Access**      | Accessible, but needs clear fictional data disclosure                      | Ensure `/demo` & `/demo/story` open directly without SSO or auth redirects                           |
| **Dashboard Layout**        | 6-metric hero cards, colorful gradient panels                              | Streamline to 4 clean operational metrics, compact 220px sidebar                                     |

---

## 2. Identified Visual & Copy Defects

1. **Machine-Generated Visual Markers:**
   - Giant glowing gradient background blobs (`from-teal-500/15 to-electric-600/15`).
   - Symmetrical 3x2 feature cards with identical icon-heading-paragraph structures.
   - All-caps microcopy overdose (`WOW MOMENT 6 — 1-MINUTE CLIENT DEMO`).
   - Pulsing status badges claiming live provider operation without active credentials.

2. **Unnecessary Hype Copy:**
   - Phrases like "FIVERR FLAGSHIP PORTFOLIO PROOF", "BUILT FOR MEMORABLE CLIENT DEMONSTRATIONS", and "PRODUCE MEMORABLE DEMOS".
   - Marketing text embedded inside operational dashboard screens.

3. **URL & Metadata Discrepancies:**
   - Hardcoded deployment-specific hash URLs (`voxdesk-1unay2tva...`).

---

## 3. Redesign Architecture & Plan

- **Design Tokens (`app/globals.css`, `tailwind.config.ts`):**
  - Background: `#0B0D10`
  - Sidebar: `#0F1216`
  - Card/Surface: `#13171C`
  - Raised Surface: `#171C22`
  - Border: `#272D35`
  - Accent: `#2DD4BF` (Teal)
- **Marketing Site (`app/(marketing)/page.tsx`):**
  - Clean hero: "Calls answered. Appointments booked. Context preserved."
  - 100% genuine screenshots of the live call console.
  - Clear disclosure: "Interactive demo using fictional business and caller data."
- **Dashboard Shell & Views:**
  - Streamlined 220px monochrome sidebar.
  - Overview: 4 essential metrics (Calls handled, Appointments booked, Qualified enquiries, Escalations requiring review).
  - Restrained Live Call Console with clear speaker transcript and turn controls.
