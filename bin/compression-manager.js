#!/usr/bin/env node

/**
 * ============================================================================
 * COMPRESSION MANAGEMENT CLI
 * ============================================================================
 * 
 * Command-line tool for managing state file compression including:
 * - Migrating existing uncompressed files to compressed format
 * - Viewing compression statistics
 * - Batch operations on audit directories
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import { migrateStateFiles, getCompressionStats, printCompressionStats } from '../src/core/compressed-state-manager.js';
import { CompressedPageDataManager } from '../src/storage/compressed-page-data-manager.js';
import { CompressedHtmlReportManager } from '../src/reporting/compressed-html-report-manager.js';
import { extractMainDomain } from '../src/utils/core-utils.js';
import fs from 'fs';
import path from 'path';

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];
const domain = args[1];

// Enhanced startup banner
console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🗜️  COMPRESSION MANAGEMENT TOOL                          ║
║                           Version 1.0 - August 2025                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Manage state file compression for efficient storage                        ║
║  Migrate • Analyze • Optimize • Monitor compression statistics              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

// Show help if no command provided
if (!command) {
  console.log(`
Usage: node bin/compression-manager.js <command> [domain]

Commands:
  migrate <domain>     Migrate all uncompressed files for domain (state + page-data + HTML)
  migrate-all          Migrate all domains' uncompressed files
  migrate-state <domain>   Migrate only state files for domain
  migrate-pagedata <domain> Migrate only page-data files for domain
  migrate-html <domain>    Migrate only HTML report files for domain
  stats <domain>       Show compression statistics for domain
  stats-all            Show compression statistics for all domains
  help                 Show this help message

Examples:
  node bin/compression-manager.js migrate stefanbakery.com
  node bin/compression-manager.js migrate-html stefanbakery.com
  node bin/compression-manager.js stats stefanbakery.com
  node bin/compression-manager.js migrate-all
  node bin/compression-manager.js stats-all
`);
  process.exit(0);
}

/**
 * Handle migrate command for specific domain (both state and page-data)
 */
function handleMigrateCommand() {
  if (!domain) {
    console.error('❌ Domain required for migrate command');
    console.log('Usage: node bin/compression-manager.js migrate <domain>');
    process.exit(1);
  }

  const mainDomain = extractMainDomain(domain);
  const domainFolder = mainDomain.replace(/[^a-zA-Z0-9.-]/g, '_');
  const auditDir = path.resolve(process.cwd(), 'audits', domainFolder);

  if (!fs.existsSync(auditDir)) {
    console.error(`❌ No audit directory found for domain: ${mainDomain}`);
    process.exit(1);
  }

  console.log(`🗜️  Migrating all files for domain: ${mainDomain}`);
  console.log(`📁 Audit directory: ${auditDir}\n`);

  // Migrate state files
  console.log('📊 Migrating state files...');
  const stateResult = migrateStateFiles(auditDir);
  
  // Migrate page-data files for each audit
  console.log('\n📄 Migrating page-data files...');
  let totalPageDataMigrated = 0;
  let totalPageDataSaved = 0;
  let totalPageDataErrors = 0;

  const auditDirs = fs.readdirSync(auditDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('audit-'))
    .map(dirent => path.resolve(auditDir, dirent.name));

  for (const auditPath of auditDirs) {
    const pageDataManager = new CompressedPageDataManager(auditPath);
    const pageDataResult = pageDataManager.migrateToCompressed();
    
    totalPageDataMigrated += pageDataResult.migrated;
    totalPageDataSaved += pageDataResult.totalSaved;
    totalPageDataErrors += pageDataResult.errors;
  }

  // Migrate HTML report files
  console.log('\n📄 Migrating HTML report files...');
  const htmlResult = CompressedHtmlReportManager.migrateHtmlFiles(auditDir);

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 Complete migration summary:');
  console.log(`   State files migrated: ${stateResult.migrated}`);
  console.log(`   Page-data files migrated: ${totalPageDataMigrated}`);
  console.log(`   HTML files migrated: ${htmlResult.migrated}`);
  console.log(`   Total space saved: ${((stateResult.totalSaved + totalPageDataSaved + htmlResult.totalSaved)/1024).toFixed(1)}KB`);
  
  const totalErrors = stateResult.errors + totalPageDataErrors + htmlResult.errors;
  if (totalErrors > 0) {
    console.log(`   Total errors: ${totalErrors}`);
  }
}

/**
 * Handle migrate-all command for all domains
 */
function handleMigrateAllCommand() {
  const auditsDir = path.resolve(process.cwd(), 'audits');
  
  if (!fs.existsSync(auditsDir)) {
    console.error('❌ No audits directory found');
    process.exit(1);
  }

  const domains = fs.readdirSync(auditsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  if (domains.length === 0) {
    console.log('📭 No domains found in audits directory');
    return;
  }

  console.log(`🗜️  Migrating state files for ${domains.length} domains...\n`);

  let totalMigrated = 0;
  let totalErrors = 0;
  let totalSaved = 0;

  for (const domainFolder of domains) {
    const auditDir = path.resolve(auditsDir, domainFolder);
    console.log(`\n📁 Processing domain: ${domainFolder}`);
    
    const result = migrateStateFiles(auditDir);
    totalMigrated += result.migrated;
    totalErrors += result.errors;
    totalSaved += result.totalSaved;
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`🎉 Batch migration complete:`);
  console.log(`   Total files migrated: ${totalMigrated}`);
  console.log(`   Total space saved: ${(totalSaved/1024).toFixed(1)}KB`);
  if (totalErrors > 0) {
    console.log(`   Errors encountered: ${totalErrors}`);
  }
}

/**
 * Handle stats command for specific domain
 */
function handleStatsCommand() {
  if (!domain) {
    console.error('❌ Domain required for stats command');
    console.log('Usage: node bin/compression-manager.js stats <domain>');
    process.exit(1);
  }

  const mainDomain = extractMainDomain(domain);
  const domainFolder = mainDomain.replace(/[^a-zA-Z0-9.-]/g, '_');
  const auditDir = path.resolve(process.cwd(), 'audits', domainFolder);

  if (!fs.existsSync(auditDir)) {
    console.error(`❌ No audit directory found for domain: ${mainDomain}`);
    process.exit(1);
  }

  console.log(`📊 Compression statistics for domain: ${mainDomain}`);
  console.log(`📁 Audit directory: ${auditDir}`);
  
  // State file statistics
  printCompressionStats(auditDir);
  
  // Page-data statistics
  const auditDirs = fs.readdirSync(auditDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('audit-'))
    .map(dirent => path.resolve(auditDir, dirent.name));

  if (auditDirs.length > 0) {
    let totalPageDataCompressed = 0;
    let totalPageDataUncompressed = 0;
    let totalPageDataCompressedSize = 0;
    let totalPageDataUncompressedSize = 0;

    console.log('\n📄 Page Data Compression Summary:');
    console.log('═'.repeat(40));

    for (const auditPath of auditDirs) {
      const pageDataManager = new CompressedPageDataManager(auditPath);
      const stats = pageDataManager.getCompressionStats();
      
      if (stats.compressed > 0 || stats.uncompressed > 0) {
        const auditName = path.basename(auditPath);
        console.log(`📁 ${auditName}:`);
        console.log(`   Compressed: ${stats.compressed} files (${(stats.compressedSize/1024).toFixed(1)}KB)`);
        console.log(`   Uncompressed: ${stats.uncompressed} files (${(stats.uncompressedSize/1024).toFixed(1)}KB)`);
        
        totalPageDataCompressed += stats.compressed;
        totalPageDataUncompressed += stats.uncompressed;
        totalPageDataCompressedSize += stats.compressedSize;
        totalPageDataUncompressedSize += stats.uncompressedSize;
      }
    }

    if (totalPageDataCompressed > 0 || totalPageDataUncompressed > 0) {
      console.log('─'.repeat(40));
      console.log(`Total page-data compressed: ${totalPageDataCompressed} files (${(totalPageDataCompressedSize/1024).toFixed(1)}KB)`);
      console.log(`Total page-data uncompressed: ${totalPageDataUncompressed} files (${(totalPageDataUncompressedSize/1024).toFixed(1)}KB)`);
      
      if (totalPageDataUncompressed > 0) {
        const potentialSavings = totalPageDataUncompressedSize * 0.75;
        console.log(`Potential page-data savings: ${(potentialSavings/1024).toFixed(1)}KB`);
        console.log(`💡 Run 'migrate-pagedata ${mainDomain}' to compress page-data files`);
      }
    }
  }

  // HTML report statistics
  CompressedHtmlReportManager.printCompressionStats(auditDir);
}

/**
 * Handle stats-all command for all domains
 */
function handleStatsAllCommand() {
  const auditsDir = path.resolve(process.cwd(), 'audits');
  
  if (!fs.existsSync(auditsDir)) {
    console.error('❌ No audits directory found');
    process.exit(1);
  }

  const domains = fs.readdirSync(auditsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  if (domains.length === 0) {
    console.log('📭 No domains found in audits directory');
    return;
  }

  console.log(`📊 Compression statistics for ${domains.length} domains:\n`);

  let totalCompressed = { count: 0, size: 0 };
  let totalUncompressed = { count: 0, size: 0 };
  let totalPotentialSavings = 0;

  for (const domainFolder of domains) {
    const auditDir = path.resolve(auditsDir, domainFolder);
    const stats = getCompressionStats(auditDir);
    
    if (stats) {
      console.log(`📁 ${domainFolder}:`);
      console.log(`   Compressed: ${stats.compressed.count} files (${(stats.compressed.totalSize/1024).toFixed(1)}KB)`);
      console.log(`   Uncompressed: ${stats.uncompressed.count} files (${(stats.uncompressed.totalSize/1024).toFixed(1)}KB)`);
      
      if (stats.potentialSavings > 0) {
        console.log(`   Potential savings: ${(stats.potentialSavings/1024).toFixed(1)}KB`);
      }
      
      totalCompressed.count += stats.compressed.count;
      totalCompressed.size += stats.compressed.totalSize;
      totalUncompressed.count += stats.uncompressed.count;
      totalUncompressed.size += stats.uncompressed.totalSize;
      totalPotentialSavings += stats.potentialSavings;
      
      console.log('');
    }
  }

  console.log('═'.repeat(60));
  console.log('📈 Overall Summary:');
  console.log(`   Total compressed files: ${totalCompressed.count} (${(totalCompressed.size/1024).toFixed(1)}KB)`);
  console.log(`   Total uncompressed files: ${totalUncompressed.count} (${(totalUncompressed.size/1024).toFixed(1)}KB)`);
  
  if (totalPotentialSavings > 0) {
    console.log(`   Total potential savings: ${(totalPotentialSavings/1024).toFixed(1)}KB`);
    const currentTotal = totalCompressed.size + totalUncompressed.size;
    const optimizedTotal = totalCompressed.size + (totalUncompressed.size * 0.25);
    const overallSavings = ((currentTotal - optimizedTotal) / currentTotal * 100).toFixed(1);
    console.log(`   Overall space savings possible: ${overallSavings}%`);
    console.log(`\n💡 Run 'migrate-all' to compress all uncompressed files`);
  } else {
    console.log(`✅ All files are already optimally compressed!`);
  }
}

/**
 * Handle help command
 */
function handleHelpCommand() {
  console.log(`
🗜️  Compression Management Commands:

📦 Migration Commands:
  migrate <domain>     Migrate all uncompressed files for specific domain (state + page-data + HTML)
  migrate-all          Migrate all domains' uncompressed files
  migrate-state <domain>   Migrate only state files for domain
  migrate-pagedata <domain> Migrate only page-data files for domain
  migrate-html <domain>    Migrate only HTML report files for domain

📊 Statistics Commands:
  stats <domain>       Show compression statistics for specific domain
  stats-all            Show compression statistics for all domains

🛠️  Utility Commands:
  help                 Show this help message

💡 Tips:
  • State/Page-data files larger than 10KB are automatically compressed
  • HTML files larger than 5KB are automatically compressed
  • Compression typically saves 70-80% of space for JSON and 60-70% for HTML
  • Both compressed (.gz) and uncompressed files are supported
  • The system automatically chooses the best format when loading
  • Migration is safe - original files are only deleted after successful compression

📝 Examples:
  node bin/compression-manager.js stats-all
  node bin/compression-manager.js migrate stefanbakery.com
  node bin/compression-manager.js migrate-html stefanbakery.com
  node bin/compression-manager.js stats stefanbakery.com
`);
}

/**
 * Handle migrate-state command for specific domain (state files only)
 */
function handleMigrateStateCommand() {
  if (!domain) {
    console.error('❌ Domain required for migrate-state command');
    console.log('Usage: node bin/compression-manager.js migrate-state <domain>');
    process.exit(1);
  }

  const mainDomain = extractMainDomain(domain);
  const domainFolder = mainDomain.replace(/[^a-zA-Z0-9.-]/g, '_');
  const auditDir = path.resolve(process.cwd(), 'audits', domainFolder);

  if (!fs.existsSync(auditDir)) {
    console.error(`❌ No audit directory found for domain: ${mainDomain}`);
    process.exit(1);
  }

  console.log(`🗜️  Migrating state files for domain: ${mainDomain}`);
  console.log(`📁 Audit directory: ${auditDir}\n`);

  const result = migrateStateFiles(auditDir);
  
  if (result.migrated === 0 && result.errors === 0) {
    console.log('✅ No state files need migration - all are already optimized!');
  } else if (result.errors > 0) {
    console.log(`⚠️  Migration completed with ${result.errors} errors`);
  }
}

/**
 * Handle migrate-pagedata command for specific domain (page-data files only)
 */
function handleMigratePageDataCommand() {
  if (!domain) {
    console.error('❌ Domain required for migrate-pagedata command');
    console.log('Usage: node bin/compression-manager.js migrate-pagedata <domain>');
    process.exit(1);
  }

  const mainDomain = extractMainDomain(domain);
  const domainFolder = mainDomain.replace(/[^a-zA-Z0-9.-]/g, '_');
  const auditDir = path.resolve(process.cwd(), 'audits', domainFolder);

  if (!fs.existsSync(auditDir)) {
    console.error(`❌ No audit directory found for domain: ${mainDomain}`);
    process.exit(1);
  }

  console.log(`🗜️  Migrating page-data files for domain: ${mainDomain}`);
  console.log(`📁 Audit directory: ${auditDir}\n`);

  let totalMigrated = 0;
  let totalSaved = 0;
  let totalErrors = 0;

  const auditDirs = fs.readdirSync(auditDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('audit-'))
    .map(dirent => path.resolve(auditDir, dirent.name));

  if (auditDirs.length === 0) {
    console.log('📭 No audit directories found');
    return;
  }

  for (const auditPath of auditDirs) {
    const auditName = path.basename(auditPath);
    console.log(`📁 Processing ${auditName}...`);
    
    const pageDataManager = new CompressedPageDataManager(auditPath);
    const result = pageDataManager.migrateToCompressed();
    
    totalMigrated += result.migrated;
    totalSaved += result.totalSaved;
    totalErrors += result.errors;
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🎉 Page-data migration summary:');
  console.log(`   Files migrated: ${totalMigrated}`);
  console.log(`   Space saved: ${(totalSaved/1024).toFixed(1)}KB`);
  
  if (totalErrors > 0) {
    console.log(`   Errors: ${totalErrors}`);
  }
  
  if (totalMigrated === 0 && totalErrors === 0) {
    console.log('✅ No page-data files need migration - all are already optimized!');
  }
}

/**
 * Handle migrate-html command for specific domain (HTML report files only)
 */
function handleMigrateHtmlCommand() {
  if (!domain) {
    console.error('❌ Domain required for migrate-html command');
    console.log('Usage: node bin/compression-manager.js migrate-html <domain>');
    process.exit(1);
  }

  const mainDomain = extractMainDomain(domain);
  const domainFolder = mainDomain.replace(/[^a-zA-Z0-9.-]/g, '_');
  const auditDir = path.resolve(process.cwd(), 'audits', domainFolder);

  if (!fs.existsSync(auditDir)) {
    console.error(`❌ No audit directory found for domain: ${mainDomain}`);
    process.exit(1);
  }

  console.log(`🗜️  Migrating HTML report files for domain: ${mainDomain}`);
  console.log(`📁 Audit directory: ${auditDir}\n`);

  const result = CompressedHtmlReportManager.migrateHtmlFiles(auditDir);

  console.log('\n' + '═'.repeat(60));
  console.log('🎉 HTML migration summary:');
  console.log(`   Files migrated: ${result.migrated}`);
  console.log(`   Space saved: ${(result.totalSaved/1024).toFixed(1)}KB`);

  if (result.errors > 0) {
    console.log(`   Errors: ${result.errors}`);
  }

  if (result.migrated === 0 && result.errors === 0) {
    console.log('✅ No HTML files need migration - all are already optimized!');
  }
}

// Command routing
switch (command) {
  case 'migrate':
    handleMigrateCommand();
    break;
  case 'migrate-all':
    handleMigrateAllCommand();
    break;
  case 'migrate-state':
    handleMigrateStateCommand();
    break;
  case 'migrate-pagedata':
    handleMigratePageDataCommand();
    break;
  case 'migrate-html':
    handleMigrateHtmlCommand();
    break;
  case 'stats':
    handleStatsCommand();
    break;
  case 'stats-all':
    handleStatsAllCommand();
    break;
  case 'help':
    handleHelpCommand();
    break;
  default:
    console.error(`❌ Unknown command: ${command}`);
    console.log('Run "node bin/compression-manager.js help" for available commands');
    process.exit(1);
}
