# 🚀 Three Neon Projects Setup Guide

## 📋 **Your Current Neon Projects**

✅ **Domain Audit Development** - Development environment  
✅ **Domain Audit Testing** - Testing environment  
✅ **Domain Audit Production** - Production environment

---

## 🔧 **Step 1: Get Connection Strings**

For each Neon project, get the connection string:

### **1. Domain Audit Development**

1. Open [Neon Console](https://console.neon.tech/)
2. Select **"Domain Audit Development"** project
3. Go to **Dashboard** → **Connection Details**
4. Copy the **Connection String** (looks like):
   ```
   postgresql://username:password@endpoint.neon.tech/neondb?sslmode=require
   ```

### **2. Domain Audit Testing**

1. Select **"Domain Audit Testing"** project
2. Copy its connection string

### **3. Domain Audit Production**

1. Select **"Domain Audit Production"** project
2. Copy its connection string

---

## 📝 **Step 2: Update Environment Files**

### **Development Environment (.env)**

Replace the DATABASE_URL in `.env`:

```bash
DATABASE_URL=postgresql://your_dev_user:your_dev_password@your_dev_endpoint.neon.tech/neondb?sslmode=require&channel_binding=require
```

### **Testing Environment (.env.test)**

Replace the TEST_DATABASE_URL in `.env.test`:

```bash
TEST_DATABASE_URL=postgresql://your_test_user:your_test_password@your_test_endpoint.neon.tech/neondb?sslmode=require&channel_binding=require
```

### **Production Environment (.env.production)**

Replace the DATABASE_URL in `.env.production`:

```bash
DATABASE_URL=postgresql://your_prod_user:your_prod_password@your_prod_endpoint.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## 🗄️ **Step 3: Initialize Databases**

Run these commands **in order** after updating the connection strings:

### **1. Setup Development Database**

```bash
npm run db:dev:setup
```

- Creates tables (users, audits, notifications)
- Creates dev test user: `dev@example.com` / `dev123`

### **2. Setup Testing Database**

```bash
npm run db:test:setup
```

- Creates clean test tables
- Creates test user: `test@example.com` / `test123`

### **3. Setup Production Database (when ready)**

```bash
npm run db:prod:setup
```

- Creates production tables
- No test users (production-safe)

---

## 🧪 **Step 4: Test Each Environment**

### **Test Development**

```bash
npm run web:start
# Visit: http://localhost:3000
# Login: dev@example.com / dev123
```

### **Test Testing Environment**

```bash
npm run test
# Should use test database automatically
```

### **Test Production (when deployed)**

```bash
NODE_ENV=production npm start
# Uses production database
```

---

## 🔒 **Step 5: Security Configuration**

### **Environment Variables Summary**

| File              | Environment | Database Project         |
| ----------------- | ----------- | ------------------------ |
| `.env`            | Development | Domain Audit Development |
| `.env.test`       | Testing     | Domain Audit Testing     |
| `.env.production` | Production  | Domain Audit Production  |

### **Important Notes:**

- ✅ **Never** use production database for development
- ✅ **Always** test migrations on dev/test first
- ✅ Keep production credentials secure
- ✅ Use different passwords for each environment

---

## 🎯 **Quick Commands Reference**

```bash
# Setup commands
npm run db:dev:setup     # Initialize development DB
npm run db:test:setup    # Initialize testing DB
npm run db:prod:setup    # Initialize production DB

# Run environments
npm run web:start        # Development server
npm run test            # Test suite
NODE_ENV=production npm start  # Production

# Check database status
npm run db:check:dev    # Check development DB
npm run db:check:test   # Check testing DB
npm run db:check:prod   # Check production DB
```

---

## 🚨 **Before You Continue:**

1. **Update .env files** with your actual Neon connection strings
2. **Run database setup** for each environment
3. **Test connections** to verify everything works
4. **Keep credentials secure** - never commit real credentials to git

---

## 📞 **Need Help?**

If you encounter issues:

1. Verify connection strings are correct
2. Check Neon projects are running
3. Ensure SSL settings are proper
4. Test network connectivity

Your three-database setup provides enterprise-level separation and safety! 🎉
