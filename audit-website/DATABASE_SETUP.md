# Database Setup Guide

This application has been migrated from SQLite to PostgreSQL using Neon.tech as the managed hosting service.

## 🚀 Quick Setup

### 1. Get Your Neon Connection String

1. Go to [Neon.tech](https://neon.tech)
2. Create a new account or sign in
3. Create a new project
4. Copy the connection string from your dashboard

### 2. Update Environment Variables

Add your PostgreSQL connection string to `.env`:

```env
# PostgreSQL Database (Neon.tech)
DATABASE_URL=postgresql://username:password@hostname:5432/database?sslmode=require

# Session Secret (generate a strong random string)
SESSION_SECRET=your-super-secret-session-key-here

# Other environment variables...
NODE_ENV=development
PORT=3000
```

### 3. Run Database Migrations

```bash
# Check migration status
node scripts/migrate.js status

# Run all pending migrations
node scripts/migrate.js migrate
```

### 4. Start the Application

```bash
npm start
```

## 📊 Database Schema

### Users Table

- `id` - Primary key (auto-increment)
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `first_name` - User's first name
- `last_name` - User's last name
- `plan` - Subscription plan ('free', 'professional', 'business')
- `email_verified` - Email verification status
- `last_login` - Last login timestamp
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Audits Table

- `id` - Primary key (auto-increment)
- `user_id` - Foreign key to users (nullable for anonymous audits)
- `domain` - Domain being audited
- `audit_type` - Type of audit ('full', 'quick', 'custom')
- `config` - JSONB configuration options
- `status` - Audit status ('pending', 'running', 'completed', 'failed')
- `results` - JSONB audit results
- `score` - Overall audit score (0-100)
- `created_at` - Audit creation timestamp
- `completed_at` - Audit completion timestamp

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run migrations
node scripts/migrate.js migrate

# Check migration status
node scripts/migrate.js status

# Start development server
npm run dev

# Run tests
npm test

# Check for errors
npm run lint
```

## 🏗️ Architecture

### Models

- `models/database.js` - Database connection and query helpers
- `models/User.js` - User model with authentication methods
- `models/Audit.js` - Audit model with CRUD operations
- `models/migrations.js` - Migration system

### Controllers

- `controllers/authController.js` - Authentication and user management
- `controllers/indexController.js` - Homepage and general routes
- `controllers/auditController.js` - Audit processing

### Routes

- `routes/auth.js` - Authentication routes
- `routes/index.js` - General application routes
- `routes/audit.js` - Audit-related routes

## 🔐 Security Features

- **Password Hashing**: bcryptjs with 12 rounds
- **Session Management**: Express sessions with secure cookies
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Express rate limiting middleware
- **Input Validation**: Comprehensive validation for all inputs

## 📈 Performance Features

- **Connection Pooling**: PostgreSQL connection pool
- **Indexes**: Optimized database indexes for queries
- **JSONB**: Efficient JSON storage for flexible data
- **Prepared Statements**: Query optimization

## 🚨 Error Handling

- **Balanced Logging**: Error logs with context without sensitive data
- **Graceful Degradation**: Fallbacks for database failures
- **Transaction Support**: Atomic operations for data consistency
- **Connection Recovery**: Automatic reconnection on connection loss

## 📝 Migration System

The application uses a custom migration system:

- Migrations are stored in `migrations/` directory
- Migration status is tracked in `schema_migrations` table
- Migrations run in alphabetical order
- Each migration runs in a transaction
- Failed migrations are logged and halt the process

## 🔄 Backup Strategy

For production deployments:

- Neon provides automatic backups
- Consider additional backup strategies for critical data
- Test restore procedures regularly

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
node -e "import('./models/database.js').then(db => db.testConnection())"
```

### Migration Issues

```bash
# Check migration status
node scripts/migrate.js status

# View migration logs
tail -f logs/app.log
```

### Authentication Issues

- Check bcryptjs installation: `npm list bcryptjs`
- Verify session configuration in `app.js`
- Check password minimum length requirements

## 📚 Further Reading

- [Neon.tech Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Session Guide](https://github.com/expressjs/session)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
