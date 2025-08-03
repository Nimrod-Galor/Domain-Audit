# 📊 Multi-Audit System Documentation

## Overview

The Domain Link Audit Tool now supports multiple audits per domain with comprehensive version history and resume capability. This allows you to track changes over time, compare performance, and maintain historical data while preserving the ability to resume incomplete audits.

## Features

### ✅ **Version Management**

- **Unique Audit IDs**: Each audit gets a timestamp-based ID (e.g., `audit-2025-08-03-04-14-14`)
- **Isolated Storage**: Each audit is stored in its own directory
- **History Tracking**: Comprehensive audit history with metadata
- **Resume Capability**: Incomplete audits can be resumed automatically

### ✅ **Directory Structure**

```
audits/
└── [domain-name]/
    ├── audit-index.json                 # Audit history and metadata
    ├── audit-2025-08-03-10-30-45/      # Specific audit directory
    │   ├── crawl-state.json             # Audit state for resuming
    │   ├── crawl-report.html            # HTML report
    │   └── page-data/                   # Page data storage
    │       ├── [encoded-url].json
    │       └── ...
    ├── audit-2025-08-03-15-20-30/      # Another audit
    │   ├── crawl-state.json
    │   ├── crawl-report.html
    │   └── page-data/
    └── ...
```

## CLI Commands

### 🚀 **Running Audits**

#### New Audit

```bash
# Create new audit (will resume if incomplete audit exists)
node bin/domain-audit.js audit example.com 50

# Force new audit (ignore incomplete audits)
node bin/domain-audit.js audit example.com 50 --new
```

#### Resume Behavior

- **Automatic Resume**: If an incomplete audit exists, it will be resumed automatically
- **Force New**: Use `--new` flag to start fresh audit even if incomplete audit exists
- **Smart Detection**: System finds the most recent incomplete audit

### 📋 **Audit Management**

#### List Audits

```bash
# Basic list with summary
node bin/domain-audit.js list example.com

# Detailed list with audit manager
node bin/audit-manager.js list example.com
```

#### Statistics

```bash
# Show audit statistics and trends
node bin/audit-manager.js stats example.com
```

#### Cleanup

```bash
# Keep latest 10 audits (default)
node bin/audit-manager.js cleanup example.com

# Keep specific number of audits
node bin/audit-manager.js cleanup example.com 5
```

#### Compare Audits

```bash
# Compare two specific audits
node bin/audit-manager.js compare example.com audit-2025-08-03-10-30-45 audit-2025-08-02-15-20-30
```

## Audit States

### ✅ **Completed**

- Audit finished successfully
- All data saved and report generated
- Full statistics available

### 🔄 **In Progress**

- Audit started but not completed
- Can be resumed automatically
- State saved for recovery

### ❌ **Failed**

- Audit encountered unrecoverable error
- Error details saved in audit record
- Can be restarted as new audit

## Data Management

### 🔄 **Resume Capability**

- **State Preservation**: All crawl state is saved regularly
- **Queue Management**: Pending URLs are preserved
- **Progress Tracking**: Visited pages and external links tracked
- **Error Recovery**: Graceful handling of interruptions

### 🧹 **Cleanup Management**

- **Automatic Cleanup**: Remove old audits while keeping recent ones
- **Configurable Retention**: Specify how many audits to keep
- **Disk Space Management**: Free up space by removing old audit data
- **Safe Deletion**: Only removes audit directories, preserves index

### 📊 **History Tracking**

- **Performance Trends**: Track audit duration over time
- **Coverage Changes**: Monitor pages and links analyzed
- **Success Rate**: Track completion vs failure rates
- **Comparison Tools**: Compare metrics between audits

## Example Workflows

### 🔄 **Daily Monitoring**

```bash
# Run daily audit (will resume if yesterday's failed)
node bin/domain-audit.js audit mysite.com

# Check recent performance
node bin/audit-manager.js stats mysite.com

# Cleanup old audits monthly
node bin/audit-manager.js cleanup mysite.com 30
```

### 📈 **Performance Analysis**

```bash
# Run comprehensive audit
node bin/domain-audit.js audit mysite.com 0  # unlimited pages

# Compare with previous
node bin/audit-manager.js list mysite.com
node bin/audit-manager.js compare mysite.com [latest-id] [previous-id]
```

### 🛠️ **Development Workflow**

```bash
# Quick test audit
node bin/domain-audit.js audit staging.mysite.com 20

# Force new after changes
node bin/domain-audit.js audit staging.mysite.com 20 --new
```

## Configuration

### 📁 **Storage Location**

- Audits stored in: `audits/[domain-name]/`
- Each audit gets unique timestamped directory
- Index file tracks all audits for domain

### ⚙️ **Default Settings**

- **Cleanup Retention**: 10 audits (configurable)
- **Resume Timeout**: No timeout - resumes any incomplete audit
- **ID Format**: `audit-YYYY-MM-DD-HH-MM-SS`

## Migration from Single Audit

The system is backward compatible with existing single-audit setups:

1. **Existing Data**: Old audit files remain accessible
2. **Automatic Migration**: First new audit creates versioned structure
3. **Legacy Support**: Old reports remain functional
4. **Gradual Transition**: Can use both systems during transition

## Benefits

### 🎯 **For Development Teams**

- Track changes over development cycles
- Compare performance before/after deployments
- Maintain audit history for compliance

### 📊 **For SEO Teams**

- Monitor SEO improvements over time
- Track link building progress
- Analyze content changes impact

### 🔧 **For Operations Teams**

- Automated monitoring with resume capability
- Efficient storage management
- Historical data for troubleshooting

## Technical Details

### 🏗️ **Architecture**

- **Modular Design**: Audit manager separate from crawler
- **State Management**: JSON-based state persistence
- **Error Handling**: Graceful failure recovery
- **Performance**: Minimal overhead for version management

### 💾 **Storage Efficiency**

- **Chunked Data**: Page data stored efficiently
- **Compressed States**: Minimal state file sizes
- **Cleanup Tools**: Remove old data automatically
- **Shared Resources**: Common libraries across audits

This multi-audit system provides enterprise-grade audit management while maintaining the simplicity and power of the original tool.
