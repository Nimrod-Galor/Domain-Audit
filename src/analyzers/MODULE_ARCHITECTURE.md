# Analyzer Module Architecture

## Overview

This document defines the standardized module architecture for all analyzers in the domain audit system.

## Directory Structure

```
src/analyzers/
├── core/                           # Core analyzer interfaces and base classes
│   ├── BaseAnalyzer.js            # Abstract base class for all analyzers
│   ├── AnalyzerInterface.js       # Interface definition
│   └── AnalyzerRegistry.js        # Central registry for all analyzers
│
├── performance/                    # Performance-related analyzers
│   ├── index.js                   # Module exports
│   ├── PageSpeedAnalyzer.js       # Page speed analysis
│   ├── ResourceAnalyzer.js        # Resource optimization analysis
│   └── CacheAnalyzer.js           # Caching analysis
│
├── seo/                           # SEO-related analyzers
│   ├── index.js                   # Module exports
│   ├── SEOAnalyzer.js             # Basic SEO analysis
│   ├── TechnicalSEOAnalyzer.js    # Technical SEO analysis
│   └── ContentSEOAnalyzer.js      # Content SEO analysis
│
├── accessibility/                 # Accessibility analyzers
│   ├── index.js                   # Module exports
│   ├── AccessibilityAnalyzer.js   # WCAG compliance analysis
│   └── ScreenReaderAnalyzer.js    # Screen reader compatibility
│
├── security/                      # Security analyzers
│   ├── index.js                   # Module exports
│   ├── SecurityAnalyzer.js        # General security analysis
│   ├── SSLAnalyzer.js             # SSL certificate analysis
│   └── HeaderAnalyzer.js          # Security headers analysis
│
├── content/                       # Content analysis
│   ├── index.js                   # Module exports
│   ├── ContentAnalyzer.js         # Content quality analysis
│   ├── ContentIntelligenceAnalyzer.js # AI-powered content analysis
│   └── ContentQualityAnalyzer.js  # Content quality metrics
│
├── technical/                     # Technical analyzers
│   ├── index.js                   # Module exports
│   ├── TechnicalAnalyzer.js       # Technical infrastructure
│   ├── MobileAnalyzer.js          # Mobile optimization
│   └── CDNAnalyzer.js             # CDN detection and analysis
│
├── links/                         # Link analysis
│   ├── index.js                   # Module exports
│   ├── LinkAnalyzer.js            # Basic link analysis
│   ├── AdvancedLinkAnalyzer.js    # Advanced link metrics
│   ├── LinkDepthAnalyzer.js       # Link depth calculation
│   └── OrphanedPagesAnalyzer.js   # Orphaned pages detection
│
├── business-intelligence/         # Business intelligence analyzers
│   ├── index.js                   # Module exports
│   ├── BusinessIntelligenceAnalyzer.js # Main business intelligence
│   ├── BusinessAnalyticsAnalyzer.js    # Business analytics
│   ├── trust/                     # Trust signal analysis
│   │   ├── index.js
│   │   └── TrustSignalAnalyzer.js
│   ├── contact/                   # Contact analysis
│   │   ├── index.js
│   │   └── ContactAnalyzer.js
│   ├── support/                   # Support analysis
│   │   ├── index.js
│   │   └── SupportAnalyzer.js
│   ├── location/                  # Location analysis
│   │   ├── index.js
│   │   └── LocationAnalyzer.js
│   └── about/                     # About page analysis
│       ├── index.js
│       └── AboutPageAnalyzer.js
│
├── ecommerce/                     # E-commerce analyzers
│   ├── index.js                   # Module exports
│   ├── EcommerceAnalyzer.js       # E-commerce functionality analysis
│   └── ProductAnalyzer.js         # Product page analysis
│
├── classification/                # Page classification
│   ├── index.js                   # Module exports
│   ├── PageTypeClassifier.js      # Page type classification
│   └── ContentClassifier.js       # Content classification
│
├── third-party/                   # Third-party analysis
│   ├── index.js                   # Module exports
│   ├── ThirdPartyAnalyzer.js      # Third-party script analysis
│   └── TrackingAnalyzer.js        # Tracking script analysis
│
└── index.js                       # Main analyzer exports
```

## Module Standards

### 1. Base Analyzer Class

All analyzers must extend the BaseAnalyzer class:

```javascript
import { BaseAnalyzer } from "../core/BaseAnalyzer.js";

export class MyAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super("MyAnalyzer", options);
  }

  async analyze(document, pageData, url) {
    // Implementation
  }
}
```

### 2. Export Pattern

Each module directory must have an index.js that exports all analyzers:

```javascript
export { MyAnalyzer } from "./MyAnalyzer.js";
export { AnotherAnalyzer } from "./AnotherAnalyzer.js";
```

### 3. Analyzer Interface

All analyzers must implement:

- `constructor(options)` - Initialize with configuration
- `analyze(document, pageData, url)` - Main analysis method
- `getMetadata()` - Return analyzer metadata
- `validate()` - Validate configuration

### 4. Error Handling

All analyzers must handle errors gracefully and return standardized error objects.

### 5. Testing

Each analyzer module must have corresponding unit tests in the tests directory.

## Migration Plan

1. Create core infrastructure (BaseAnalyzer, interfaces)
2. Migrate existing analyzers to new structure
3. Update imports in audit system
4. Update unit tests
5. Validate all functionality

## Benefits

- **Consistency**: Standardized structure across all analyzers
- **Maintainability**: Clear organization and separation of concerns
- **Testability**: Better test organization and coverage
- **Scalability**: Easy to add new analyzers
- **Documentation**: Clear module boundaries and responsibilities
