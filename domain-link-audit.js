// Modularized main entry for domain link audit
import { runCrawl } from './crawler.js';

// Parse CLI arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node domain-link-audit.js <domain> [max_internal_links]');
  console.error('Example: node domain-link-audit.js www.example.com 50');
  process.exit(1);
}

const rawDomain = args[0];
const maxInternalLinks = args.length > 1 ? parseInt(args[1], 10) : undefined;

// Start the crawl process using the orchestrator
runCrawl(rawDomain, maxInternalLinks);
