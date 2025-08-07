# Setting Up Neon PostgreSQL for Testing

This guide will help you configure Neon as your PostgreSQL provider for testing the Domain Audit application.

## 🚀 Quick Setup

### 1. Create a Neon Account

1. Go to [Neon Console](https://console.neon.tech)
2. Sign up for a free account
3. Create a new project for testing

### 2. Get Your Database Credentials

1. In your Neon project dashboard, go to "Settings" → "General"
2. Copy your connection details:
   - **Host**: `your-project-id.neon.tech`
   - **Database**: Usually your project name
   - **Username**: Usually your account name
   - **Password**: Generated for you

### 3. Configure Environment Variables

1. Open `.env.test` in your project root
2. Replace the placeholder values with your actual Neon credentials:

```bash
# Neon PostgreSQL Database Configuration
TEST_DB_HOST=ep-example-123456.us-east-2.aws.neon.tech
TEST_DB_PORT=5432
TEST_DB_NAME=neondb
TEST_DB_USER=your-username
TEST_DB_PASSWORD=your-actual-password

# Neon Database URL
TEST_DATABASE_URL=postgresql://your-username:your-actual-password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 4. Test the Connection

```bash
npm run test:db:setup
```

## 📋 Finding Your Neon Credentials

### Method 1: Connection String (Easiest)

1. In Neon Console, go to your project
2. Click "Connect" button
3. Copy the connection string that looks like:
   ```
   postgresql://username:password@hostname/database?sslmode=require
   ```
4. Use this as your `TEST_DATABASE_URL`

### Method 2: Individual Components

1. **Host**: Found in "Connection Details" section
2. **Database**: Usually `neondb` or your project name
3. **Username**: Your Neon username
4. **Password**: Click "Show password" to reveal

## ✅ Verification

After setup, run:

```bash
npm run test:db:setup
```

You should see:

```
✅ Connected to Neon database: neondb
📦 Running migrations...
✅ All migrations completed successfully
✅ Test database setup complete
```

## 🔧 Configuration Example

Here's a complete `.env.test` example with Neon:

```bash
# Neon PostgreSQL Configuration
TEST_DB_HOST=ep-weathered-lab-123456.us-east-2.aws.neon.tech
TEST_DB_PORT=5432
TEST_DB_NAME=neondb
TEST_DB_USER=nimrod
TEST_DB_PASSWORD=abc123xyz789

# Complete connection string
TEST_DATABASE_URL=postgresql://nimrod:abc123xyz789@ep-weathered-lab-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# Test settings
NODE_ENV=test
LOG_LEVEL=error
SESSION_SECRET=test_session_secret_for_tests_only

# Disable external services in tests
DISABLE_EMAIL=true
DISABLE_STRIPE=true
DISABLE_GOOGLE_OAUTH=true

# Neon-specific settings
PGSSL=true
PGSSLMODE=require
```

## 🛡️ Security Best Practices

1. **Never commit credentials** to version control
2. **Use different databases** for testing vs production
3. **Limit permissions** on your test database user
4. **Use connection pooling** (automatically handled by our setup)

## 🔍 Troubleshooting

### Connection Timeout

- Check your Neon host URL is correct
- Verify your username and password
- Ensure SSL is enabled (`sslmode=require`)

### Permission Denied

- Verify your Neon user has database creation permissions
- Check that your password is correct (no special characters that need escaping)

### SSL/TLS Issues

- Ensure `sslmode=require` is in your connection string
- Verify `PGSSL=true` is set in your environment

### Database Not Found

- Check the database name matches your Neon project
- Verify the database exists in your Neon console

## 🚀 Running Tests

Once configured, run the full test suite:

```bash
# Setup database
npm run test:db:setup

# Run all tests
npm test

# Run only database tests
npm run test:integration

# Run specific test file
npx jest tests/integration/database/database-operations.test.js
```

## 💰 Neon Free Tier

Neon's free tier includes:

- ✅ 3 GB storage
- ✅ 1 million rows
- ✅ SSL connections
- ✅ Automatic backups

This is perfect for testing and development!

## 🆘 Need Help?

1. Check [Neon Documentation](https://neon.tech/docs)
2. Verify your connection string format
3. Test connection manually: `psql "postgresql://user:pass@host/db?sslmode=require"`
4. Check Neon Console for any project-specific settings
