# 🏗️ Analyzer Organization Structure

## 📁 Directory Overview

The `/src/analyzers` folder has been organized into a clean, logical structure that separates different types of analyzers and maintains the modernization architecture.

### 🎯 Core Structure

```
src/analyzers/
├── 📁 core-analyzers/          # Essential analysis engines
├── 📁 specialized/             # Specialized analysis tools
├── 📁 production/              # Modern Combined Approach implementations
├── 📁 legacy/                  # Legacy analyzer versions (archived)
├── 📁 detectors/               # Modern detector modules
├── 📁 modern/                  # Category-specific modern implementations
├── 📁 [category-folders]/      # Organized by analysis type
├── 📄 index.js                 # Main analyzer registry
└── 📄 MODULE_ARCHITECTURE.md   # Technical documentation
```

---

## 🔧 Core Analyzers (`/core-analyzers/`)

Essential analyzers that form the backbone of the audit system:

- **`seo-analyzer.js`** - Search Engine Optimization analysis
- **`accessibility-analyzer.js`** - WCAG compliance and accessibility
- **`technical-analyzer.js`** - Technical SEO and performance
- **`security-analyzer.js`** - Security headers and vulnerabilities
- **`mobile-analyzer.js`** - Mobile optimization analysis
- **`content-analyzer.js`** - Content quality and structure

---

## 🎨 Specialized Analyzers (`/specialized/`)

Advanced and specialized analysis tools:

- **`advanced-link-analyzer.js`** - Advanced link analysis
- **`cdn-detector.js`** - CDN detection and optimization
- **`content-intelligence-analyzer.js`** - AI-powered content analysis
- **`content-quality-analyzer.js`** - Detailed content quality metrics
- **`link-analyzer.js`** - Link structure analysis
- **`link-depth-calculator.js`** - Site depth calculations
- **`orphaned-pages-detector.js`** - Orphaned page detection
- **`page-type-classifier.js`** - Page type classification
- **`resource-analyzer.js`** - Resource optimization analysis
- **`ssl-certificate-analyzer.js`** - SSL certificate validation
- **`third-party-analyzer.js`** - Third-party service analysis

---

## 🚀 Production (`/production/`)

Modern Combined Approach implementations ready for production:

- **`business-analytics-analyzer.js`** - Business intelligence (main)
- **`seo-analyzer-modern.js`** - Modern SEO analysis
- **`business-analytics-analyzer-modern.js`** - Business analytics (modern)
- **`security-analyzer-modern.js`** - Modern security analysis
- **`mobile-analyzer-modern.js`** - Modern mobile optimization
- **`content-intelligence-analyzer-modern.js`** - Modern content AI
- **`advanced-link-analyzer-modern.js`** - Modern link analysis
- **`cdn-detector-modern.js`** - Modern CDN detection
- **`content-quality-analyzer-modern.js`** - Modern content quality
- **`link-depth-calculator-modern.js`** - Modern depth calculation
- **`orphaned-pages-detector-modern.js`** - Modern orphaned page detection
- **`page-type-classifier-modern.js`** - Modern page classification
- **`ssl-certificate-analyzer-modern.js`** - Modern SSL analysis
- **`third-party-analyzer-modern.js`** - Modern third-party analysis

---

## 🔧 Detector Modules (`/detectors/`)

Modern detector modules implementing the Combined Approach pattern:

- **`meta-tag-detector.js`** - Meta tag analysis and validation
- **`content-quality-detector.js`** - Content quality assessment
- **`keyword-detector.js`** - Keyword optimization analysis
- **`technical-seo-detector.js`** - Technical SEO compliance
- **`social-media-detector.js`** - Social media optimization

---

## 📚 Legacy (`/legacy/`)

Archived legacy analyzer versions for reference:

- All previous `-legacy.js` versions
- Maintained for compatibility and rollback scenarios
- **Note**: These are archived and not actively used

---

## 🏢 Category Folders

Organized by analysis domain:

- **`accessibility/`** - Accessibility-specific components
- **`business-intelligence/`** - Business intelligence modules
- **`classification/`** - Page and content classification
- **`content/`** - Content analysis components
- **`core/`** - Core analyzer infrastructure
- **`ecommerce/`** - E-commerce specific analysis
- **`heuristics/`** - Heuristic analysis rules
- **`links/`** - Link analysis components
- **`performance/`** - Performance analysis tools
- **`security/`** - Security analysis components
- **`seo/`** - SEO analysis modules
- **`social-media/`** - Social media analysis
- **`technical/`** - Technical analysis tools
- **`third-party/`** - Third-party service analysis
- **`ux/`** - User experience analysis

---

## 🎯 Usage Guidelines

### For Core Functionality

Use analyzers from `/core-analyzers/` for essential audit operations.

### For Advanced Features

Use analyzers from `/specialized/` for detailed, specific analysis needs.

### For Production Deployment

Use modern implementations from `/production/` for optimal performance and features.

### For Custom Development

Build upon detector modules in `/detectors/` for new analysis capabilities.

---

## 🔄 Modernization Status

- ✅ **66+ analyzers modernized** with Combined Approach pattern
- ✅ **Clean organization** implemented
- ✅ **Legacy preservation** maintained
- ✅ **Production-ready** modern implementations
- ✅ **Modular detector** architecture

---

## 📋 Integration

All analyzers maintain backward compatibility through the bridge pattern while providing enhanced modern capabilities. The main `index.js` file serves as the central registry for all analyzer access.

---

_Last Updated: December 2024_  
_Organization Status: Complete_  
_Total Analyzers: 66+ modernized and organized_
