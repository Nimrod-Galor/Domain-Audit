/**
 * Test Failure Analysis Tool
 * Extracts and categorizes test failures for efficient fixing
 */

import fs from 'fs';
import path from 'path';

class TestFailureAnalyzer {
  constructor() {
    this.failures = [];
    this.summary = {
      totalFailures: 0,
      categories: {},
      files: {},
      errorTypes: {}
    };
  }

  /**
   * Parse test output and extract failures
   */
  parseTestOutput(outputFile) {
    if (!fs.existsSync(outputFile)) {
      console.log(`❌ Test output file not found: ${outputFile}`);
      return;
    }

    const content = fs.readFileSync(outputFile, 'utf8');
    const lines = content.split('\n');
    
    let currentTest = null;
    let inFailure = false;
    let failureDetails = [];

    for (const line of lines) {
      // Match test suite failures
      if (line.includes('FAIL ') && line.includes('.test.js')) {
        const match = line.match(/FAIL\s+(.+\.test\.js)/);
        if (match) {
          currentTest = {
            file: match[1],
            failures: []
          };
        }
      }

      // Match individual test failures
      if (line.includes('● ') && currentTest) {
        if (inFailure && failureDetails.length > 0) {
          // Save previous failure
          currentTest.failures.push({
            description: failureDetails[0],
            details: failureDetails.slice(1).join('\n').trim()
          });
          failureDetails = [];
        }
        
        inFailure = true;
        failureDetails = [line.replace('● ', '').trim()];
      } else if (inFailure && line.trim()) {
        failureDetails.push(line);
      } else if (inFailure && !line.trim()) {
        // End of failure details
        if (currentTest && failureDetails.length > 0) {
          currentTest.failures.push({
            description: failureDetails[0],
            details: failureDetails.slice(1).join('\n').trim()
          });
          failureDetails = [];
        }
        inFailure = false;
      }

      // When we reach the end of a test file or summary
      if ((line.includes('Test Suites:') || line.includes('FAIL ')) && currentTest && currentTest.failures.length > 0) {
        this.failures.push(currentTest);
        currentTest = null;
        inFailure = false;
        failureDetails = [];
      }
    }

    // Add any remaining test
    if (currentTest && currentTest.failures.length > 0) {
      this.failures.push(currentTest);
    }

    this.categorizeFailures();
  }

  /**
   * Categorize failures by type and priority
   */
  categorizeFailures() {
    this.summary.totalFailures = this.failures.reduce((sum, test) => sum + test.failures.length, 0);

    for (const testFile of this.failures) {
      const fileName = path.basename(testFile.file);
      this.summary.files[fileName] = testFile.failures.length;

      for (const failure of testFile.failures) {
        // Categorize by analyzer type
        let category = 'other';
        if (fileName.includes('open-graph')) category = 'social-media';
        else if (fileName.includes('twitter-card')) category = 'social-media';
        else if (fileName.includes('seo')) category = 'seo';
        else if (fileName.includes('business-intelligence')) category = 'business-intelligence';
        else if (fileName.includes('ecommerce')) category = 'ecommerce';
        else if (fileName.includes('technical')) category = 'technical';
        else if (fileName.includes('integration')) category = 'integration';
        else if (fileName.includes('web-vitals')) category = 'performance';

        if (!this.summary.categories[category]) {
          this.summary.categories[category] = 0;
        }
        this.summary.categories[category]++;

        // Categorize by error type
        let errorType = 'unknown';
        const details = failure.details.toLowerCase();
        if (details.includes('typeerror')) errorType = 'TypeError';
        else if (details.includes('referenceerror')) errorType = 'ReferenceError';
        else if (details.includes('cannot read properties')) errorType = 'Property Access';
        else if (details.includes('expected') && details.includes('received')) errorType = 'Assertion';
        else if (details.includes('timeout')) errorType = 'Timeout';
        else if (details.includes('import') || details.includes('export')) errorType = 'Module Import';
        else if (details.includes('context') || details.includes('legacy')) errorType = 'Context/Legacy';

        if (!this.summary.errorTypes[errorType]) {
          this.summary.errorTypes[errorType] = 0;
        }
        this.summary.errorTypes[errorType]++;
      }
    }
  }

  /**
   * Generate prioritized fix list
   */
  generateFixList() {
    const fixList = {
      immediate: [], // Critical failures that break basic functionality
      high: [],     // Analyzer-specific failures likely from Phase 6 changes
      medium: [],   // Integration test failures
      low: []       // Other failures
    };

    for (const testFile of this.failures) {
      const fileName = path.basename(testFile.file);
      
      for (const failure of testFile.failures) {
        const item = {
          file: fileName,
          test: failure.description,
          details: failure.details,
          category: this.getCategoryForFile(fileName),
          errorType: this.getErrorTypeFromDetails(failure.details)
        };

        // Prioritize based on error type and analyzer category
        if (item.errorType === 'Context/Legacy' || 
            item.details.toLowerCase().includes('nodeType') ||
            item.details.toLowerCase().includes('destructuring')) {
          fixList.immediate.push(item);
        } else if (['social-media', 'seo', 'business-intelligence'].includes(item.category) &&
                   ['TypeError', 'Property Access', 'Assertion'].includes(item.errorType)) {
          fixList.high.push(item);
        } else if (item.category === 'integration') {
          fixList.medium.push(item);
        } else {
          fixList.low.push(item);
        }
      }
    }

    return fixList;
  }

  getCategoryForFile(fileName) {
    if (fileName.includes('open-graph') || fileName.includes('twitter-card')) return 'social-media';
    if (fileName.includes('seo')) return 'seo';
    if (fileName.includes('business-intelligence')) return 'business-intelligence';
    if (fileName.includes('ecommerce')) return 'ecommerce';
    if (fileName.includes('technical')) return 'technical';
    if (fileName.includes('integration')) return 'integration';
    if (fileName.includes('web-vitals')) return 'performance';
    return 'other';
  }

  getErrorTypeFromDetails(details) {
    const lower = details.toLowerCase();
    if (lower.includes('typeerror')) return 'TypeError';
    if (lower.includes('cannot read properties')) return 'Property Access';
    if (lower.includes('expected') && lower.includes('received')) return 'Assertion';
    if (lower.includes('context') || lower.includes('legacy') || lower.includes('nodetype')) return 'Context/Legacy';
    if (lower.includes('import') || lower.includes('export')) return 'Module Import';
    if (lower.includes('timeout')) return 'Timeout';
    return 'Unknown';
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const fixList = this.generateFixList();
    
    const report = `# Test Failure Analysis Report

**Generated:** ${new Date().toISOString()}
**Total Failures:** ${this.summary.totalFailures}

## 📊 Failure Summary

### By Category
${Object.entries(this.summary.categories)
  .sort(([,a], [,b]) => b - a)
  .map(([cat, count]) => `- **${cat}:** ${count} failures`)
  .join('\n')}

### By Error Type
${Object.entries(this.summary.errorTypes)
  .sort(([,a], [,b]) => b - a)
  .map(([type, count]) => `- **${type}:** ${count} failures`)
  .join('\n')}

### By File
${Object.entries(this.summary.files)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([file, count]) => `- **${file}:** ${count} failures`)
  .join('\n')}

## 🚨 Priority Fix List

### IMMEDIATE (${fixList.immediate.length} items)
${fixList.immediate.map(item => `
#### ${item.file}
**Test:** ${item.test}
**Error Type:** ${item.errorType}
**Details:** ${item.details.split('\n')[0]}
`).join('')}

### HIGH PRIORITY (${fixList.high.length} items)
${fixList.high.map(item => `
#### ${item.file}
**Test:** ${item.test}
**Error Type:** ${item.errorType}
**Details:** ${item.details.split('\n')[0]}
`).join('')}

### MEDIUM PRIORITY (${fixList.medium.length} items)
${fixList.medium.map(item => `
#### ${item.file}
**Test:** ${item.test}
**Category:** ${item.category}
**Details:** ${item.details.split('\n')[0]}
`).join('')}

### LOW PRIORITY (${fixList.low.length} items)
${fixList.low.slice(0, 5).map(item => `
#### ${item.file}
**Test:** ${item.test}
**Details:** ${item.details.split('\n')[0]}
`).join('')}
${fixList.low.length > 5 ? `\n... and ${fixList.low.length - 5} more low priority items` : ''}

## 🔧 Recommended Fix Strategy

### Phase 1: Critical Legacy Issues (IMMEDIATE)
Focus on Context/Legacy errors that are likely from Phase 6 changes:
${fixList.immediate.map(item => `- Fix ${item.file}: ${item.test}`).join('\n')}

### Phase 2: Analyzer Core Issues (HIGH)
Fix core analyzer functionality:
${fixList.high.slice(0, 5).map(item => `- Fix ${item.file}: ${item.test}`).join('\n')}

### Phase 3: Integration Issues (MEDIUM)
Address integration test failures after core fixes.

### Phase 4: Remaining Issues (LOW)
Handle remaining edge cases and minor issues.

---

**Next Action:** Start with IMMEDIATE priority items - these are likely direct results of Phase 6 legacy removal.
`;

    return report;
  }

  /**
   * Save analysis results
   */
  saveAnalysis(outputFile = 'test-failures-prioritized.md') {
    const report = this.generateReport();
    fs.writeFileSync(outputFile, report);
    console.log(`📄 Test failure analysis saved to: ${outputFile}`);
    
    // Also save raw failure data as JSON for programmatic access
    const rawData = {
      summary: this.summary,
      failures: this.failures,
      fixList: this.generateFixList()
    };
    fs.writeFileSync('test-failures-data.json', JSON.stringify(rawData, null, 2));
    console.log(`📊 Raw failure data saved to: test-failures-data.json`);
  }

  /**
   * Display quick summary
   */
  displaySummary() {
    console.log(`\n📊 Test Failure Analysis Summary:`);
    console.log(`   Total Failures: ${this.summary.totalFailures}`);
    console.log(`   Failed Test Files: ${this.failures.length}`);
    
    const fixList = this.generateFixList();
    console.log(`\n🚨 Priority Breakdown:`);
    console.log(`   IMMEDIATE: ${fixList.immediate.length} (likely Phase 6 legacy issues)`);
    console.log(`   HIGH: ${fixList.high.length} (core analyzer issues)`);
    console.log(`   MEDIUM: ${fixList.medium.length} (integration issues)`);
    console.log(`   LOW: ${fixList.low.length} (other issues)`);
    
    console.log(`\n🎯 Top Error Types:`);
    Object.entries(this.summary.errorTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count} failures`);
      });
  }
}

// Main function
async function analyzeTestFailures() {
  console.log('🔍 Analyzing test failures...');
  
  const analyzer = new TestFailureAnalyzer();
  
  // Wait a bit for test output file to be available
  let attempts = 0;
  while (!fs.existsSync('test-failures-analysis.txt') && attempts < 30) {
    console.log(`⏳ Waiting for test output... (${attempts + 1}/30)`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
  
  if (!fs.existsSync('test-failures-analysis.txt')) {
    console.log('❌ Test output file not found. Make sure tests are running...');
    return;
  }
  
  analyzer.parseTestOutput('test-failures-analysis.txt');
  analyzer.displaySummary();
  analyzer.saveAnalysis();
  
  console.log('\n✅ Analysis complete! Check test-failures-prioritized.md for detailed breakdown.');
}

// Export for use as module
export { TestFailureAnalyzer };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeTestFailures().catch(console.error);
}
