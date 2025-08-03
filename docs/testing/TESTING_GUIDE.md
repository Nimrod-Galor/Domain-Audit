# Testing Suite Documentation

## Overview

This comprehensive testing suite provides complete coverage for the Domain Link Audit tool, ensuring reliability, performance, and maintainability of all audit functionality.

## Test Architecture

### Framework Stack

- **Jest 30.0.5**: Primary testing framework with ES modules support
- **Playwright 1.54.2**: Browser integration testing
- **Cheerio**: DOM manipulation testing (via existing codebase)

### Test Organization

```
tests/
├── unit/                   # Unit tests for individual modules
│   ├── dom-processor.test.js
│   ├── seo-extractor.test.js
│   └── content-extractor-simple.test.js
├── integration/           # Integration tests for workflows
│   ├── basic-workflow.test.js
│   └── advanced-analytics.test.js
├── playwright/           # Browser tests (separate from Jest)
│   └── playwright.test.js
└── setup.js              # Global test configuration
```

## Test Coverage

### Unit Tests (15 tests passing)

1. **DOM Processor Tests** (6 tests)

   - HTML parsing and DOM creation
   - Link extraction and analysis
   - Error handling for malformed content
   - Performance optimization for large documents

2. **SEO Extractor Tests** (6 tests)

   - Meta tag extraction (title, description, Open Graph)
   - SEO scoring calculations
   - Structured data detection
   - Missing element handling

3. **Content Extractor Tests** (9 tests)
   - Text content analysis and word counting
   - Readability score calculations
   - Content-to-code ratio analysis
   - Error handling and edge cases

### Integration Tests (14 tests passing)

1. **Basic Workflow Tests** (7 tests)

   - Complete page analysis workflow
   - Cross-module integration
   - Error handling with malformed HTML
   - Performance benchmarking

2. **Advanced Analytics Tests** (7 tests)
   - Comprehensive SEO scoring
   - Content depth analysis
   - Link pattern analysis
   - Complex content handling

### Browser Tests (Playwright)

- Real website auditing
- Performance measurement
- Cross-browser compatibility
- Live link validation

## Running Tests

### All Tests

```bash
npm test                    # Jest tests only
npm run test:all           # Jest + Playwright tests
```

### Specific Test Types

```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:playwright    # Browser tests only
```

### Test Development

```bash
npm run test:watch         # Watch mode for development
npm run test:coverage      # Coverage reporting
```

### Setup (First Time)

```bash
npm run test:setup         # Install Playwright browsers
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

- ES Modules support via `--experimental-vm-modules`
- Test environment: Node.js
- Coverage reporting enabled
- Pattern matching for test files

### Global Setup (`tests/setup.js`)

- Mock console utilities
- DOM creation helpers
- Fetch mocking
- Common test utilities

## Test Patterns

### Unit Test Structure

```javascript
import { describe, test, expect, beforeEach } from "@jest/globals";
import { ModuleClass } from "../src/module.js";

describe("ModuleClass", () => {
  let instance;

  beforeEach(() => {
    instance = new ModuleClass();
  });

  test("should perform expected behavior", async () => {
    const result = await instance.method(input);
    expect(result).toBeDefined();
    expect(result.property).toBe(expectedValue);
  });
});
```

### Integration Test Structure

```javascript
// Test complete workflows across multiple modules
test("should perform complete analysis workflow", async () => {
  const processor = new DOMProcessor();
  const extractor = new ContentExtractor();

  const { document } = await processor.createDOM(html, url);
  const contentData = extractor.extractContentDataOptimized(document, html);
  const seoData = extractSEOData(document);

  // Verify cross-module integration
  expect(contentData.wordCount).toBeGreaterThan(0);
  expect(seoData.title.text).toBeDefined();
});
```

## Mock Strategies

### DOM Mocking

- Uses actual Cheerio DOM creation for realistic testing
- Creates mock HTML structures for various scenarios
- Tests both valid and malformed HTML handling

### Network Mocking

- Global fetch mock in setup.js
- Prevents external network calls during testing
- Allows controlled response simulation

### Console Mocking

- Captures console output for testing
- Prevents test output pollution
- Enables console-based error testing

## Performance Testing

### Metrics Tracked

- DOM processing time for large documents
- Memory usage patterns
- Cache effectiveness
- Analysis completion times

### Performance Thresholds

- Large document processing: < 2 seconds
- Basic analysis workflow: < 1 second
- Complex content analysis: < 1 second

## Error Handling Testing

### Scenarios Covered

- Malformed HTML documents
- Missing DOM elements
- Empty content handling
- Network failures (via mocks)
- Invalid input data

### Error Recovery

- Graceful degradation testing
- Default value provision
- Error message validation
- Partial result handling

## Test Data

### HTML Test Cases

- Well-optimized pages with comprehensive SEO
- Poorly optimized pages for negative testing
- Edge cases (empty content, malformed HTML)
- Complex content with mixed media types
- Large documents for performance testing

### Expected Behaviors

- SEO scores within realistic ranges (0-100+)
- Content metrics that match actual extraction
- Error handling that doesn't crash the application
- Performance within acceptable thresholds

## Continuous Integration

### Test Automation

- All tests run on every code change
- Coverage reporting integrated
- Performance regression detection
- Cross-platform compatibility testing

### Quality Gates

- 100% test pass rate required
- Performance thresholds maintained
- No regression in functionality
- Comprehensive coverage of new features

## Best Practices

### Test Writing

1. Test behavior, not implementation
2. Use realistic test data
3. Test both success and failure paths
4. Keep tests independent and isolated
5. Use descriptive test names

### Test Maintenance

1. Update tests when functionality changes
2. Remove obsolete tests promptly
3. Refactor test code for clarity
4. Keep test data current and relevant
5. Monitor test performance

### Debugging Tests

1. Use focused test runs (`test.only`)
2. Leverage Jest's debugging capabilities
3. Check mock configurations
4. Verify test data accuracy
5. Review console output for clues

## Coverage Goals

### Current Coverage

- **Unit Tests**: Core functionality covered
- **Integration Tests**: Major workflows tested
- **Error Handling**: Edge cases covered
- **Performance**: Benchmarks established

### Target Coverage

- Line coverage: >90%
- Branch coverage: >85%
- Function coverage: >95%
- Integration coverage: >80%

## Future Enhancements

### Planned Additions

1. Visual regression testing
2. API endpoint testing
3. Database integration testing
4. Load testing for high-volume scenarios
5. Security testing for audit data

### Tool Improvements

1. Custom Jest matchers for audit-specific assertions
2. Test data generators for various content types
3. Performance profiling integration
4. Automated test report generation
5. Cross-browser testing automation

## Troubleshooting

### Common Issues

1. **ES Modules Errors**: Ensure `--experimental-vm-modules` flag is used
2. **Playwright Conflicts**: Keep Playwright tests separate from Jest
3. **Mock Failures**: Verify global mocks in setup.js
4. **Performance Issues**: Check for infinite loops in test data
5. **Coverage Gaps**: Review excluded patterns in jest.config.js

### Debug Commands

```bash
# Run specific test file
npm test -- dom-processor.test.js

# Run tests with verbose output
npm test -- --verbose

# Debug specific test
npm test -- --testNamePattern="specific test name"

# Check coverage for specific file
npm run test:coverage -- --collectCoverageFrom="src/specific-file.js"
```

## Conclusion

This comprehensive testing suite ensures the Domain Link Audit tool maintains high quality, performance, and reliability. The combination of unit tests, integration tests, and browser tests provides confidence in the tool's functionality across various scenarios and environments.

Regular test maintenance and continuous improvement of test coverage help maintain the tool's robustness as new features are added and existing functionality evolves.
