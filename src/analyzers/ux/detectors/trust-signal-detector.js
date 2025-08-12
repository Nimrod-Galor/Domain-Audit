/**
 * Trust Signal Detector - GPT-5 Style Modular Component
 * 
 * Detects trust signals and credibility indicators for UX analysis.
 */
export class TrustSignalDetector {
  constructor(options = {}) {
    this.options = options;
    this.trustPatterns = {
      ssl: /https:|ssl|secure/i,
      testimonials: /testimonial|review|rating|stars/i,
      guarantees: /guarantee|warranty|return.*policy|money.*back/i,
      certifications: /certified|accredited|verified|trusted/i,
      contact: /contact.*us|phone|address|email/i
    };
  }

  detect(document, url = '') {
    const signals = {
      ssl: this._detectSSL(url),
      security: this._detectSecurityBadges(document),
      testimonials: this._detectTestimonials(document),
      contact: this._detectContactInfo(document),
      certifications: this._detectCertifications(document),
      socialProof: this._detectSocialProof(document)
    };

    const trustScore = this._calculateTrustScore(signals);

    return {
      signals,
      trustScore,
      totalSignals: Object.values(signals).filter(s => s.found).length,
      metadata: { detectTime: Date.now() }
    };
  }

  _detectSSL(url) {
    return {
      found: url.startsWith('https://'),
      score: url.startsWith('https://') ? 20 : 0
    };
  }

  _detectSecurityBadges(document) {
    const badges = document.querySelectorAll('[alt*="secure"], [src*="ssl"], [src*="security"], .security-badge');
    return {
      found: badges.length > 0,
      count: badges.length,
      score: Math.min(badges.length * 5, 15)
    };
  }

  _detectTestimonials(document) {
    const testimonials = document.querySelectorAll('.testimonial, .review, .rating, [class*="star"]');
    return {
      found: testimonials.length > 0,
      count: testimonials.length,
      score: Math.min(testimonials.length * 3, 15)
    };
  }

  _detectContactInfo(document) {
    const contactElements = document.querySelectorAll('[href^="tel:"], [href^="mailto:"], .contact, .phone, .email');
    const addressElements = document.querySelectorAll('.address, [itemprop="address"]');
    
    return {
      found: contactElements.length > 0 || addressElements.length > 0,
      contact: contactElements.length,
      address: addressElements.length,
      score: Math.min((contactElements.length + addressElements.length) * 5, 20)
    };
  }

  _detectCertifications(document) {
    const content = document.body?.textContent?.toLowerCase() || '';
    const certificationFound = this.trustPatterns.certifications.test(content);
    
    return {
      found: certificationFound,
      score: certificationFound ? 10 : 0
    };
  }

  _detectSocialProof(document) {
    const socialElements = document.querySelectorAll('[href*="facebook"], [href*="twitter"], [href*="linkedin"], .social, .follow');
    const customerCount = /\d+.*customers?|\d+.*users?|\d+.*members?/i.test(document.body?.textContent || '');
    
    return {
      found: socialElements.length > 0 || customerCount,
      socialLinks: socialElements.length,
      customerCount: customerCount,
      score: Math.min(socialElements.length * 2 + (customerCount ? 10 : 0), 15)
    };
  }

  _calculateTrustScore(signals) {
    return Object.values(signals).reduce((total, signal) => total + (signal.score || 0), 0);
  }
}
