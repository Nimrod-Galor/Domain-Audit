// Unit tests for Content Extractor
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { ContentExtractor } from '../../src/extractors/content-extractor.js';
import { DOMProcessor } from '../../src/dom/dom-processor.js';

describe('ContentExtractor', () => {
  let extractor;
  let processor;
  
  beforeEach(() => {
    extractor = new ContentExtractor();
    processor = new DOMProcessor();
  });

  describe('extract method', () => {
    test('should extract comprehensive content data', async () => {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Content Analysis Test</title>
</head>
<body>
  <header>
    <h1>Main Article Title</h1>
    <p class="subtitle">Article subtitle description</p>
  </header>
  <main>
    <article>
      <h2>Introduction</h2>
      <p>This is the first paragraph with substantial content. It contains meaningful text that should be analyzed for readability and quality metrics.</p>
      
      <h3>Detailed Analysis</h3>
      <p>This section provides detailed analysis of the content extraction process. The paragraph contains multiple sentences to test readability calculations.</p>
      
      <ul>
        <li>First list item with content</li>
        <li>Second list item with more content</li>
        <li>Third list item completing the list</li>
      </ul>
      
      <blockquote>
        "This is a quoted section that adds depth to the content analysis."
      </blockquote>
      
      <h3>Technical Implementation</h3>
      <p>The technical implementation involves complex algorithms and data processing techniques. This content helps test word count and reading time calculations.</p>
    </article>
  </main>
  <aside>
    <h4>Related Links</h4>
    <ul>
      <li><a href="/related1">Related Article 1</a></li>
      <li><a href="/related2">Related Article 2</a></li>
    </ul>
  </aside>
  <footer>
    <p>Copyright information and footer content.</p>
  </footer>
</body>
</html>`;

      const { document } = await processor.createDOM(html, 'https://example.com');
      const result = extractor.extractContentData(document, specialCharHTML);
      
      expect(result).toBeDefined();
      expect(result.textContent).toBeDefined();
      expect(result.headings).toBeDefined();
      expect(result.readability).toBeDefined();
      expect(result.structure).toBeDefined();
      expect(result.media).toBeDefined();
    });

    test('should calculate word count correctly', async () => {
      const html = `<!DOCTYPE html>
<html>
<head><title>Word Count Test</title></head>
<body>
  <p>This paragraph has exactly ten words in total content.</p>
  <p>This is another paragraph with seven words.</p>
</body>
</html>`;

      const { document } = await processor.createDOM(html, 'https://example.com');
      const result = extractor.extractContentData(document, specialCharHTML);
      
      expect(result.textContent.wordCount).toBeGreaterThan(15);
      expect(result.textContent.characterCount).toBeGreaterThan(80);
      expect(result.textContent.paragraphCount).toBe(2);
    });

    test('should analyze heading structure', async () => {
      const html = `<!DOCTYPE html>
<html>
<head><title>Heading Structure Test</title></head>
<body>
  <h1>Main Title</h1>
  <h2>Section 1</h2>
  <h3>Subsection 1.1</h3>
  <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>
  <h4>Deep subsection</h4>
  <h2>Section 3</h2>
</body>
</html>`;

      const { document } = await processor.createDOM(html, 'https://example.com');
      const result = extractor.extractContentData(document, specialCharHTML);
      
      expect(result.headings).toBeDefined();
      expect(result.headings.h1).toHaveLength(1);
      expect(result.headings.h2).toHaveLength(3);
      expect(result.headings.h3).toHaveLength(2);
      expect(result.headings.h4).toHaveLength(1);
      expect(result.headings.total).toBe(7);
    });

    test('should calculate readability metrics', async () => {
      const html = `<!DOCTYPE html>
<html>
<head><title>Readability Test</title></head>
<body>
  <p>This is a simple sentence. It has short words. The content is easy to read.</p>
  <p>More complex sentences can be analyzed for their readability using various metrics and algorithms that determine how easy the text is to understand.</p>
</body>
</html>`;

      const { document } = await processor.createDOM(html, 'https://example.com');
      const result = extractor.extractContentData(document, specialCharHTML);
      
      expect(result.readability).toBeDefined();
      expect(typeof result.readability.fleschScore).toBe('number');
      expect(typeof result.readability.averageWordsPerSentence).toBe('number');
      expect(typeof result.readability.averageSyllablesPerWord).toBe('number');
      expect(result.readability.readingTimeMinutes).toBeGreaterThan(0);
    });

    test('should analyze content structure', async () => {
      const html = `<!DOCTYPE html>
<html>
<head><title>Structure Test</title></head>
<body>
  <article>
    <header>Article header</header>
    <section>
      <p>Main content section</p>
    </section>
    <aside>Sidebar content</aside>
    <footer>Article footer</footer>
  </article>
</body>
</html>`;

      const { document } = await processor.createDOM(html, 'https://example.com');
      const result = extractor.extractContentData(document, specialCharHTML);
      
      expect(result.structure).toBeDefined();
      expect(result.structure.hasMainContent).toBe(true);
      expect(result.structure.hasSections).toBe(true);
      expect(result.structure.hasAsides).toBe(true);
      expect(result.structure.semanticElements).toBeGreaterThan(0);
    });

    test('should analyze media content', async () => {
      const html = `<!DOCTYPE html>
<html>
<head><title>Media Test</title></head>
<body>
  <img src="image1.jpg" alt="First image">
  <img src="image2.png" alt="Second image">
  <img src="decorative.gif" alt="">
  <video src="video.mp4" controls>
    <track kind="captions" src="captions.vtt">
  </video>
  <audio src="audio.mp3" controls></audio>
</body>
</html>`;

      const { document } = await processor.createDOM(html, 'https://example.com');
      const result = extractor.extractContentData(document, specialCharHTML);
      
      expect(result.media).toBeDefined();
      expect(result.media.images.total).toBe(3);
      expect(result.media.images.withAlt).toBe(2);
      expect(result.media.videos.total).toBe(1);
      expect(result.media.audio.total).toBe(1);
    });

    test('should calculate content-to-code ratio', async () => {
      const htmlWithLotOfCode = `<!DOCTYPE html>
<html>
<head>
  <title>Code Heavy Page</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: #333; color: white; padding: 20px; }
    .content { padding: 40px; line-height: 1.6; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; }
  </style>
  <script>
    function initPage() {
      console.log('Page initialized');
      document.addEventListener('DOMContentLoaded', function() {
        const elements = document.querySelectorAll('.interactive');
        elements.forEach(el => el.addEventListener('click', handleClick));
      });
    }
    function handleClick(event) { console.log('Clicked:', event.target); }
  </script>
</head>
<body>
  <div class="container">
    <header class="header">Simple Header</header>
    <main class="content">
      <p>This is minimal content compared to the large amount of CSS and JavaScript code above.</p>
    </main>
    <footer class="footer">Footer</footer>
  </div>
</body>
</html>`;

      const { document } = await processor.createDOM(htmlWithLotOfCode, 'https://example.com');
      const result = extractor.extractContentData(document, specialCharHTML);
      
      expect(result.textContent.contentToCodeRatio).toBeDefined();
      expect(typeof result.textContent.contentToCodeRatio).toBe('number');
      expect(result.textContent.contentToCodeRatio).toBeGreaterThan(0);
    });
  });

  describe('keyword analysis', () => {
    test('should extract and analyze keywords', async () => {
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>SEO Content Analysis Keywords</title>
  <meta name="keywords" content="SEO, content, analysis, keywords, optimization">
</head>
<body>
  <h1>SEO Content Analysis</h1>
  <p>This content focuses on SEO and content analysis techniques. SEO optimization requires careful keyword analysis and content strategy.</p>
  <p>Content analysis helps improve SEO performance through strategic keyword placement and optimization.</p>
</body>
</html>`;

      const { document } = await processor.createDOM(html, 'https://example.com');
      const result = extractor.extractContentData(document, specialCharHTML);
      
      expect(result.keywords).toBeDefined();
      expect(Array.isArray(result.keywords.topKeywords)).toBe(true);
      expect(result.keywords.density).toBeDefined();
      expect(result.keywords.topKeywords.length).toBeGreaterThan(0);
    });
  });

  describe('performance and edge cases', () => {
    test('should handle empty content gracefully', async () => {
      const emptyHTML = `<!DOCTYPE html>
<html>
<head><title>Empty Page</title></head>
<body></body>
</html>`;

      const { document } = await processor.createDOM(emptyHTML, 'https://example.com');
      const result = extractor.extractContentData(document, specialCharHTML);
      
      expect(result).toBeDefined();
      expect(result.textContent.wordCount).toBe(0);
      expect(result.headings.total).toBe(0);
    });

    test('should handle content with special characters', async () => {
      const specialCharHTML = `<!DOCTYPE html>
<html>
<head><title>Special Characters Test</title></head>
<body>
  <p>Content with émojis 🎉, spéciäl cháracters, and números 123!</p>
  <p>Testing unicode: αβγ, 中文, العربية, עברית</p>
</body>
</html>`;

      const { document } = await processor.createDOM(specialCharHTML, 'https://example.com');
      
      expect(async () => {
        extractor.extractContentData(document, specialCharHTML);
      }).not.toThrow();
    });

    test('should process large content efficiently', async () => {
      const largeContent = Array(500).fill('This is a paragraph with substantial content for performance testing. ').join('');
      const largeHTML = `<!DOCTYPE html>
<html>
<head><title>Large Content Test</title></head>
<body>
  <article>
    <h1>Large Article</h1>
    <p>${largeContent}</p>
  </article>
</body>
</html>`;

      const { document } = await processor.createDOM(largeHTML, 'https://example.com');
      
      const startTime = Date.now();
      const result = extractor.extractContentData(document, specialCharHTML);
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(result.textContent.wordCount).toBeGreaterThan(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
