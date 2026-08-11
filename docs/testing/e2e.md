# Browser Acceptance Tests

Run `npm run test:e2e`. Playwright runs against the VoxDesk server created by the test command unless `PLAYWRIGHT_BASE_URL` is supplied. Set `PLAYWRIGHT_PORT` to use an isolated local port when port 3000 belongs to another project, for example `PLAYWRIGHT_PORT=3001 npm run test:e2e`.

Confirm the URL belongs to VoxDesk before interpreting results; a shared local port can otherwise serve an unrelated project.

E2E verifies browser-visible contracts, not carrier activation.
