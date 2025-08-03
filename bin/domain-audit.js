// Modularized main entry for domain link audit
import { runCrawl } from '../lib/crawler.js';

// Enhanced startup banner
console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 ENHANCED DOMAIN LINK AUDIT TOOL                        ║
║                           Version 2.0 - August 2025                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  🆕 NEW FEATURES:                                                            ║
║  🤖 Advanced robots meta tag analysis    🌐 Language & hreflang detection   ║
║  🎯 Comprehensive favicon analysis       🔗 Complete rel attribute tracking  ║
║  🛠️  Server & technology stack detection 🛡️  Enhanced security headers      ║
║  📊 Advanced performance analytics       🎨 Improved HTML reporting          ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

// Parse CLI arguments
const args = process.argv.slice(2);

// Command parsing
const command = args[0];
const domain = args[1];

// Help command
if (!command || command === '--help' || command === '-h') {
  console.log(`
Usage:
  node domain-audit.js audit <domain> [max_internal_links] [--new]  - Run audit (resume if incomplete)
  node domain-audit.js list <domain>                                - List audit history
  node domain-audit.js stats <domain>                               - Show audit statistics
  node domain-audit.js cleanup <domain> [keep_count]                - Clean up old audits

Options:
  --new           Force new audit (don't resume incomplete)
  keep_count      Number of audits to keep (default: 10)

Examples:
  node domain-audit.js audit www.example.com 50
  node domain-audit.js audit www.example.com --new
  node domain-audit.js list www.example.com
  node domain-audit.js cleanup www.example.com 5
`);
  process.exit(0);
}

// Validate command
const validCommands = ['audit', 'list', 'stats', 'cleanup'];
if (!validCommands.includes(command)) {
  console.error(`❌ Invalid command: ${command}`);
  console.error(`Valid commands: ${validCommands.join(', ')}`);
  process.exit(1);
}

// Validate domain for all commands
if (!domain) {
  console.error(`❌ Domain is required for ${command} command`);
  console.error('Example: node domain-audit.js audit www.example.com');
  process.exit(1);
}

// Handle different commands
if (command === 'audit') {
  const forceNew = args.includes('--new');
  const maxInternalLinks = args.find(arg => !isNaN(parseInt(arg, 10)) && arg !== domain);
  const parsedMaxLinks = maxInternalLinks ? parseInt(maxInternalLinks, 10) : undefined;
  
  // Start the crawl process using the orchestrator
  runCrawl(domain, parsedMaxLinks, forceNew);
} else {
  // Import audit manager for other commands
  import('../src/core/audit-manager.js').then(async ({ getAuditManager }) => {
    const { extractMainDomain } = await import('../src/utils/core-utils.js');
    const domainName = extractMainDomain(domain);
    const auditManager = getAuditManager(domainName);
    
    switch (command) {
      case 'list':
        auditManager.printAuditSummary();
        const audits = auditManager.listAudits();
        if (audits.length === 0) {
          console.log('\n📭 No audits found for this domain.');
        }
        break;
        
      case 'stats':
        auditManager.printAuditSummary();
        break;
        
      case 'cleanup':
        const keepCount = args[2] ? parseInt(args[2], 10) : 10;
        if (isNaN(keepCount) || keepCount < 1) {
          console.error('❌ Keep count must be a positive number');
          process.exit(1);
        }
        const result = auditManager.cleanupOldAudits(keepCount);
        console.log(`\n📋 Cleanup Summary: Removed ${result.cleaned}, Kept ${result.kept}`);
        break;
    }
    
    process.exit(0);
  }).catch(error => {
    console.error(`❌ Error executing ${command}:`, error.message);
    process.exit(1);
  });
}
