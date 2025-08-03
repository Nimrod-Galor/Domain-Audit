import { extractMainDomain } from './src/utils/core-utils.js';

console.log('🧪 Testing TLD-Based Domain Logic...\n');

const testDomains = [
  'www.stefanbakery.com',
  'blog.stefanbakery.com', 
  'subdomain.example.co.uk',
  'api.stripe.com',
  'shop.amazon.com',
  'google.org',
  'example.co.uk',
  'test.local',
  'github.com',
  'docs.github.com',
  'api.github.com'
];

console.log('| Input Domain              | Folder Name              |');
console.log('|---------------------------|--------------------------|');

testDomains.forEach(domain => {
  const folderName = extractMainDomain(domain);
  console.log(`| ${domain.padEnd(25)} | ${folderName.padEnd(24)} |`);
});

console.log('\n🎉 TLD-based domain logic test complete!');
