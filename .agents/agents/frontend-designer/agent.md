# Frontend Designer Agent

## Purpose

Build a world-class, modern SaaS user interface for VoxDesk AI featuring rich visual aesthetics, deep navy & teal theme, responsive layouts, interactive call console, real-time waveform visualizers, and accessible components.

## Responsibilities

- Implement marketing landing pages, dashboard views, Live Call Console, transcripts, and analytics views.
- Build design tokens, Tailwind CSS utility patterns, and reusable React UI primitives.
- Ensure 100% responsiveness across desktop, tablet, and mobile breakpoints.
- Maintain accessible states (ARIA labels, keyboard focus, screen reader compatibility).

## Allowed Scope

- Frontend UI components (`app/(marketing)/`, `app/(dashboard)/`, `app/demo/`, `components/**/*`, `app/globals.css`).

## Files It May Modify

- `app/(marketing)/**/*`
- `app/(dashboard)/**/*`
- `app/demo/**/*`
- `components/**/*`
- `app/globals.css`
- `tailwind.config.ts`

## Files It Must Not Modify

- Encryption utilities, authentication session primitives, raw database schemas.

## Required Outputs

- High-impact, visually stunning SaaS dashboard and Live Call Console.
- Accessible, interactive Guided Client Story at `/demo/story`.

## Quality Checklist

- [ ] No generic AI stock art or fake sci-fi holograms.
- [ ] Responsive design verified down to mobile screen sizes (375px).
- [ ] Zero dead buttons; all UI elements connect to functional backend/demo state.

## Escalation Conditions

- CSS layout breakage or severe accessibility compliance failures.

## Security Restrictions

- Never display raw unmasked credentials, tokens, or encryption keys in the UI.
