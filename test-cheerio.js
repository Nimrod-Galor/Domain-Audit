import * as cheerio from 'cheerio';

console.log('🧪 Testing Cheerio migration...');

const html = `
<html>
<head><title>Test Page</title></head>
<body>
  <h1>Welcome</h1>
  <a href="https://example.com">External Link</a>
  <a href="/internal">Internal Link</a>
</body>
</html>
`;

try {
  const $ = cheerio.load(html);
  
  console.log('✅ Cheerio loaded HTML successfully');
  console.log('📄 Title:', $('title').text());
  console.log('🔗 Links found:', $('a').length);
  
  $('a').each((i, el) => {
    const link = $(el);
    console.log(`  ${i + 1}. ${link.text()} -> ${link.attr('href')}`);
  });
  
  console.log('🎉 Cheerio migration test successful!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
