/**
 * Simple test to check WhatsAppAnalyzer structure
 */

try {
  console.log('Testing WhatsAppAnalyzer import...');
  
  // Try to import and see what errors we get
  const module = await import('./src/analyzers/social-media/platforms/whatsapp-analyzer.js');
  console.log('✅ Import successful');
  
  const analyzer = new module.WhatsAppAnalyzer();
  console.log('✅ Analyzer instantiated');
  console.log('Analyzer methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(analyzer)));
  
} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('Stack:', error.stack);
}
