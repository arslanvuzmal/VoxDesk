# Secrets and Configuration

Secrets belong in local ignored environment files or deployment secret stores. They must never appear in source, screenshots, issues, PRs, CI logs, browser responses, or public documentation.

Rotate any credential exposed outside an approved secret store. Live provider mode must fail closed when its required resources are absent; simulation mode is explicit and must not silently become live. The current environment reference is [`.env.example`](../../.env.example).
