# Deployment Model

Development flows through a feature branch, pull request, CI, and Vercel Preview. A deployment is promoted only after migration review, route/browser checks, target-environment health checks, and exact-SHA confirmation.

Production acceptance includes `/api/health`, database, telephony, voice, queue, and integration health routes plus critical dashboard/demo routes. A Vercel READY state alone does not verify database migrations or providers.
