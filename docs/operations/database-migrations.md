# Database Migration Delivery

VoxDesk migrations are additive by default.

```text
Design -> Generate migration -> Review SQL -> Preview/staging database -> Validate -> Apply -> Verify -> Record rollback/restore path
```

Use `prisma migrate dev` during development and `prisma migrate deploy` for reviewed deployment delivery. Do not use `db push` as a production substitute. Before destructive work, take the customer-approved backup/restore path and verify the exact target database.
