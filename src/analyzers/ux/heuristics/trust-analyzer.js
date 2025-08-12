/**
 * Trust Analyzer - GPT-5 Style Heuristic Component
 * 
 * Analyzes trust factors and credibility indicators.
 */
export class TrustAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  analyze(detectionResults, context) {
    const trustMetrics = {
      credibilitySignals: this._analyzeCredibilitySignals(detectionResults),
      transparency: this._analyzeTransparency(detectionResults),
      socialProof: this._analyzeSocialProof(detectionResults),
      securityIndicators: this._analyzeSecurityIndicators(detectionResults)
    };

    const overallScore = this._calculateTrustScore(trustMetrics);

    return {
      score: overallScore,
      metrics: trustMetrics,
      findings: this._generateTrustFindings(trustMetrics),
      recommendations: this._generateTrustRecommendations(trustMetrics),
      trustLevel: this._assessTrustLevel(overallScore)
    };
  }

  _analyzeCredibilitySignals(detectionResults) {
    const trustSignal = detectionResults.trustSignal || {};
    
    let credibilityScore = 0;
    const signals = [];
    
    // SSL Certificate
    if (trustSignal.signals?.ssl?.found) {
      credibilityScore += 20;
      signals.push('SSL Certificate');
    }
    
    // Contact Information
    if (trustSignal.signals?.contact?.found) {
      credibilityScore += 25;
      signals.push('Contact Information');
    }
    
    // Certifications
    if (trustSignal.signals?.certifications?.found) {
      credibilityScore += 15;
      signals.push('Certifications');
    }
    
    // Security badges
    if (trustSignal.signals?.security?.found) {
      credibilityScore += 10;
      signals.push('Security Badges');
    }
    
    return {
      score: Math.min(credibilityScore, 100),
      signals,
      signalCount: signals.length,
      hasSSL: trustSignal.signals?.ssl?.found || false,
      hasContact: trustSignal.signals?.contact?.found || false
    };
  }

  _analyzeTransparency(detectionResults) {
    const navigation = detectionResults.navigation || {};
    const content = detectionResults.content || {};
    
    let transparencyScore = 50; // Base score
    const transparencyElements = [];
    
    // Check for about page
    const aboutLink = navigation.navigation?.primary?.elements?.find(item => 
      /about|who.*we.*are|our.*story|company/i.test(item.text)
    );
    if (aboutLink) {
      transparencyScore += 20;
      transparencyElements.push('About Page');
    }
    
    // Check for privacy policy
    const privacyLink = navigation.navigation?.footer?.links?.find(link => 
      /privacy|policy/i.test(link.text)
    );
    if (privacyLink) {
      transparencyScore += 15;
      transparencyElements.push('Privacy Policy');
    }
    
    // Check for terms of service
    const termsLink = navigation.navigation?.footer?.links?.find(link => 
      /terms|conditions/i.test(link.text)
    );
    if (termsLink) {
      transparencyScore += 10;
      transparencyElements.push('Terms of Service');
    }
    
    // Clear content structure indicates transparency
    if (content.content?.headings?.length > 0) {
      transparencyScore += 5;
      transparencyElements.push('Clear Content Structure');
    }
    
    return {
      score: Math.min(transparencyScore, 100),
      elements: transparencyElements,
      elementCount: transparencyElements.length,
      hasAbout: !!aboutLink,
      hasPrivacy: !!privacyLink,
      hasTerms: !!termsLink
    };
  }

  _analyzeSocialProof(detectionResults) {
    const trustSignal = detectionResults.trustSignal || {};
    const content = detectionResults.content || {};
    
    let socialProofScore = 0;
    const proofElements = [];
    
    // Social proof from trust signals
    if (trustSignal.signals?.socialProof?.found) {
      socialProofScore += 30;
      proofElements.push('Social Media Links');
    }
    
    // Testimonials from trust signals
    if (trustSignal.signals?.testimonials?.found) {
      socialProofScore += 35;
      proofElements.push('Customer Testimonials');
    }
    
    // Customer count indicators
    if (trustSignal.signals?.socialProof?.customerCount) {
      socialProofScore += 20;
      proofElements.push('Customer Count');
    }
    
    // Media coverage or awards
    const content_text = content.content?.text || {};
    const hasMediaMention = /featured.*in|as.*seen.*on|award|recognition/i.test(content_text.toString());
    if (hasMediaMention) {
      socialProofScore += 15;
      proofElements.push('Media Coverage');
    }
    
    return {
      score: Math.min(socialProofScore, 100),
      elements: proofElements,
      elementCount: proofElements.length,
      hasTestimonials: trustSignal.signals?.testimonials?.found || false,
      hasSocialLinks: trustSignal.signals?.socialProof?.found || false
    };
  }

  _analyzeSecurityIndicators(detectionResults) {
    const trustSignal = detectionResults.trustSignal || {};
    const form = detectionResults.form || {};
    
    let securityScore = 0;
    const securityFeatures = [];
    
    // SSL Certificate (most important)
    if (trustSignal.signals?.ssl?.found) {
      securityScore += 40;
      securityFeatures.push('SSL Encryption');
    }
    
    // Security badges
    if (trustSignal.signals?.security?.found) {
      securityScore += 20;
      securityFeatures.push('Security Badges');
    }
    
    // Form security (for sites with forms)
    if (form.forms?.length > 0) {
      const hasSecureForms = form.forms.some(f => f.method === 'post');
      if (hasSecureForms) {
        securityScore += 15;
        securityFeatures.push('Secure Forms');
      }
    }
    
    // Additional security indicators
    if (trustSignal.trustScore > 60) {
      securityScore += 25;
      securityFeatures.push('Multiple Security Indicators');
    }
    
    return {
      score: Math.min(securityScore, 100),
      features: securityFeatures,
      featureCount: securityFeatures.length,
      hasSSL: trustSignal.signals?.ssl?.found || false,
      hasSecurityBadges: trustSignal.signals?.security?.found || false
    };
  }

  _calculateTrustScore(metrics) {
    const weights = {
      credibilitySignals: 0.3,
      transparency: 0.25,
      socialProof: 0.25,
      securityIndicators: 0.2
    };
    
    let totalScore = 0;
    totalScore += metrics.credibilitySignals.score * weights.credibilitySignals;
    totalScore += metrics.transparency.score * weights.transparency;
    totalScore += metrics.socialProof.score * weights.socialProof;
    totalScore += metrics.securityIndicators.score * weights.securityIndicators;
    
    return Math.round(totalScore);
  }

  _generateTrustFindings(metrics) {
    const findings = [];
    
    if (!metrics.securityIndicators.hasSSL) {
      findings.push({
        category: 'trust',
        severity: 'high',
        message: 'No SSL certificate detected',
        impact: 'Critical security and trust issue'
      });
    }
    
    if (metrics.credibilitySignals.signalCount < 2) {
      findings.push({
        category: 'trust',
        severity: 'medium',
        message: 'Limited credibility signals found',
        impact: 'May reduce user trust'
      });
    }
    
    if (metrics.socialProof.elementCount === 0) {
      findings.push({
        category: 'trust',
        severity: 'medium',
        message: 'No social proof elements detected',
        impact: 'Missing opportunities to build trust'
      });
    }
    
    if (!metrics.transparency.hasAbout && !metrics.transparency.hasContact) {
      findings.push({
        category: 'trust',
        severity: 'high',
        message: 'Limited transparency information',
        impact: 'Users cannot learn about the organization'
      });
    }
    
    return findings;
  }

  _generateTrustRecommendations(metrics) {
    const recommendations = [];
    
    if (!metrics.securityIndicators.hasSSL) {
      recommendations.push({
        category: 'trust',
        priority: 'critical',
        title: 'Implement SSL certificate',
        description: 'Add HTTPS encryption to secure user data and improve trust',
        expectedImpact: 'High'
      });
    }
    
    if (metrics.credibilitySignals.signalCount < 3) {
      recommendations.push({
        category: 'trust',
        priority: 'high',
        title: 'Add more credibility signals',
        description: 'Include contact information, certifications, and security badges',
        expectedImpact: 'Medium to High'
      });
    }
    
    if (metrics.socialProof.elementCount < 2) {
      recommendations.push({
        category: 'trust',
        priority: 'medium',
        title: 'Implement social proof elements',
        description: 'Add customer testimonials, reviews, or usage statistics',
        expectedImpact: 'Medium'
      });
    }
    
    if (metrics.transparency.elementCount < 3) {
      recommendations.push({
        category: 'trust',
        priority: 'medium',
        title: 'Improve transparency',
        description: 'Add about page, privacy policy, and terms of service',
        expectedImpact: 'Medium'
      });
    }
    
    return recommendations;
  }

  _assessTrustLevel(score) {
    if (score >= 85) return 'High Trust';
    if (score >= 70) return 'Good Trust';
    if (score >= 55) return 'Moderate Trust';
    if (score >= 40) return 'Low Trust';
    return 'Very Low Trust';
  }
}
