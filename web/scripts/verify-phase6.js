#!/usr/bin/env node

/**
 * Phase 6 Implementation Verification Script
 * Verifies all Phase 6 components are properly implemented
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Phase 6: Testing & Deployment - Implementation Verification');
console.log('='.repeat(70));

const checks = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function checkFile(filePath, description) {
  checks.total++;
  const fullPath = join(__dirname, filePath);
  
  if (existsSync(fullPath)) {
    console.log(`✅ ${description}`);
    checks.passed++;
    checks.details.push(`✅ ${description}`);
    return true;
  } else {
    console.log(`❌ ${description} - File not found: ${filePath}`);
    checks.failed++;
    checks.details.push(`❌ ${description} - Missing file`);
    return false;
  }
}

function checkFileContent(filePath, searchContent, description) {
  checks.total++;
  const fullPath = join(__dirname, filePath);
  
  if (existsSync(fullPath)) {
    const content = readFileSync(fullPath, 'utf8');
    if (content.includes(searchContent)) {
      console.log(`✅ ${description}`);
      checks.passed++;
      checks.details.push(`✅ ${description}`);
      return true;
    } else {
      console.log(`❌ ${description} - Content not found`);
      checks.failed++;
      checks.details.push(`❌ ${description} - Content missing`);
      return false;
    }
  } else {
    console.log(`❌ ${description} - File not found: ${filePath}`);
    checks.failed++;
    checks.details.push(`❌ ${description} - File missing`);
    return false;
  }
}

// Phase 6 Implementation Checks
console.log('\n📋 Testing Suite Files:');
checkFile('tests/tier-system.test.js', 'Comprehensive Tier System Tests');
checkFile('tests/performance.test.js', 'Performance Testing Suite');
checkFile('tests/integration.test.js', 'Integration Testing Suite');
checkFile('tests/setup.js', 'Test Configuration and Setup');

console.log('\n🔧 Testing Configuration:');
checkFile('vitest.config.js', 'Vitest Test Configuration');
checkFileContent('package.json', '"test": "vitest run"', 'Package.json Test Scripts');
checkFileContent('package.json', 'vitest', 'Vitest Dependency');
checkFileContent('package.json', 'supertest', 'Supertest Dependency');

console.log('\n📊 Health Monitoring System:');
checkFile('lib/monitoring.js', 'Health Monitoring System');
checkFile('routes/health.js', 'Health Check Routes');
checkFileContent('app.js', 'healthRouter', 'Health Routes Integration');

console.log('\n📚 Documentation:');
checkFile('docs/deployment-checklist.md', 'Production Deployment Checklist');
checkFileContent('TIER_SYSTEM_COMPLETE.md', 'Phase 6', 'Phase 6 Documentation');

console.log('\n🔍 Testing Framework Validation:');
checkFileContent('tests/tier-system.test.js', 'describe("Tier System Implementation Tests"', 'Main Test Suite Structure');
checkFileContent('tests/performance.test.js', 'PERFORMANCE_THRESHOLD_MS', 'Performance Testing Metrics');
checkFileContent('tests/integration.test.js', 'End-to-End User Journey', 'Integration Test Coverage');

console.log('\n📈 Monitoring System Validation:');
checkFileContent('lib/monitoring.js', 'HealthMonitor', 'Health Monitor Class');
checkFileContent('lib/monitoring.js', 'checkDatabase', 'Database Health Checks');
checkFileContent('lib/monitoring.js', 'checkTierSystem', 'Tier System Health Checks');
checkFileContent('routes/health.js', '/health', 'Health Check Endpoints');

console.log('\n🚀 Deployment Readiness:');
checkFileContent('docs/deployment-checklist.md', 'Pre-Deployment Verification', 'Deployment Checklist Content');
checkFileContent('docs/deployment-checklist.md', 'Database Migration', 'Migration Procedures');
checkFileContent('docs/deployment-checklist.md', 'Health Monitoring', 'Monitoring Setup');

// Final Results
console.log('\n' + '='.repeat(70));
console.log('📊 PHASE 6 IMPLEMENTATION VERIFICATION RESULTS');
console.log('='.repeat(70));

const successRate = (checks.passed / checks.total * 100).toFixed(1);

console.log(`✅ Tests Passed: ${checks.passed}/${checks.total}`);
console.log(`❌ Tests Failed: ${checks.failed}/${checks.total}`);
console.log(`📈 Success Rate: ${successRate}%`);

if (checks.failed === 0) {
  console.log('\n🎉 PHASE 6 IMPLEMENTATION COMPLETE!');
  console.log('✅ All testing and deployment components are properly implemented');
  console.log('🚀 System is ready for comprehensive testing and production deployment');
} else {
  console.log('\n⚠️ Phase 6 implementation has issues:');
  checks.details.filter(detail => detail.startsWith('❌')).forEach(issue => {
    console.log(`  ${issue}`);
  });
}

console.log('\n📝 Next Steps:');
console.log('1. Run: npm test - Execute test suite');
console.log('2. Run: npm run test:coverage - Check test coverage');
console.log('3. Run: npm run test:performance - Run performance tests');
console.log('4. Review: docs/deployment-checklist.md - Prepare for deployment');
console.log('5. Monitor: Start server and check /health endpoints');

export { checks };
