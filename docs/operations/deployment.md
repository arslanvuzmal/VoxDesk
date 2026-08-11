# Deployment Operations

1. Create a focused branch and open a PR.
2. Run CI and inspect the Vercel Preview for the exact commit SHA.
3. Review migration SQL and apply it through the approved database delivery path.
4. Verify preview health, critical routes, and browser behavior.
5. Merge only with green required checks and an understood rollback target.
6. Verify the production SHA, health routes, migration state, logs, and provider readiness.

Do not equate a READY Vercel deployment with production acceptance.
