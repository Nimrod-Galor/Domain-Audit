/**
 * ============================================================================
 * SEO DATA EXTRACTOR MODULE
 * ============================================================================
 * 
 * This module handles extraction of SEO-related data from web pages including
 * meta tags, Open Graph data, Twitter Cards, and structured data.
 * 
 * Features:
 * - Performance-optimized extraction with caching
 * - Support for all major SEO meta tags
 * - Structured data parsing (JSON-LD)
 * - Content analysis for SEO metrics
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

// ============================================================================
// CACHE AND PERFORMANCE UTILITIES
// ============================================================================

/**
 * Generate cache key for SEO content
 * @param {string} content - Content to hash
 * @returns {string} Cache key
 */
function generateSEOCacheKey(content) {
  const hash = content.length + content.slice(0, 100) + content.slice(-100);
  return `seo_${hash.length}_${hash.charCodeAt(0)}_${hash.charCodeAt(hash.length - 1)}`;
}

// ============================================================================
// SEO DATA EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract comprehensive SEO data from document
 * @param {Document} document - DOM document
 * @param {Map} cache - Analysis cache
 * @param {Object} metrics - Performance metrics
 * @returns {Object} SEO data
 */
export function extractSEOData(document, cache = null, metrics = null) {
  // Use cache if provided
  if (cache) {
    const cacheKey = generateSEOCacheKey(document.head?.innerHTML || '');
    
    if (cache.has(cacheKey)) {
      if (metrics) metrics.cacheHits++;
      return cache.get(cacheKey);
    }
    
    if (metrics) metrics.cacheMisses++;
    
    const result = performSEOExtraction(document);
    cache.set(cacheKey, result);
    return result;
  }
  
  return performSEOExtraction(document);
}

/**
 * Perform the actual SEO data extraction
 * @param {Document} document - DOM document
 * @returns {Object} SEO data
 */
function performSEOExtraction(document) {
  const head = document.head;
  const title = document.title || '';
  
  // Batch query all meta elements at once for performance
  const metaTags = head ? Array.from(head.getElementsByTagName('meta')) : [];
  const linkTags = head ? Array.from(head.getElementsByTagName('link')) : [];
  
  // Create lookup maps for faster access
  const metaByName = new Map();
  const metaByProperty = new Map();
  
  metaTags.forEach(meta => {
    const name = meta.getAttribute('name');
    const property = meta.getAttribute('property');
    const content = meta.getAttribute('content') || '';
    
    if (name) metaByName.set(name.toLowerCase(), content);
    if (property) metaByProperty.set(property.toLowerCase(), content);
  });
  
  const linkByRel = new Map();
  linkTags.forEach(link => {
    const rel = link.getAttribute('rel');
    const href = link.getAttribute('href');
    if (rel && href) linkByRel.set(rel.toLowerCase(), href);
  });
  
  // Extract structured data efficiently
  const jsonLdScripts = head ? Array.from(head.querySelectorAll('script[type="application/ld+json"]')) : [];
  const structuredData = extractStructuredData(jsonLdScripts);

  // Extract language attributes
  const htmlLang = document.documentElement?.getAttribute('lang') || '';
  const hreflangLinks = linkTags.filter(link => link.getAttribute('rel') === 'alternate' && link.getAttribute('hreflang'));
  
  // Extract robots meta tags
  const robotsContent = metaByName.get('robots') || '';
  const robotsDirectives = parseRobotsDirectives(robotsContent);
  
  // Extract additional SEO meta tags
  const metaKeywords = metaByName.get('keywords') || '';
  const revisitAfter = metaByName.get('revisit-after') || '';
  const distribution = metaByName.get('distribution') || '';
  const rating = metaByName.get('rating') || '';
  
  // Extract favicon information
  const faviconData = extractFaviconData(linkTags);
  
  return {
    title: extractTitleData(title),
    metaDescription: extractMetaDescription(metaByName),
    metaKeywords: metaKeywords,
    canonical: linkByRel.get('canonical') || '',
    robots: robotsContent,
    robotsDirectives: robotsDirectives,
    language: {
      htmlLang: htmlLang,
      hreflangLinks: hreflangLinks.map(link => ({
        href: link.getAttribute('href'),
        hreflang: link.getAttribute('hreflang')
      }))
    },
    additionalMeta: {
      revisitAfter: revisitAfter,
      distribution: distribution,
      rating: rating
    },
    favicon: faviconData,
    openGraph: extractOpenGraphData(metaByProperty),
    twitterCard: extractTwitterCardData(metaByName),
    structuredData: {
      count: structuredData.length,
      types: structuredData.map(data => data['@type'] || data.type || 'Unknown').filter(Boolean),
      data: structuredData.slice(0, 3) // Limit stored data for performance
    }
  };
}

// ============================================================================
// SPECIALIZED EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract and analyze title data
 * @param {string} title - Page title
 * @returns {Object} Title analysis
 */
function extractTitleData(title) {
  return {
    text: title,
    length: title.length,
    isEmpty: !title.trim(),
    wordCount: title.trim().split(/\s+/).filter(w => w).length,
    isTooShort: title.length < 30,
    isTooLong: title.length > 60,
    hasNumbers: /\d/.test(title),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(title)
  };
}

/**
 * Extract and analyze meta description
 * @param {Map} metaByName - Meta tags by name
 * @returns {Object} Meta description analysis
 */
function extractMetaDescription(metaByName) {
  const description = metaByName.get('description') || '';
  
  return {
    text: description,
    length: description.length,
    isEmpty: !description.trim(),
    wordCount: description.trim().split(/\s+/).filter(w => w).length,
    isTooShort: description.length < 120,
    isTooLong: description.length > 160,
    hasCallToAction: /click|visit|learn|discover|find|get|buy|order|contact/i.test(description)
  };
}

/**
 * Extract Open Graph data
 * @param {Map} metaByProperty - Meta tags by property
 * @returns {Object} Open Graph data
 */
function extractOpenGraphData(metaByProperty) {
  return {
    title: metaByProperty.get('og:title') || '',
    description: metaByProperty.get('og:description') || '',
    image: metaByProperty.get('og:image') || '',
    type: metaByProperty.get('og:type') || '',
    url: metaByProperty.get('og:url') || '',
    siteName: metaByProperty.get('og:site_name') || '',
    locale: metaByProperty.get('og:locale') || '',
    imageAlt: metaByProperty.get('og:image:alt') || '',
    imageWidth: metaByProperty.get('og:image:width') || '',
    imageHeight: metaByProperty.get('og:image:height') || ''
  };
}

/**
 * Extract Twitter Card data
 * @param {Map} metaByName - Meta tags by name
 * @returns {Object} Twitter Card data
 */
function extractTwitterCardData(metaByName) {
  return {
    card: metaByName.get('twitter:card') || '',
    title: metaByName.get('twitter:title') || '',
    description: metaByName.get('twitter:description') || '',
    image: metaByName.get('twitter:image') || '',
    site: metaByName.get('twitter:site') || '',
    creator: metaByName.get('twitter:creator') || '',
    imageAlt: metaByName.get('twitter:image:alt') || ''
  };
}

/**
 * Extract and parse structured data
 * @param {Array} jsonLdScripts - JSON-LD script elements
 * @returns {Array} Parsed structured data
 */
function extractStructuredData(jsonLdScripts) {
  return jsonLdScripts.slice(0, 5).map(script => { // Limit to 5 for performance
    try {
      const data = JSON.parse(script.textContent);
      return data;
    } catch (error) {
      console.warn('Failed to parse JSON-LD:', error.message);
      return null;
    }
  }).filter(Boolean);
}

// ============================================================================
// SEO SCORING AND ANALYSIS
// ============================================================================

/**
 * Calculate SEO score based on extracted data
 * @param {Object} seoData - Extracted SEO data
 * @returns {Object} SEO score and recommendations
 */
export function calculateSEOScore(seoData) {
  let score = 0;
  const maxScore = 100;
  const recommendations = [];
  
  // Title analysis (25 points)
  if (seoData.title.text) {
    if (!seoData.title.isTooShort && !seoData.title.isTooLong) {
      score += 25;
    } else if (seoData.title.isTooShort) {
      score += 10;
      recommendations.push('Title is too short (< 30 characters)');
    } else {
      score += 15;
      recommendations.push('Title is too long (> 60 characters)');
    }
  } else {
    recommendations.push('Missing page title');
  }
  
  // Meta description analysis (25 points)
  if (seoData.metaDescription.text) {
    if (!seoData.metaDescription.isTooShort && !seoData.metaDescription.isTooLong) {
      score += 25;
    } else if (seoData.metaDescription.isTooShort) {
      score += 10;
      recommendations.push('Meta description is too short (< 120 characters)');
    } else {
      score += 15;
      recommendations.push('Meta description is too long (> 160 characters)');
    }
  } else {
    recommendations.push('Missing meta description');
  }
  
  // Open Graph data (20 points)
  if (seoData.openGraph.title && seoData.openGraph.description) {
    score += 15;
    if (seoData.openGraph.image) score += 5;
  } else {
    recommendations.push('Missing or incomplete Open Graph data');
  }
  
  // Structured data (15 points)
  if (seoData.structuredData.count > 0) {
    score += Math.min(15, seoData.structuredData.count * 5);
  } else {
    recommendations.push('No structured data found');
  }
  
  // Canonical URL (10 points)
  if (seoData.canonical) {
    score += 10;
  } else {
    recommendations.push('Missing canonical URL');
  }
  
  // Robots meta (5 points)
  if (seoData.robots) {
    score += 5;
  }
  
  return {
    score: Math.round(score),
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    recommendations,
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate SEO data structure
 * @param {Object} seoData - SEO data to validate
 * @returns {boolean} True if valid
 */
export function validateSEOData(seoData) {
  return seoData && 
         typeof seoData === 'object' &&
         seoData.title &&
         seoData.metaDescription &&
         seoData.openGraph &&
         seoData.twitterCard &&
         seoData.structuredData;
}

/**
 * Extract keywords from text for SEO analysis
 * @param {string} text - Text to analyze
 * @returns {Array} Array of keywords
 */
export function extractKeywords(text) {
  if (!text) return [];
  
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && word.length < 20)
    .filter(word => !isStopWord(word))
    .slice(0, 20); // Limit to top 20 keywords
}

/**
 * Parse robots meta tag directives
 * @param {string} robotsContent - Robots meta content
 * @returns {Object} Parsed robots directives
 */
function parseRobotsDirectives(robotsContent) {
  if (!robotsContent) return { directives: [], analysis: { allowsIndexing: true, allowsFollowing: true } };
  
  const directives = robotsContent.toLowerCase().split(',').map(d => d.trim());
  
  return {
    directives: directives,
    analysis: {
      allowsIndexing: !directives.includes('noindex'),
      allowsFollowing: !directives.includes('nofollow'),
      allowsArchiving: !directives.includes('noarchive'),
      allowsSnippets: !directives.includes('nosnippet'),
      allowsImageIndex: !directives.includes('noimageindex'),
      maxSnippet: directives.find(d => d.startsWith('max-snippet:'))?.split(':')[1] || null,
      maxImagePreview: directives.find(d => d.startsWith('max-image-preview:'))?.split(':')[1] || null,
      maxVideoPreview: directives.find(d => d.startsWith('max-video-preview:'))?.split(':')[1] || null
    }
  };
}

/**
 * Extract favicon data from link tags
 * @param {Array} linkTags - Array of link elements
 * @returns {Object} Favicon information
 */
function extractFaviconData(linkTags) {
  const faviconLinks = linkTags.filter(link => {
    const rel = link.getAttribute('rel')?.toLowerCase() || '';
    return rel.includes('icon') || rel === 'shortcut icon' || rel === 'apple-touch-icon';
  });
  
  const favicons = faviconLinks.map(link => ({
    rel: link.getAttribute('rel'),
    href: link.getAttribute('href'),
    sizes: link.getAttribute('sizes') || '',
    type: link.getAttribute('type') || ''
  }));
  
  return {
    count: favicons.length,
    hasStandardFavicon: favicons.some(f => f.rel?.includes('icon')),
    hasAppleTouchIcon: favicons.some(f => f.rel?.includes('apple-touch-icon')),
    favicons: favicons.slice(0, 10) // Limit stored data
  };
}

/**
 * Check if a word is a stop word
 * @param {string} word - Word to check
 * @returns {boolean} True if stop word
 */
function isStopWord(word) {
  const stopWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 
    'was', 'one', 'our', 'had', 'day', 'get', 'has', 'him', 'his', 'how', 
    'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 
    'its', 'let', 'put', 'say', 'she', 'too', 'use'
  ];
  return stopWords.includes(word);
}
