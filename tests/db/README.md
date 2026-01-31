# DB query tests

These tests run against a **test database** to assert query count and avoid N+1 patterns.

**Setup:**

1. Create a separate test database (e.g. same Postgres server, different database name).
2. Set `DATABASE_URL_TEST` to the test database connection string.
3. Run migrations: `DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy`
4. Run tests: `DATABASE_URL=$DATABASE_URL_TEST npm run test -- tests/db`

If `DATABASE_URL_TEST` is not set, the DB query tests are skipped.
