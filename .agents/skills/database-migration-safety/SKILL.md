---
name: database-migration-safety
description: Ensures PostgreSQL schema migrations are non-destructive, preserve multi-tenant workspace isolation, and execute safely in development and production environments.
---

# Database Migration Safety Skill

## When to Use
Use before modifying `prisma/schema.prisma` or running database migration commands (`prisma migrate dev`, `prisma migrate deploy`).

## Inputs Required
- Proposed schema changes.
- Current database state.
- Target environment (Local PostgreSQL / Production Supabase).

## Step-by-Step Process
1. Inspect proposed model or field alterations in `prisma/schema.prisma`.
2. Confirm every business data model retains mandatory `workspaceId` foreign key and index.
3. Verify non-destructive field modifications (prefer adding optional fields or controlled defaults over dropping columns).
4. Run `npx prisma validate` to confirm schema integrity.
5. Apply migration in local development environment.
6. Verify foreign key constraints and cascade rules.

## Decision Tree
- **Does schema change drop existing tables/columns?**
  - YES -> Require explicit audit & non-destructive migration path.
  - NO -> Validate schema -> Generate migration file -> Test migration rollforward.

## Validation Checklist
- [ ] Every model includes `id`, `createdAt`, `updatedAt`, and `workspaceId` (where tenant-scoped).
- [ ] Composite indexes created for high-frequency queries (e.g., `[workspaceId, status]`).
- [ ] Production deployments use `prisma migrate deploy` without destructive reset.

## Failure Conditions
- Dropping production tables or removing workspace isolation constraints.

## Expected Output
Verified migration plan and updated Prisma schema with index validation.
