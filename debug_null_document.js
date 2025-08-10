import('./src/analyzers/business-intelligence/business-analyzer.js').then(async module => {
  const { BusinessIntelligenceAnalyzer } = module;
  
  console.log('🔧 Testing BusinessIntelligenceAnalyzer with null document...');
  
  const analyzer = new BusinessIntelligenceAnalyzer();
  
  const context = {
    document: null,
    url: 'https://example.com',
    pageData: {}
  };
  
  console.log('📝 Context:', context);
  console.log('📝 context.document:', context.document);
  console.log('📝 context.document === null:', context.document === null);
  console.log('📝 context.document !== undefined:', context.document !== undefined);
  console.log('📝 context.document !== null:', context.document !== null);
  
  // Test validation directly
  const validationResult = analyzer.validate(context);
  console.log('🔍 Validation result:', validationResult);
  
  const result = await analyzer.analyze(context);
  
  console.log('✅ Result:');
  console.log('- success:', result.success);
  console.log('- error:', result.error);
  console.log('- analyzer:', result.analyzer);
  
}).catch(error => {
  console.error('❌ Error:', error.message);
});
