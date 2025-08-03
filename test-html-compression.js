// Test loading compressed HTML file
import { CompressedHtmlReportManager } from './src/reporting/compressed-html-report-manager.js';

const filename = 'audits/stefanbakery-com/audit-2025-08-03-08-59-49/audit-2025-08-03-08-59-49-crawl-report.html';

console.log('🔍 Testing HTML report loading...');

// Test loading by exact compressed filename
const content1 = CompressedHtmlReportManager.loadHtmlReport(filename + '.gz');
console.log(`✅ Loaded by .gz filename: ${content1 ? 'SUCCESS' : 'FAILED'}`);
if (content1) {
  console.log(`📏 Content length: ${content1.length} characters`);
  console.log(`🔍 Contains title: ${content1.includes('<title>') ? 'YES' : 'NO'}`);
}

// Test loading by base filename (should find .gz automatically)
const content2 = CompressedHtmlReportManager.loadHtmlReport(filename);
console.log(`✅ Loaded by base filename: ${content2 ? 'SUCCESS' : 'FAILED'}`);
console.log(`🔍 Same content: ${content1 === content2 ? 'YES' : 'NO'}`);

// Test file info
const info = CompressedHtmlReportManager.getReportInfo(filename);
console.log(`📊 File info:`, info);
