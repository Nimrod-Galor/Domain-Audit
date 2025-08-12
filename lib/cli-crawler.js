#!/usr/bin/env node

/**
 * CLI Wrapper for Domain Audit Tool
 * This script provides a command-line interface that properly exits after completion
 */

import { runCrawl } from './crawler.js';
import process from 'process';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node cli-crawler.js <domain> [maxPages] [forceNew]');
    console.log('Example: node cli-crawler.js example.com 50 true');
    process.exit(1);
  }

  const [domain, maxPages = 50, forceNew = false] = args;
  
  console.log(`🚀 Starting audit for ${domain}`);
  console.log(`📊 Max pages: ${maxPages}`);
  console.log(`🔄 Force new: ${forceNew}`);

  try {
    // Set environment variables for CLI mode
    process.env.CLEANUP_ON_COMPLETION = 'true';
    process.env.FORCE_EXIT_ON_COMPLETION = 'true';
    
  const result = await runCrawl(domain, parseInt(maxPages), forceNew === 'true', {}, { mode: 'cli' });
    
    console.log('\n✅ Audit completed successfully!');
    console.log(`Duration: ${result.duration} seconds`);
    console.log(`Pages analyzed: ${result.pagesAnalyzed}`);
    
  // Force exit to prevent hanging (redundant with cli mode but kept for safety)
  setTimeout(() => process.exit(0), 1000);
    
  } catch (error) {
    console.error('\n❌ Audit failed:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('CLI Error:', error.message);
  process.exit(1);
});
