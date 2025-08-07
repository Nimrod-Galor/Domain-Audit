# Database Testing Setup Guide

This guide will help you set up PostgreSQL for running the Domain Audit test suite.

## Prerequisites

You need PostgreSQL installed and running on your system. Choose one of the options below:

### Option 1: Install PostgreSQL Locally

#### Windows

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. PostgreSQL should start automatically as a Windows service

#### macOS

```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create a database user if needed
createuser -s postgres
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create a database user
sudo -u postgres createuser -s $USER
```

### Option 2: Use Docker (Recommended for Development)

```bash
# Start PostgreSQL in Docker
docker run --name postgres-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=domain_audit_test \
  -p 5432:5432 \
  -d postgres:14

# The database will be available at localhost:5432
```

## Configuration

1. **Copy the test environment file:**

   ```bash
   cp .env.test.example .env.test
   ```

2. **Edit `.env.test` with your database credentials:**

   ```bash
   # Test Database Configuration
   TEST_DB_HOST=localhost
   TEST_DB_PORT=5432
   TEST_DB_NAME=domain_audit_test
   TEST_DB_USER=postgres
   TEST_DB_PASSWORD=postgres

   # Test Database URL
   TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/domain_audit_test
   ```

3. **Set up the test database:**

   ```bash
   npm run test:db:setup
   ```

   This will:

   - Create the test database if it doesn't exist
   - Run all migrations to set up the schema
   - Prepare the database for testing

## Running Tests

### All Tests

```bash
npm test
```

### Database Tests Only

```bash
npm run test:integration
```

### Individual Test File

```bash
npx jest tests/integration/database/database-operations.test.js
```

## Database Management Commands

### Setup Database

```bash
npm run test:db:setup
```

Creates the test database and runs migrations.

### Reset Database

```bash
npm run test:db:reset
```

Clears all data from the test database but keeps the schema.

### Teardown Database

```bash
npm run test:db:teardown
```

Completely removes the test database.

## Troubleshooting

### Connection Refused Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:** PostgreSQL is not running. Start it:

- **Windows:** Check Windows Services for "postgresql" service
- **macOS:** `brew services start postgresql`
- **Linux:** `sudo systemctl start postgresql`
- **Docker:** `docker start postgres-test`

### Authentication Failed

```
Error: password authentication failed for user "postgres"
```

**Solution:** Check your credentials in `.env.test`:

1. Verify the username and password
2. Make sure the user exists in PostgreSQL
3. Check that the user has permission to create databases

### Database Already Exists

```
Error: database "domain_audit_test" already exists
```

**Solution:** This is usually fine. The setup script will use the existing database.

### Permission Denied

```
Error: permission denied to create database
```

**Solution:** The user needs CREATEDB permission:

```sql
-- Connect to PostgreSQL as superuser
ALTER USER postgres CREATEDB;
```

### Port Already in Use

```
Error: Port 5432 is already in use
```

**Solution:** Another PostgreSQL instance is running:

1. Stop the other instance, or
2. Change the port in `.env.test` to 5433 or another available port

## Test Database Schema

The test database includes these tables:

- `users` - User accounts and authentication
- `audits` - Audit records and results
- `tiers` - Subscription tiers and limits
- `notifications` - User notifications
- `sessions` - User sessions (if using database sessions)

## CI/CD Integration

For continuous integration, you can use Docker:

```yaml
# .github/workflows/test.yml
services:
  postgres:
    image: postgres:14
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: domain_audit_test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

## Development Tips

1. **Fast Test Runs:** Use `npm run test:db:reset` between test runs instead of full setup
2. **Debugging:** Set `LOG_LEVEL=debug` in `.env.test` to see SQL queries
3. **Performance:** The test database uses connection pooling for better performance
4. **Isolation:** Each test runs in a transaction that's rolled back automatically

## Getting Help

If you're still having issues:

1. Check that PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Test connection manually: `psql -h localhost -p 5432 -U postgres`
3. Check the logs in your PostgreSQL installation
4. Verify your `.env.test` configuration matches your PostgreSQL setup

For Docker users, check container logs: `docker logs postgres-test`
