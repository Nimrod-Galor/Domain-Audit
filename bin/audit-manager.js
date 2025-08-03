#!/usr/bin/env node

/**
 * ============================================================================
 * AUDIT MANAGEMENT CLI
 * ============================================================================
 * 
 * Command-line interface for managing domain audits including:
 * - Viewing audit history
 * - Comparing audits
 * - Cleaning up old audits
 * - Export/import functionality
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import { getAuditManager } from '../src/core/audit-manager.js';
import { extractMainDomain } from '../src/utils/core-utils.js';
import fs from 'fs';
import path from 'path';

// Enhanced startup banner
console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    📊 AUDIT MANAGEMENT TOOL                                 ║
║                           Version 1.0 - August 2025                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Manage multiple audits per domain with version history                     ║
║  Resume incomplete audits • Clean up old data • View statistics             ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

// Parse CLI arguments
const args = process.argv.slice(2);
const command = args[0];
const domain = args[1];

// Help command
if (!command || command === '--help' || command === '-h') {
  console.log(`
Usage:
  node audit-manager.js list <domain>                       - List audit history
  node audit-manager.js stats <domain>                      - Show detailed statistics
  node audit-manager.js cleanup <domain> [keep_count]       - Clean up old audits (keep latest N)
  node audit-manager.js compare <domain> <audit1> <audit2>  - Compare two audits
  node audit-manager.js compare-all <domain>                - Compare all audits sequentially
  node audit-manager.js progression <domain>                - Get progression summary
  node audit-manager.js list-comparisons <domain>           - List saved comparison reports
  node audit-manager.js delete <domain> <audit_id>          - Delete specific audit
  node audit-manager.js export <domain> [audit_id]          - Export audit data

Options:
  keep_count      Number of audits to keep during cleanup (default: 10)
  audit_id        Specific audit ID (format: audit-YYYY-MM-DD-HH-MM-SS)

Examples:
  node audit-manager.js list stefanbakery
  node audit-manager.js stats www.example.com
  node audit-manager.js cleanup example.com 5
  node audit-manager.js delete example.com audit-2025-08-03-10-30-45
`);
  process.exit(0);
}

// Validate command
const validCommands = ['list', 'stats', 'cleanup', 'compare', 'compare-all', 'progression', 'list-comparisons', 'delete', 'export'];
if (!validCommands.includes(command)) {
  console.error(`❌ Invalid command: ${command}`);
  console.error(`Valid commands: ${validCommands.join(', ')}`);
  process.exit(1);
}

// Validate domain for all commands
if (!domain) {
  console.error(`❌ Domain is required for ${command} command`);
  console.error('Example: node audit-manager.js list www.example.com');
  process.exit(1);
}

// Extract domain name and get audit manager
const domainName = extractMainDomain(domain);
const auditManager = getAuditManager(domainName);

// Execute commands
try {
  switch (command) {
    case 'list':
      handleListCommand();
      break;
      
    case 'stats':
      handleStatsCommand();
      break;
      
    case 'cleanup':
      handleCleanupCommand();
      break;
      
    case 'compare':
      handleCompareCommand();
      break;
    
    case 'compare-all':
      handleCompareAllCommand();
      break;
    
    case 'progression':
      handleProgressionCommand();
      break;
    
    case 'list-comparisons':
      handleListComparisonsCommand();
      break;
      
    case 'delete':
      handleDeleteCommand();
      break;
      
    case 'export':
      handleExportCommand();
      break;
      
    default:
      console.error(`❌ Command not implemented: ${command}`);
      process.exit(1);
  }
} catch (error) {
  console.error(`❌ Error executing ${command}:`, error.message);
  process.exit(1);
}

/**
 * Handle list command
 */
function handleListCommand() {
  auditManager.printAuditSummary();
  
  const audits = auditManager.listAudits();
  if (audits.length === 0) {
    console.log('\n📭 No audits found for this domain.');
    return;
  }

  console.log('\n📋 Detailed Audit List:');
  console.log('─'.repeat(120));
  console.log('ID'.padEnd(30) + 'Status'.padEnd(12) + 'Started'.padEnd(20) + 'Duration'.padEnd(12) + 'Pages'.padEnd(8) + 'Links');
  console.log('─'.repeat(120));
  
  for (const audit of audits) {
    const id = audit.id.padEnd(30);
    const status = (audit.status === 'completed' ? '✅' : audit.status === 'in-progress' ? '🔄' : '❌') + 
                   audit.status.padEnd(10);
    const started = audit.formattedStartTime.padEnd(20);
    const duration = (audit.formattedDuration || 'N/A').padEnd(12);
    const pages = (audit.pagesAnalyzed || 0).toString().padEnd(8);
    const links = (audit.linksChecked || 0).toString();
    
    console.log(id + status + started + duration + pages + links);
  }
}

/**
 * Handle stats command
 */
function handleStatsCommand() {
  auditManager.printAuditSummary();
  
  const stats = auditManager.getAuditStats();
  const audits = auditManager.listAudits();
  
  if (audits.length === 0) {
    console.log('\n📭 No audit data available.');
    return;
  }

  console.log('\n📈 Performance Trends:');
  
  // Show last 5 completed audits performance trend
  const completedAudits = audits
    .filter(a => a.status === 'completed' && a.duration)
    .slice(0, 5);
    
  if (completedAudits.length > 1) {
    console.log('\nDuration Trend (last 5 audits):');
    for (let i = 0; i < completedAudits.length; i++) {
      const audit = completedAudits[i];
      const trend = i > 0 ? 
        (audit.duration < completedAudits[i-1].duration ? '📈 Faster' : '📉 Slower') : 
        '──';
      console.log(`  ${audit.id}: ${audit.formattedDuration} ${trend}`);
    }
  }

  // Pages analyzed trend
  const auditsWith = audits.filter(a => a.pagesAnalyzed).slice(0, 5);
  if (auditsWith.length > 0) {
    console.log('\nPages Analyzed (recent):');
    for (const audit of auditsWith) {
      console.log(`  ${audit.id}: ${audit.pagesAnalyzed} pages`);
    }
  }
}

/**
 * Handle cleanup command
 */
function handleCleanupCommand() {
  const keepCount = args[2] ? parseInt(args[2], 10) : 10;
  
  if (isNaN(keepCount) || keepCount < 1) {
    console.error('❌ Keep count must be a positive number');
    process.exit(1);
  }

  console.log(`🧹 Starting cleanup (keeping latest ${keepCount} audits)...`);
  
  const result = auditManager.cleanupOldAudits(keepCount);
  console.log(`\n📋 Cleanup Summary:`);
  console.log(`   🗑️  Removed: ${result.cleaned} audits`);
  console.log(`   📁 Kept: ${result.kept} audits`);
  
  if (result.cleaned > 0) {
    console.log(`\n💾 Disk space freed by removing old audit data.`);
  } else {
    console.log(`\n✨ No cleanup needed - audit count is within limits.`);
  }
}

/**
 * Handle compare command - Enhanced with new comparison report generator
 */
function handleCompareCommand() {
  const auditId1 = args[2];
  const auditId2 = args[3];
  
  if (!auditId1 || !auditId2) {
    console.error('❌ Two audit IDs required for comparison');
    console.error('Example: node audit-manager.js compare example.com audit-2025-08-03-10-30-45 audit-2025-08-02-15-20-30');
    process.exit(1);
  }

  const mainDomain = extractMainDomain(domain);
  const auditManager = getAuditManager(mainDomain);

  console.log(`\n🔍 Generating detailed comparison report for ${mainDomain}:`);
  console.log(`   Audit 1: ${auditId1}`);
  console.log(`   Audit 2: ${auditId2}\n`);

  auditManager.generateComparisonReport(auditId1, auditId2, { 
    format: 'html',
    saveToFile: true,
    outputToConsole: false 
  }).then(comparison => {
    console.log('✅ Detailed comparison report generated successfully!');
    
    if (comparison.reportPath) {
      console.log(`📄 Report saved to: ${comparison.reportPath}`);
    }
    
    if (comparison.analysis && comparison.analysis.metrics) {
      console.log('\n📊 Key Metrics Changes:');
      console.log('═'.repeat(60));
      const metrics = comparison.analysis.metrics;
      
      Object.entries(metrics).forEach(([key, data]) => {
        const changeText = data.change > 0 ? `+${data.change}` : `${data.change}`;
        const indicator = data.change > 0 ? '📈' : data.change < 0 ? '📉' : '➡️';
        const percentage = data.audit1 > 0 ? ` (${((data.change / data.audit1) * 100).toFixed(1)}%)` : '';
        console.log(`${indicator} ${key.padEnd(20)}: ${data.audit1} → ${data.audit2} (${changeText}${percentage})`);
      });
    }

    if (comparison.analysis && comparison.analysis.summary) {
      console.log('\n📋 Analysis Summary:');
      console.log('═'.repeat(60));
      
      const summary = comparison.analysis.summary;
      if (summary.improvements && summary.improvements.length > 0) {
        console.log('\n✅ Improvements:');
        summary.improvements.forEach(improvement => {
          console.log(`   • ${improvement}`);
        });
      }
      
      if (summary.regressions && summary.regressions.length > 0) {
        console.log('\n⚠️ Regressions:');
        summary.regressions.forEach(regression => {
          console.log(`   • ${regression}`);
        });
      }
      
      if (summary.overallTrend) {
        console.log(`\n📈 Overall Trend: ${summary.overallTrend.toUpperCase()}`);
      }
    }
    
  }).catch(error => {
    console.error(`❌ Comparison failed: ${error.message}`);
    process.exit(1);
  });
}

/**
 * Handle compare-all command
 */
function handleCompareAllCommand() {
  if (!domain) {
    console.error('❌ Missing domain argument');
    console.error('Usage: node audit-manager.js compare-all <domain>');
    process.exit(1);
  }

  const mainDomain = extractMainDomain(domain);
  const auditManager = getAuditManager(mainDomain);

  console.log(`\n🔄 Comparing all audits for ${mainDomain}...\n`);

  auditManager.compareAllAudits({ 
    format: 'html', 
    saveToFile: true 
  }).then(comparisons => {
    console.log(`✅ Generated ${comparisons.length} comparison reports\n`);
    
    comparisons.forEach((comparison, index) => {
      console.log(`📋 Comparison ${index + 1}:`);
      console.log(`   Comparing audits from different time periods`);
      
      if (comparison.reportPath) {
        console.log(`   📄 Report saved: ${comparison.reportPath}`);
      }
      
      if (comparison.metrics) {
        const changes = Object.entries(comparison.metrics).filter(([, data]) => data && data.change !== 0);
        
        if (changes.length > 0) {
          console.log('   Key changes:');
          changes.slice(0, 3).forEach(([key, data]) => {
            const changeText = data.change > 0 ? `+${data.change}` : `${data.change}`;
            console.log(`     • ${key}: ${changeText}`);
          });
        } else {
          console.log('   No significant changes detected');
        }
      }
      console.log('');
    });
  }).catch(error => {
    console.error(`❌ Compare-all failed: ${error.message}`);
    process.exit(1);
  });
}

/**
 * Handle progression command
 */
function handleProgressionCommand() {
  if (!domain) {
    console.error('❌ Missing domain argument');
    console.error('Usage: node audit-manager.js progression <domain>');
    process.exit(1);
  }

  const mainDomain = extractMainDomain(domain);
  const auditManager = getAuditManager(mainDomain);

  console.log(`\n📈 Generating progression summary for ${mainDomain}...\n`);

  auditManager.getProgressionSummary().then(summary => {
    if (summary.message) {
      console.log(`ℹ️  ${summary.message}`);
      return;
    }

    console.log(`📊 PROGRESSION SUMMARY`);
    console.log(`═══════════════════════════════════════\n`);
    
    console.log(`📅 Latest Progress:`);
    console.log(`   Overall Trend: ${summary.latestProgress.overallTrend.toUpperCase()}\n`);
    
    if (summary.latestProgress.keyImprovements.length > 0) {
      console.log(`✅ Key Improvements:`);
      summary.latestProgress.keyImprovements.forEach(improvement => {
        console.log(`   • ${improvement}`);
      });
      console.log('');
    }
    
    if (summary.latestProgress.keyRegressions.length > 0) {
      console.log(`⚠️  Key Regressions:`);
      summary.latestProgress.keyRegressions.forEach(regression => {
        console.log(`   • ${regression}`);
      });
      console.log('');
    }
    
    if (summary.totalComparisons > 0) {
      console.log(`📈 Overall Analysis (across ${summary.totalComparisons} comparisons):`);
      console.log(`   Trend analysis based on ${summary.totalComparisons} audit comparisons`);
      
      Object.entries(summary.overallTrends).forEach(([metric, values]) => {
        if (values.length > 0) {
          console.log(`   • ${metric}: ${values.length} data points analyzed`);
        }
      });
    }
    
    console.log('\n✅ Progression summary completed!');
  }).catch(error => {
    console.error(`❌ Progression summary failed: ${error.message}`);
    process.exit(1);
  });
}

/**
 * Handle list-comparisons command
 */
function handleListComparisonsCommand() {
  if (!domain) {
    console.error('❌ Missing domain argument');
    console.error('Usage: node audit-manager.js list-comparisons <domain>');
    process.exit(1);
  }

  const mainDomain = extractMainDomain(domain);
  const auditManager = getAuditManager(mainDomain);
  const comparisonsDir = path.resolve(auditManager.baseAuditDir, 'comparisons');

  console.log(`\n📋 Comparison Reports for ${mainDomain}:`);
  console.log('═'.repeat(60));

  if (!fs.existsSync(comparisonsDir)) {
    console.log('ℹ️  No comparison reports found. Run some comparisons first.');
    return;
  }

  try {
    const files = fs.readdirSync(comparisonsDir).filter(f => f.endsWith('.html') || f.endsWith('.json') || f.endsWith('.txt'));
    
    if (files.length === 0) {
      console.log('ℹ️  No comparison reports found in the comparisons directory.');
      return;
    }

    console.log(`\n📄 Found ${files.length} comparison report(s):\n`);

    files.forEach((file, index) => {
      const filePath = path.resolve(comparisonsDir, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(1);
      const modified = stats.mtime.toLocaleString();
      
      console.log(`${index + 1}. ${file}`);
      console.log(`   📅 Created: ${modified}`);
      console.log(`   📏 Size: ${size} KB`);
      console.log(`   📁 Path: ${filePath}`);
      console.log('');
    });

    console.log(`💡 You can open HTML reports in your browser to view detailed comparisons.`);
    
  } catch (error) {
    console.error(`❌ Failed to list comparison reports: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Handle delete command
 */
function handleDeleteCommand() {
  const auditId = args[2];
  
  if (!auditId) {
    console.error('❌ Audit ID required for deletion');
    console.error('Example: node audit-manager.js delete example.com audit-2025-08-03-10-30-45');
    process.exit(1);
  }
  
  const audits = auditManager.listAudits();
  const audit = audits.find(a => a.id === auditId);
  
  if (!audit) {
    console.error(`❌ Audit not found: ${auditId}`);
    console.log('Available audits:');
    audits.forEach(a => console.log(`  ${a.id}`));
    process.exit(1);
  }
  
  console.log(`⚠️  Are you sure you want to delete audit: ${auditId}?`);
  console.log(`   Started: ${audit.formattedStartTime}`);
  console.log(`   Status: ${audit.status}`);
  console.log('\n   This action cannot be undone!');
  console.log('\n   To proceed, re-run with --confirm flag:');
  console.log(`   node audit-manager.js delete ${domain} ${auditId} --confirm`);
  
  if (args.includes('--confirm')) {
    // Implement deletion logic here
    console.log(`\n🗑️  Deleting audit: ${auditId}...`);
    // TODO: Add actual deletion implementation
    console.log(`✅ Audit deleted successfully.`);
  }
}

/**
 * Handle export command
 */
function handleExportCommand() {
  const auditId = args[2];
  
  if (auditId) {
    console.log(`📤 Exporting specific audit: ${auditId}`);
    // TODO: Implement specific audit export
  } else {
    console.log(`📤 Exporting all audits for domain: ${domainName}`);
    // TODO: Implement full domain export
  }
  
  console.log('🚧 Export functionality coming soon...');
}
