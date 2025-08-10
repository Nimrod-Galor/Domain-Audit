# Database Environment Management Guide

## 🗄️ **Multi-Environment Database Strategy**

This project uses **three separate databases** to ensure proper isolation and safety:

### **Environment Overview**

| Environment     | Database            | Purpose                  | Configuration     |
| --------------- | ------------------- | ------------------------ | ----------------- |
| **Development** | `domain_audit_dev`  | Local coding & debugging | `.env`            |
| **Testing**     | `domain_audit_test` | Automated Jest tests     | `.env.test`       |
| **Production**  | `domain_audit_prod` | Live application         | `.env.production` |

---

## 🏗️ **Neon Database Setup**

### **Step 1: Create Separate Neon Databases**

1. **Go to [Neon Console](https://console.neon.tech/)**
2. **Create three separate databases:**
   - `domain_audit_dev` - Development
   - `domain_audit_test` - Testing
   - `domain_audit_prod` - Production

### **Step 2: Configure Environment Files**

#### **Development (`.env`)**

```bash
DATABASE_URL=postgresql://user:pass@dev-endpoint.neon.tech/domain_audit_dev?sslmode=require
NODE_ENV=development
```

#### **Testing (`.env.test`)**

```bash
TEST_DATABASE_URL=postgresql://user:pass@test-endpoint.neon.tech/domain_audit_test?sslmode=require
NODE_ENV=test
DISABLE_EMAIL=true
DISABLE_STRIPE=true
```

#### **Production (`.env.production`)**

```bash
DATABASE_URL=postgresql://user:pass@prod-endpoint.neon.tech/domain_audit_prod?sslmode=require
NODE_ENV=production
```

---

## 🚀 **Usage by Environment**

### **Development**

```bash
# Start development server
npm run web:start

# Uses: .env (development database)
```

### **Testing**

```bash
# Run tests
npm run test

# Uses: .env.test (test database)
```

### **Production**

```bash
# Deploy to production
npm start

# Uses: .env.production (production database)
```

---

## 🔒 **Security Benefits**

### **Data Isolation**

- ✅ Tests never affect development data
- ✅ Development never affects production
- ✅ Each environment has independent schema

### **Risk Mitigation**

- ✅ Zero chance of test data in production
- ✅ Safe schema migrations per environment
- ✅ Independent backup strategies

### **Performance Optimization**

- ✅ Test database optimized for speed
- ✅ Development database with realistic data
- ✅ Production database with high availability

---

## 🛠️ **Database Management Commands**

### **Environment-Specific Operations**

```bash
# Development database setup
NODE_ENV=development npm run migrate

# Test database setup
NODE_ENV=test npm run test:db:setup

# Production database setup
NODE_ENV=production npm run migrate:production
```

### **Data Management**

```bash
# Reset test database (safe)
npm run test:db:reset

# Seed development data
npm run seed:dev

# Backup production data
npm run backup:production
```

---

## 📊 **Cost Optimization (Neon)**

### **Resource Allocation**

| Environment     | Compute   | Storage | Usage Pattern |
| --------------- | --------- | ------- | ------------- |
| **Development** | Shared    | 1GB     | Intermittent  |
| **Testing**     | Minimal   | 500MB   | On-demand     |
| **Production**  | Dedicated | 5GB+    | 24/7          |

### **Neon Branches**

Consider using **Neon Branches** for cost-effective database separation:

- Main branch: Production
- Dev branch: Development
- Test branch: Testing

---

## 🔄 **Migration Strategy**

### **Development → Testing → Production**

1. **Develop** on development database
2. **Test** schema changes on test database
3. **Deploy** validated changes to production

### **Schema Synchronization**

```bash
# Apply migrations in order
npm run migrate:dev    # Development first
npm run migrate:test   # Test validation
npm run migrate:prod   # Production deployment
```

---

## ⚠️ **Important Notes**

### **Never:**

- Use production database for development
- Run tests against development database
- Mix environment data

### **Always:**

- Use separate credentials per environment
- Backup before production migrations
- Test migrations on non-production first

---

## 🎯 **Next Steps**

1. **Create separate Neon databases**
2. **Update environment files with correct URLs**
3. **Run migrations for each environment**
4. **Test the separation**
5. **Document your specific database URLs**

This setup provides enterprise-level database management while maintaining development agility and production safety.
