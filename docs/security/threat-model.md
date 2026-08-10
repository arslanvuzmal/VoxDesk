# Threat model

Protected assets include tenant data, provider credentials, telephone spend, recordings, transcripts, CRM actions, campaigns, and production agent versions.

Primary threats are BOLA/IDOR, broken authentication and function authorization, webhook forgery and replay, prompt/tool injection, duplicate side effects, cross-tenant memory, SSRF, session fixation, XSS, sensitive logging, credential leakage, concurrency races, and cost exhaustion.

Trust boundaries exist at browser sessions, demo sessions, provider webhooks, realtime tool requests, external adapters, background jobs, and deployment promotion. Controls must fail closed and retain correlation and audit evidence. Security testing reduces known risk; it is not proof of zero vulnerabilities.
