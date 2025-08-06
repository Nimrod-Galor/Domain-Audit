/**
 * Screen Reader Compatibility Tests
 * Tests for screen reader compatibility and semantic markup
 */

import { expect } from '@jest/globals';

describe('Screen Reader Compatibility Tests', () => {

  // Mock screen reader utilities
  const screenReaderChecker = {
    checkSemanticMarkup: (htmlContent) => {
      const issues = [];
      
      // Check for semantic HTML5 elements
      const semanticElements = ['nav', 'main', 'article', 'section', 'aside', 'header', 'footer'];
      const hasSemanticElements = semanticElements.some(tag => 
        new RegExp(`<${tag}[^>]*>`, 'i').test(htmlContent)
      );
      
      if (!hasSemanticElements && htmlContent.includes('<div')) {
        issues.push('Consider using semantic HTML5 elements instead of generic divs');
      }
      
      // Check for proper list markup
      if (htmlContent.includes('<li>') && !htmlContent.includes('<ul>') && !htmlContent.includes('<ol>')) {
        issues.push('List items should be contained within ul or ol elements');
      }
      
      // Check for table headers
      if (htmlContent.includes('<table>')) {
        if (!htmlContent.includes('<th>') && !htmlContent.includes('scope=')) {
          issues.push('Tables should have proper headers for screen readers');
        }
      }

      return {
        valid: issues.length === 0,
        issues
      };
    },

    checkLandmarks: (htmlContent) => {
      const issues = [];
      const landmarks = {
        'main': /<main[^>]*>/i,
        'nav': /<nav[^>]*>/i,
        'banner': /role="banner"/i,
        'contentinfo': /role="contentinfo"/i,
        'search': /role="search"/i
      };

      // Check for main landmark
      if (!landmarks.main.test(htmlContent) && !htmlContent.includes('role="main"')) {
        issues.push('Page should have a main landmark');
      }

      // Check for navigation landmark
      if (htmlContent.includes('<a href') && !landmarks.nav.test(htmlContent)) {
        issues.push('Pages with links should have navigation landmarks');
      }

      return {
        valid: issues.length === 0,
        issues
      };
    },

    checkReadingOrder: (htmlContent) => {
      const issues = [];
      
      // Check heading order for logical flow
      const headingRegex = /<h([1-6])[^>]*>/gi;
      const headings = [];
      let match;
      
      while ((match = headingRegex.exec(htmlContent)) !== null) {
        headings.push(parseInt(match[1]));
      }
      
      // Reading order should be logical
      for (let i = 1; i < headings.length; i++) {
        if (headings[i] - headings[i-1] > 1) {
          issues.push(`Reading order disrupted: h${headings[i-1]} to h${headings[i]}`);
        }
      }

      return {
        valid: issues.length === 0,
        issues,
        headings
      };
    },

    checkDescriptiveText: (htmlContent) => {
      const issues = [];
      
      // Check for meaningful link text
      const linkRegex = /<a[^>]*>([^<]+)<\/a>/gi;
      let match;
      
      while ((match = linkRegex.exec(htmlContent)) !== null) {
        const linkText = match[1].trim().toLowerCase();
        const genericTexts = ['click here', 'read more', 'learn more', 'here', 'more'];
        
        if (genericTexts.includes(linkText)) {
          issues.push(`Link text should be descriptive: "${match[1]}"`);
        }
        
        if (linkText.length < 3) {
          issues.push(`Link text too short: "${match[1]}"`);
        }
      }

      // Check button text
      const buttonRegex = /<button[^>]*>([^<]+)<\/button>/gi;
      while ((match = buttonRegex.exec(htmlContent)) !== null) {
        const buttonText = match[1].trim();
        if (buttonText.length < 2) {
          issues.push(`Button text should be descriptive: "${buttonText}"`);
        }
      }

      return {
        valid: issues.length === 0,
        issues
      };
    }
  };

  describe('Semantic Markup', () => {
    test('should use semantic HTML5 elements', () => {
      const semanticHtml = `
        <header>
          <nav>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <article>
            <h1>Article Title</h1>
            <section>
              <h2>Section Title</h2>
              <p>Content here</p>
            </section>
          </article>
          <aside>
            <h2>Related Links</h2>
          </aside>
        </main>
        <footer>
          <p>&copy; 2023 Company Name</p>
        </footer>
      `;

      const result = screenReaderChecker.checkSemanticMarkup(semanticHtml);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should detect non-semantic markup', () => {
      const nonSemanticHtml = `
        <div class="header">
          <div class="nav">
            <div class="nav-item">Home</div>
            <div class="nav-item">About</div>
          </div>
        </div>
        <div class="content">
          <div class="article">
            <h1>Title</h1>
            <p>Content</p>
          </div>
        </div>
      `;

      const result = screenReaderChecker.checkSemanticMarkup(nonSemanticHtml);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Consider using semantic HTML5 elements instead of generic divs');
    });

    test('should validate proper list structure', () => {
      const properList = `
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      `;

      const result = screenReaderChecker.checkSemanticMarkup(properList);
      expect(result.valid).toBe(true);

      const improperList = `
        <div>
          <li>Item 1</li>
          <li>Item 2</li>
        </div>
      `;

      const badResult = screenReaderChecker.checkSemanticMarkup(improperList);
      expect(badResult.valid).toBe(false);
      expect(badResult.issues).toContain('List items should be contained within ul or ol elements');
    });

    test('should validate table accessibility', () => {
      const accessibleTable = `
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Age</th>
              <th scope="col">City</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>30</td>
              <td>New York</td>
            </tr>
          </tbody>
        </table>
      `;

      const result = screenReaderChecker.checkSemanticMarkup(accessibleTable);
      expect(result.valid).toBe(true);

      const inaccessibleTable = `
        <table>
          <tr>
            <td>Name</td>
            <td>Age</td>
          </tr>
          <tr>
            <td>John</td>
            <td>30</td>
          </tr>
        </table>
      `;

      const badResult = screenReaderChecker.checkSemanticMarkup(inaccessibleTable);
      expect(badResult.valid).toBe(false);
      expect(badResult.issues).toContain('Tables should have proper headers for screen readers');
    });
  });

  describe('Landmark Navigation', () => {
    test('should have proper ARIA landmarks', () => {
      const landmarkHtml = `
        <header role="banner">
          <nav role="navigation">
            <ul>
              <li><a href="/">Home</a></li>
            </ul>
          </nav>
        </header>
        <main role="main">
          <h1>Page Title</h1>
          <p>Content</p>
        </main>
        <aside role="complementary">
          <h2>Sidebar</h2>
        </aside>
        <footer role="contentinfo">
          <p>Footer content</p>
        </footer>
      `;

      const result = screenReaderChecker.checkLandmarks(landmarkHtml);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should detect missing main landmark', () => {
      const noMainHtml = `
        <header>
          <nav>Navigation</nav>
        </header>
        <div>
          <h1>Title</h1>
          <p>Content without main landmark</p>
        </div>
      `;

      const result = screenReaderChecker.checkLandmarks(noMainHtml);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Page should have a main landmark');
    });

    test('should detect missing navigation landmark', () => {
      const noNavHtml = `
        <main>
          <h1>Title</h1>
          <p>Some content</p>
          <a href="/page1">Link 1</a>
          <a href="/page2">Link 2</a>
        </main>
      `;

      const result = screenReaderChecker.checkLandmarks(noNavHtml);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Pages with links should have navigation landmarks');
    });
  });

  describe('Reading Order', () => {
    test('should have logical heading hierarchy', () => {
      const logicalHtml = `
        <h1>Main Title</h1>
        <h2>Section 1</h2>
        <h3>Subsection 1.1</h3>
        <h3>Subsection 1.2</h3>
        <h2>Section 2</h2>
        <h3>Subsection 2.1</h3>
      `;

      const result = screenReaderChecker.checkReadingOrder(logicalHtml);
      expect(result.valid).toBe(true);
      expect(result.headings).toEqual([1, 2, 3, 3, 2, 3]);
    });

    test('should detect illogical heading jumps', () => {
      const illogicalHtml = `
        <h1>Main Title</h1>
        <h4>Skipped h2 and h3</h4>
        <h2>Section</h2>
        <h5>Skipped h3 and h4</h5>
      `;

      const result = screenReaderChecker.checkReadingOrder(illogicalHtml);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Reading order disrupted: h1 to h4');
      expect(result.issues).toContain('Reading order disrupted: h2 to h5');
    });
  });

  describe('Descriptive Text', () => {
    test('should have meaningful link text', () => {
      const goodLinksHtml = `
        <a href="/products">View our product catalog</a>
        <a href="/contact">Contact our support team</a>
        <a href="/about">Learn about our company history</a>
      `;

      const result = screenReaderChecker.checkDescriptiveText(goodLinksHtml);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should detect non-descriptive link text', () => {
      const badLinksHtml = `
        <a href="/products">click here</a>
        <a href="/info">read more</a>
        <a href="/details">here</a>
        <a href="/page">go</a>
      `;

      const result = screenReaderChecker.checkDescriptiveText(badLinksHtml);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Link text should be descriptive: "click here"');
      expect(result.issues).toContain('Link text should be descriptive: "read more"');
      expect(result.issues).toContain('Link text should be descriptive: "here"');
      expect(result.issues).toContain('Link text too short: "go"');
    });

    test('should validate button text', () => {
      const goodButtonsHtml = `
        <button>Submit Form</button>
        <button>Save Changes</button>
        <button>Delete Item</button>
      `;

      const result = screenReaderChecker.checkDescriptiveText(goodButtonsHtml);
      expect(result.valid).toBe(true);

      const badButtonsHtml = `
        <button>OK</button>
        <button>X</button>
      `;

      const badResult = screenReaderChecker.checkDescriptiveText(badButtonsHtml);
      expect(badResult.valid).toBe(false);
      expect(badResult.issues).toContain('Button text should be descriptive: "X"');
    });
  });

  describe('Screen Reader Announcements', () => {
    const announcementChecker = {
      checkLiveRegions: (htmlContent) => {
        const issues = [];
        
        // Check for appropriate use of aria-live
        if (htmlContent.includes('aria-live="polite"') || 
            htmlContent.includes('aria-live="assertive"')) {
          // Good use of live regions
        } else if (htmlContent.includes('status updates') || 
                   htmlContent.includes('error message')) {
          issues.push('Dynamic content should use aria-live regions');
        }

        return {
          valid: issues.length === 0,
          issues
        };
      },

      checkHiddenContent: (htmlContent) => {
        const issues = [];
        
        // Check for screen reader only content
        if (htmlContent.includes('aria-hidden="true"')) {
          // Check if important content is hidden
          if (htmlContent.includes('aria-hidden="true">Important') ||
              htmlContent.includes('aria-hidden="true">Required')) {
            issues.push('Important content should not be hidden from screen readers');
          }
        }

        return {
          valid: issues.length === 0,
          issues
        };
      }
    };

    test('should properly implement live regions', () => {
      const liveRegionHtml = `
        <div aria-live="polite" id="status">
          Status updates will appear here
        </div>
        <div aria-live="assertive" id="errors">
          Critical alerts will appear here
        </div>
      `;

      const result = announcementChecker.checkLiveRegions(liveRegionHtml);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should detect missing live regions for dynamic content', () => {
      const missingLiveRegionHtml = `
        <div id="status">
          Status updates will appear here
        </div>
        <div id="errors">
          Error messages will appear here
        </div>
      `;

      const result = announcementChecker.checkLiveRegions(missingLiveRegionHtml);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Dynamic content should use aria-live regions');
    });

    test('should validate appropriate content hiding', () => {
      const appropriateHidingHtml = `
        <span aria-hidden="true">🎉</span>
        <span class="sr-only">Celebration icon</span>
        <div aria-hidden="true" class="decorative-background"></div>
      `;

      const result = announcementChecker.checkHiddenContent(appropriateHidingHtml);
      expect(result.valid).toBe(true);

      const inappropriateHidingHtml = `
        <span aria-hidden="true">Important information</span>
        <div aria-hidden="true">Required field indicator</div>
      `;

      const badResult = announcementChecker.checkHiddenContent(inappropriateHidingHtml);
      expect(badResult.valid).toBe(false);
      expect(badResult.issues).toContain('Important content should not be hidden from screen readers');
    });
  });

  describe('Screen Reader Navigation', () => {
    const navigationChecker = {
      checkSkipLinks: (htmlContent) => {
        const issues = [];
        
        // Check for skip to main content link
        if (!htmlContent.includes('skip to main') && 
            !htmlContent.includes('skip to content')) {
          issues.push('Page should include skip to main content link');
        }

        return {
          valid: issues.length === 0,
          issues
        };
      },

      checkDocumentStructure: (htmlContent) => {
        const issues = [];
        
        // Check for proper document outline
        if (!htmlContent.includes('<h1>')) {
          issues.push('Page should have a main heading (h1)');
        }
        
        // Check for multiple h1s (should be avoided)
        const h1Count = (htmlContent.match(/<h1[^>]*>/gi) || []).length;
        if (h1Count > 1) {
          issues.push('Page should have only one main heading (h1)');
        }

        return {
          valid: issues.length === 0,
          issues
        };
      }
    };

    test('should include skip navigation links', () => {
      const skipLinksHtml = `
        <a href="#main" class="skip-link">Skip to main content</a>
        <nav>Navigation here</nav>
        <main id="main">
          <h1>Page Title</h1>
          <p>Main content</p>
        </main>
      `;

      const result = navigationChecker.checkSkipLinks(skipLinksHtml);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('should detect missing skip links', () => {
      const noSkipLinksHtml = `
        <nav>Lots of navigation links here</nav>
        <main>
          <h1>Page Title</h1>
          <p>Main content buried under navigation</p>
        </main>
      `;

      const result = navigationChecker.checkSkipLinks(noSkipLinksHtml);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Page should include skip to main content link');
    });

    test('should validate document structure', () => {
      const goodStructureHtml = `
        <h1>Page Title</h1>
        <h2>Section 1</h2>
        <h3>Subsection</h3>
        <h2>Section 2</h2>
      `;

      const result = navigationChecker.checkDocumentStructure(goodStructureHtml);
      expect(result.valid).toBe(true);

      const noH1Html = `
        <h2>Section Title</h2>
        <h3>Subsection</h3>
      `;

      const noH1Result = navigationChecker.checkDocumentStructure(noH1Html);
      expect(noH1Result.valid).toBe(false);
      expect(noH1Result.issues).toContain('Page should have a main heading (h1)');

      const multipleH1Html = `
        <h1>First Title</h1>
        <h1>Second Title</h1>
      `;

      const multipleH1Result = navigationChecker.checkDocumentStructure(multipleH1Html);
      expect(multipleH1Result.valid).toBe(false);
      expect(multipleH1Result.issues).toContain('Page should have only one main heading (h1)');
    });
  });

});
