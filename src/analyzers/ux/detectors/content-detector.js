/**
 * Content Detector - GPT-5 Style Modular Component
 * 
 * Detects and analyzes content elements for UX analysis.
 */
export class ContentDetector {
  constructor(options = {}) {
    this.options = options;
  }

  detect(document) {
    const content = {
      headings: this._detectHeadings(document),
      text: this._analyzeText(document),
      images: this._detectImages(document),
      media: this._detectMedia(document)
    };

    return {
      content,
      readabilityScore: this._calculateReadability(content.text),
      metadata: { detectTime: Date.now() }
    };
  }

  _detectHeadings(document) {
    const headings = [];
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h, index) => {
      headings.push({
        level: parseInt(h.tagName.substr(1)),
        text: h.textContent?.trim() || '',
        position: index
      });
    });
    return headings;
  }

  _analyzeText(document) {
    const textContent = document.body?.textContent || '';
    return {
      wordCount: textContent.split(/\s+/).length,
      characterCount: textContent.length,
      paragraphs: document.querySelectorAll('p').length
    };
  }

  _detectImages(document) {
    const images = [];
    document.querySelectorAll('img').forEach((img, index) => {
      images.push({
        src: img.src || '',
        alt: img.alt || '',
        hasAlt: !!img.alt,
        loading: img.loading || ''
      });
    });
    return images;
  }

  _detectMedia(document) {
    return {
      videos: document.querySelectorAll('video').length,
      audio: document.querySelectorAll('audio').length,
      embeds: document.querySelectorAll('iframe, embed, object').length
    };
  }

  _calculateReadability(textAnalysis) {
    // Simplified readability score based on word and sentence count
    const avgWordsPerSentence = textAnalysis.wordCount / Math.max(textAnalysis.paragraphs, 1);
    return Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
  }
}
