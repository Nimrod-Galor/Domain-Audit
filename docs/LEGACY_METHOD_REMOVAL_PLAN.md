# 🗂️ Legacy Method Removal Plan

## Overview

This document outlines the plan for safely removing legacy compatibility methods from the analyzer ecosystem while maintaining backward compatibility during the transition period.

## Current Legacy Methods

### Active Legacy Methods (with @deprecated tags)

- `analyzeBusinessAnalytics()` - BusinessAnalyticsAnalyzer
- `analyzeCheckout()` - CheckoutAnalyzer
- `analyzeEcommerce()` - EcommerceAnalyzer
- `analyzeCart()` - CartAnalyzer (if exists)
- `analyzePayment()` - PaymentAnalyzer (if exists)
- `analyzeConversion()` - ConversionOptimizer (if exists)

## Removal Timeline

### ⚠️ Phase 1: Assessment Complete (August 2025)

**Status:** Cannot remove yet - active dependencies found

**Blockers:**

- Unit tests still call legacy methods
- Integration tests extensively use `analyzeEcommerce()`
- Backward compatibility requirements for existing integrations

### 🔄 Phase 2: Migration Preparation (September - October 2025)

**Duration:** 1-2 months
**Goal:** Prepare for safe removal

#### Required Actions:

1. **Update Test Suite**

   ```bash
   # Update all test files to use analyze() instead of legacy methods
   find tests/ -name "*.js" -exec sed -i 's/analyzeEcommerce(/analyze(/g' {} \;
   find tests/ -name "*.js" -exec sed -i 's/analyzeCheckout(/analyze(/g' {} \;
   find tests/ -name "*.js" -exec sed -i 's/analyzeBusinessAnalytics(/analyze(/g' {} \;
   ```

2. **Add Enhanced Deprecation Warnings**

   ```javascript
   analyzeBusinessAnalytics(dom, pageData, url) {
     const deprecationDate = '2026-03-01';
     console.warn(`⚠️  DEPRECATION WARNING: analyzeBusinessAnalytics() will be removed on ${deprecationDate}.`);
     console.warn('📖 Migration Guide: Use analyze() method with context object instead.');
     console.warn('🔗 Documentation: https://domain-audit.docs/migration-guide');

     // Convert to new format and delegate
     return this.analyze({ document: dom.window?.document || dom, url, pageData });
   }
   ```

3. **Create Migration Documentation**

   - Update README with migration examples
   - Create detailed migration guide
   - Add code examples for each legacy method

4. **Version Compatibility Matrix**
   ```
   v1.0.x - v1.5.x: Legacy methods supported, no warnings
   v1.6.x - v1.9.x: Legacy methods supported, deprecation warnings
   v2.0.x+: Legacy methods removed
   ```

### ⏳ Phase 3: Deprecation Period (November 2025 - February 2026)

**Duration:** 3-4 months
**Goal:** Grace period with warnings

#### Actions:

1. **Release v1.6.0** with deprecation warnings
2. **Monitor usage** through telemetry (if available)
3. **Communicate timeline** in release notes
4. **Support users** with migration questions

#### Success Metrics:

- Zero test failures with legacy methods disabled
- Minimal support requests about deprecations
- External integrations updated

### ✅ Phase 4: Safe Removal (March 2026+)

**Prerequisites:** All conditions must be met

#### Removal Conditions:

- [ ] **Deprecation period completed** (minimum 3 months)
- [ ] **Major version bump** (v2.0.0)
- [ ] **Zero detected usage** in monitoring
- [ ] **All tests migrated** to new methods
- [ ] **Documentation updated**
- [ ] **External integrations confirmed** migrated

#### Removal Process:

1. Remove legacy method implementations
2. Update JSDoc to remove @deprecated tags
3. Remove compatibility tests
4. Update changelog with breaking changes
5. Publish v2.0.0 with clear migration notes

## Migration Examples

### Before (Legacy)

```javascript
// Old approach - will be removed
const result = await analyzer.analyzeBusinessAnalytics(dom, pageData, url);
const checkout = analyzer.analyzeCheckout(document);
const ecommerce = await analyzer.analyzeEcommerce(dom, pageData, url);
```

### After (Current)

```javascript
// New approach - recommended
const context = { document, url, pageData };
const result = await analyzer.analyze(context);

// For checkout analysis
const checkoutContext = { document };
const checkout = await checkoutAnalyzer.analyze(checkoutContext);

// For ecommerce analysis
const ecommerceContext = { document, url, pageData };
const ecommerce = await ecommerceAnalyzer.analyze(ecommerceContext);
```

## Risk Mitigation

### Backward Compatibility Strategy

1. **Semantic Versioning** - Only remove in major versions
2. **Long Deprecation Period** - Minimum 3 months warning
3. **Clear Migration Path** - Detailed documentation and examples
4. **Gradual Warnings** - Start with info, escalate to warnings

### Rollback Plan

If issues arise during removal:

1. Restore legacy methods in patch release
2. Extend deprecation period
3. Improve migration documentation
4. Address specific user concerns

## Communication Plan

### Developer Communication

- **Release Notes** - Clear deprecation announcements
- **Documentation Updates** - Migration guides and examples
- **GitHub Issues** - Proactive support for migration questions
- **Version Tags** - Clear version compatibility matrix

### Timeline Communication

```
v1.6.0 (Nov 2025): "Legacy methods deprecated, removal in v2.0.0 (March 2026)"
v1.7.0 (Dec 2025): "Legacy methods deprecated, removal in 3 months"
v1.8.0 (Jan 2026): "Legacy methods deprecated, removal in 2 months"
v1.9.0 (Feb 2026): "Legacy methods deprecated, removal in 1 month"
v2.0.0 (Mar 2026): "Legacy methods removed - use analyze() method"
```

## Testing Strategy

### Pre-removal Testing

1. **Disable legacy methods** in test environment
2. **Run complete test suite** with new methods only
3. **Test external integrations** with new API
4. **Performance benchmarks** - ensure no regression

### Post-removal Validation

1. **Clean builds** without legacy code
2. **Reduced bundle size** verification
3. **API consistency** checks
4. **Documentation accuracy** validation

## Decision Criteria

### Ready to Remove When:

- ✅ All internal tests use new methods
- ✅ No legacy method calls in production logs
- ✅ External users confirmed migrated
- ✅ Documentation completely updated
- ✅ Support team trained on new API
- ✅ Rollback plan tested and ready

### Extend Timeline If:

- ❌ Active usage detected in telemetry
- ❌ Critical external integrations not migrated
- ❌ Support requests indicate confusion
- ❌ Test failures with legacy methods disabled

## Conclusion

**Current Recommendation (August 2025): DO NOT REMOVE YET**

Legacy methods are still actively used in tests and potentially production. Follow the phased approach above for safe removal by March 2026.

**Next Steps:**

1. Update test suite to use new `analyze()` methods
2. Add deprecation warnings to legacy methods
3. Create migration documentation
4. Plan v1.6.0 release with deprecation notices

**Timeline Summary:**

- **Now - Oct 2025:** Preparation and test migration
- **Nov 2025 - Feb 2026:** Deprecation period with warnings
- **Mar 2026+:** Safe removal in major version bump

---

_Last Updated: August 8, 2025_
_Next Review: September 15, 2025_
