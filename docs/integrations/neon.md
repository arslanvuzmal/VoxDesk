# Neon-Compatible PostgreSQL

VoxDesk uses Prisma with PostgreSQL. For serverless environments, use a pooled runtime connection string where the deployment platform requires it. Apply reviewed migrations using an appropriate direct/admin connection in the delivery environment; never document or commit either URL.

See [database delivery](../operations/database-migrations.md) and Neon’s official [connection pooling documentation](https://neon.com/docs/connect/connection-pooling.md).
