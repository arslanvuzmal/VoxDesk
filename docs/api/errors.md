# API Errors

Client responses should expose a stable code, safe message, and correlation/request identifier where available:

```json
{
  "error": {
    "code": "AUTHORIZATION",
    "message": "This action is not available.",
    "requestId": "correlation-id"
  }
}
```

Do not expose Prisma errors, provider response bodies, stack traces, secrets, or raw PII. Expected categories include validation, authentication, authorization, not-found, conflict/idempotency, rate-limit, compliance block, timeout, retryable provider failure, permanent provider failure, and unknown failure.
