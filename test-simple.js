async function test() {
  try {
    console.log('🧪 Testing DOMProcessor with Cheerio...');
    
    const { DOMProcessor } = await import('./src/dom/dom-processor.js');
    
    const html = `<html><head><title>Test</title></head><body><a href="/test">Link</a></body></html>`;
    
    const processor = new DOMProcessor();
    const result = await processor.createDOM(html, 'https://test.com');
    
    console.log('✅ DOMProcessor works with Cheerio!');
    console.log('Title:', result.document.title);
    console.log('Links:', result.document.querySelectorAll('a').length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
