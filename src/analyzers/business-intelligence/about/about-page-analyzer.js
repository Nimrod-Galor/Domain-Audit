/**
 * ============================================================================
 * ABOUT PAGE ANALYZER MODULE
 * ============================================================================
 *
 * Analyzes about page content quality and structure including:
 * - Company story and mission
 * - Team information and credentials
 * - Company history and milestones
 * - Values and culture
 * - Leadership information
 * - Company size and location
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerInterface, AnalyzerCategories } from '../../core/AnalyzerInterface.js';

export class AboutPageAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('AboutPageAnalyzer');
    this.options = {
      enableStoryAnalysis: options.enableStoryAnalysis !== false,
      enableTeamAnalysis: options.enableTeamAnalysis !== false,
      enableMissionAnalysis: options.enableMissionAnalysis !== false,
      enableHistoryAnalysis: options.enableHistoryAnalysis !== false,
      ...options,
    };

    this.aboutSelectors = [
      'a[href*="about" i]', 'a[href*="who-we-are" i]', 'a[href*="our-story" i]',
      'a[href*="company" i]', 'a[href*="team" i]', 'a[href*="mission" i]'
    ];

    this.aboutSectionSelectors = [
      '#about', '.about', '.about-us', '.about-section',
      '.company-info', '.our-story', '.mission', '.vision',
      '[class*="about"]', '[id*="about"]'
    ];

    this.teamSelectors = [
      '.team', '.team-member', '.staff', '.employee', '.leadership',
      '.management', '.founders', '.our-team', '.meet-the-team',
      '[class*="team"]', '[class*="staff"]', '[class*="member"]'
    ];

    this.missionKeywords = [
      'mission', 'vision', 'values', 'purpose', 'goal', 'objective',
      'philosophy', 'believe', 'commitment', 'passion', 'dedication'
    ];

    this.storyKeywords = [
      'founded', 'established', 'started', 'began', 'history', 'story',
      'journey', 'since', 'years', 'experience', 'heritage', 'legacy'
    ];

    this.credibilityIndicators = [
      'award', 'recognition', 'certified', 'accredited', 'licensed',
      'professional', 'expert', 'specialist', 'qualified', 'experienced'
    ];
  }

  /**
   * Get analyzer metadata
   * @returns {Object} Analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      category: AnalyzerCategories.BUSINESS,
      description: 'Analyzes about page content quality and structure including company story, team information, mission, and credibility indicators',
      version: '1.0.0',
      author: 'Nimrod Galor',
      priority: 'high',
      type: 'business-intelligence',
      capabilities: [
        'about-page-detection',
        'company-story-analysis',
        'team-information-analysis',
        'mission-vision-analysis',
        'credibility-indicators-analysis',
        'content-quality-assessment'
      ],
      metrics: [
        'about_page_presence',
        'story_completeness_score',
        'team_info_score',
        'mission_clarity_score',
        'credibility_score',
        'content_quality_score',
        'overall_about_score'
      ],
      dependencies: ['cheerio'],
      performanceImpact: 'medium'
    };
  }

  /**
   * Validate input parameters
   * @param {Object} context - Analysis context
   * @param {Document} context.document - The DOM document
   * @param {string} context.url - The page URL
   * @returns {boolean} True if inputs are valid
   */
  validate(context) {
    if (!context || typeof context !== 'object') {
      return false;
    }

    const { document, url } = context;

    if (!document) {
      return false;
    }

    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      new URL(url);
    } catch (error) {
      return false;
    }

    return true;
  }

  /**
   * Analyze about page content and quality
   * @param {Object} context - Analysis context
   * @param {Document} context.document - DOM document
   * @param {string} context.url - Page URL
   * @param {Object} context.pageData - Page metadata
   * @returns {Object} About page analysis results
   */
  async analyze({document, url, pageData = {}}) {
    if (!this.validate({document, url, pageData})) {
      return this.handleError(new Error('Validation failed for about page analysis'), 'validation');
    }

    const { result, time } = await this.measureTime(async () => {
      try {
        const aboutPagePresence = this._findAboutPage(document);
        const aboutContent = this._analyzeAboutContent(document);
        const teamInformation = this._analyzeTeamInformation(document);
        const companyStory = this._analyzeCompanyStory(document);
        const missionVision = this._analyzeMissionVision(document);
        const credibilityIndicators = this._analyzeCredibilityIndicators(document);
        const contentQuality = this._analyzeContentQuality(document);

        const analysis = {
          aboutPagePresence,
          aboutContent,
          teamInformation,
          companyStory,
          missionVision,
          credibilityIndicators,
          contentQuality,
        };

        const score = this._calculateAboutScore(analysis);

        const result = {
          ...analysis,
          score,
          grade: this._assignGrade(score),
          strengths: this._identifyAboutStrengths(analysis),
          recommendations: this._generateAboutRecommendations(analysis),
          summary: this._generateExecutiveSummary(analysis, score),
          metadata: {
            ...this.getMetadata(),
            analysisDate: new Date().toISOString(),
            url: url
          }
        };

        return this.createSuccessResponse({
          data: result
        });

      } catch (error) {
        return this.handleError(error, 'about page analysis');
      }
    });

    return result;
  }

  /**
   * Find about page links and sections
   */
  _findAboutPage(document) {
    const aboutLinks = [];
    const aboutSections = [];

    // Find about page links
    this.aboutSelectors.forEach((selector) => {
      const links = document.querySelectorAll(selector);
      links.forEach((link) => {
        aboutLinks.push({
          href: link.href,
          text: (link.textContent || '').trim(),
          location: this._getLinkLocation(link),
        });
      });
    });

    // Find about sections on current page
    this.aboutSectionSelectors.forEach((selector) => {
      const sections = document.querySelectorAll(selector);
      sections.forEach((section) => {
        aboutSections.push({
          selector,
          wordCount: this._countWords(section.textContent || ''),
          hasHeading: this._hasHeading(section),
          contentLength: (section.textContent || '').trim().length,
        });
      });
    });

    return {
      aboutLinks,
      aboutSections,
      hasAboutPage: aboutLinks.length > 0,
      hasAboutSection: aboutSections.length > 0,
      linkCount: aboutLinks.length,
      sectionCount: aboutSections.length,
      inNavigation: aboutLinks.some(link => link.location === 'navigation'),
      inFooter: aboutLinks.some(link => link.location === 'footer'),
      score: this._calculatePresenceScore(aboutLinks, aboutSections),
    };
  }

  /**
   * Analyze about content quality
   */
  _analyzeAboutContent(document) {
    const aboutElements = document.querySelectorAll(this.aboutSectionSelectors.join(', '));
    let totalWordCount = 0;
    let totalElements = 0;
    let hasStructuredContent = false;
    let hasImages = false;

    const contentAnalysis = {
      elements: [],
      totalWordCount: 0,
      averageWordCount: 0,
      hasStructuredContent: false,
      hasImages: false,
      contentDepth: 'shallow',
    };

    aboutElements.forEach((element) => {
      const wordCount = this._countWords(element.textContent || '');
      const images = element.querySelectorAll('img');
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const paragraphs = element.querySelectorAll('p');

      totalWordCount += wordCount;
      totalElements++;

      if (images.length > 0) hasImages = true;
      if (headings.length > 1 && paragraphs.length > 2) hasStructuredContent = true;

      contentAnalysis.elements.push({
        wordCount,
        imageCount: images.length,
        headingCount: headings.length,
        paragraphCount: paragraphs.length,
        hasStructure: headings.length > 0 && paragraphs.length > 1,
      });
    });

    contentAnalysis.totalWordCount = totalWordCount;
    contentAnalysis.averageWordCount = totalElements > 0 ? totalWordCount / totalElements : 0;
    contentAnalysis.hasStructuredContent = hasStructuredContent;
    contentAnalysis.hasImages = hasImages;
    contentAnalysis.contentDepth = this._assessContentDepth(totalWordCount);

    return {
      ...contentAnalysis,
      score: this._calculateContentScore(contentAnalysis),
    };
  }

  /**
   * Analyze team information
   */
  _analyzeTeamInformation(document) {
    const teamMembers = [];
    const teamSections = [];

    // Find team sections
    this.teamSelectors.forEach((selector) => {
      const sections = document.querySelectorAll(selector);
      sections.forEach((section) => {
        teamSections.push({
          selector,
          memberCount: this._countTeamMembers(section),
          hasPhotos: this._hasTeamPhotos(section),
          hasBios: this._hasTeamBios(section),
          hasRoles: this._hasTeamRoles(section),
        });
      });
    });

    // Analyze individual team members
    const memberElements = document.querySelectorAll('.team-member, .staff-member, .employee, [class*="member"]');
    memberElements.forEach((element) => {
      const member = this._analyzeTeamMember(element);
      if (member.isTeamMember) {
        teamMembers.push(member);
      }
    });

    return {
      teamSections,
      teamMembers,
      memberCount: teamMembers.length,
      hasTeamSection: teamSections.length > 0,
      hasPhotos: teamMembers.some(m => m.hasPhoto),
      hasBios: teamMembers.some(m => m.hasBio),
      hasRoles: teamMembers.some(m => m.hasRole),
      averageBioLength: teamMembers.length > 0 
        ? teamMembers.reduce((sum, m) => sum + m.bioLength, 0) / teamMembers.length 
        : 0,
      score: this._calculateTeamScore(teamSections, teamMembers),
    };
  }

  /**
   * Analyze company story content
   */
  _analyzeCompanyStory(document) {
    const textContent = document.body.textContent.toLowerCase();
    const storyIndicators = [];
    const historyElements = [];

    // Look for story keywords
    this.storyKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = textContent.match(regex);
      if (matches) {
        storyIndicators.push({
          keyword,
          count: matches.length,
        });
      }
    });

    // Look for dates and milestones
    const datePattern = /\b(19|20)\d{2}\b/g;
    const dates = textContent.match(datePattern) || [];
    const uniqueDates = [...new Set(dates)];

    // Look for founding/establishment information
    const foundingPattern = /(founded|established|started|began)\s+(in\s+)?(19|20)\d{2}/gi;
    const foundingMatches = document.body.textContent.match(foundingPattern) || [];

    // Look for milestone keywords
    const milestoneKeywords = ['milestone', 'achievement', 'launched', 'expanded', 'grew', 'opened', 'acquired'];
    const milestones = milestoneKeywords.filter(keyword =>
      new RegExp(`\\b${keyword}\\b`, 'gi').test(textContent)
    );

    return {
      storyIndicators,
      historyElements,
      dateCount: uniqueDates.length,
      foundingMentions: foundingMatches.length,
      milestoneCount: milestones.length,
      hasTimeline: uniqueDates.length > 2,
      hasFoundingStory: foundingMatches.length > 0,
      storyRichness: this._assessStoryRichness(storyIndicators, uniqueDates, milestones),
      score: this._calculateStoryScore(storyIndicators, uniqueDates, foundingMatches, milestones),
    };
  }

  /**
   * Analyze mission and vision statements
   */
  _analyzeMissionVision(document) {
    const textContent = document.body.textContent.toLowerCase();
    const missionIndicators = [];

    // Look for mission/vision keywords
    this.missionKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = textContent.match(regex);
      if (matches) {
        missionIndicators.push({
          keyword,
          count: matches.length,
        });
      }
    });

    // Look for mission/vision sections
    const missionSections = document.querySelectorAll('.mission, .vision, .values, .purpose, [class*="mission"], [class*="vision"]');
    const missionContent = [];

    missionSections.forEach((section) => {
      missionContent.push({
        type: this._identifyMissionType(section),
        wordCount: this._countWords(section.textContent || ''),
        hasHeading: this._hasHeading(section),
        content: (section.textContent || '').trim().substring(0, 200),
      });
    });

    return {
      missionIndicators,
      missionContent,
      sectionCount: missionSections.length,
      hasMissionStatement: missionContent.some(c => c.type === 'mission'),
      hasVisionStatement: missionContent.some(c => c.type === 'vision'),
      hasValues: missionContent.some(c => c.type === 'values'),
      totalWordCount: missionContent.reduce((sum, c) => sum + c.wordCount, 0),
      score: this._calculateMissionScore(missionIndicators, missionContent),
    };
  }

  /**
   * Analyze credibility indicators
   */
  _analyzeCredibilityIndicators(document) {
    const textContent = document.body.textContent.toLowerCase();
    const credibilityMentions = [];

    // Look for credibility keywords
    this.credibilityIndicators.forEach((indicator) => {
      const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
      const matches = textContent.match(regex);
      if (matches) {
        credibilityMentions.push({
          indicator,
          count: matches.length,
        });
      }
    });

    // Look for specific credentials
    const credentials = this._findCredentials(document);
    const awards = this._findAwards(document);
    const certifications = this._findCertifications(document);

    return {
      credibilityMentions,
      credentials,
      awards,
      certifications,
      totalIndicators: credibilityMentions.length + credentials.length + awards.length + certifications.length,
      hasCredentials: credentials.length > 0,
      hasAwards: awards.length > 0,
      hasCertifications: certifications.length > 0,
      score: this._calculateCredibilityScore(credibilityMentions, credentials, awards, certifications),
    };
  }

  /**
   * Analyze overall content quality
   */
  _analyzeContentQuality(document) {
    const aboutElements = document.querySelectorAll(this.aboutSectionSelectors.join(', '));
    let readabilityScore = 0;
    let engagementScore = 0;
    let professionalismScore = 0;

    aboutElements.forEach((element) => {
      readabilityScore += this._assessReadability(element.textContent || '');
      engagementScore += this._assessEngagement(element);
      professionalismScore += this._assessProfessionalism(element.textContent || '');
    });

    const elementCount = aboutElements.length || 1;
    
    return {
      readabilityScore: readabilityScore / elementCount,
      engagementScore: engagementScore / elementCount,
      professionalismScore: professionalismScore / elementCount,
      overallQuality: (readabilityScore + engagementScore + professionalismScore) / (3 * elementCount),
      score: this._calculateQualityScore(readabilityScore, engagementScore, professionalismScore, elementCount),
    };
  }

  // Helper methods
  _getLinkLocation(link) {
    const nav = link.closest('nav, header');
    const footer = link.closest('footer');
    
    if (nav) return 'navigation';
    if (footer) return 'footer';
    return 'content';
  }

  _countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  _hasHeading(element) {
    return element.querySelector('h1, h2, h3, h4, h5, h6') !== null;
  }

  _assessContentDepth(wordCount) {
    if (wordCount < 100) return 'shallow';
    if (wordCount < 300) return 'moderate';
    if (wordCount < 600) return 'good';
    return 'comprehensive';
  }

  _countTeamMembers(section) {
    const memberSelectors = ['.team-member', '.staff-member', '.employee', '.member', '[class*="member"]'];
    let count = 0;
    
    memberSelectors.forEach((selector) => {
      count += section.querySelectorAll(selector).length;
    });
    
    return count;
  }

  _hasTeamPhotos(section) {
    const images = section.querySelectorAll('img');
    return images.length > 0;
  }

  _hasTeamBios(section) {
    const bioSelectors = ['.bio', '.biography', '.description', 'p'];
    return bioSelectors.some(selector => section.querySelector(selector));
  }

  _hasTeamRoles(section) {
    const roleKeywords = ['ceo', 'cto', 'manager', 'director', 'founder', 'president', 'vice', 'lead'];
    const text = (section.textContent || '').toLowerCase();
    return roleKeywords.some(role => text.includes(role));
  }

  _analyzeTeamMember(element) {
    const text = (element.textContent || '').toLowerCase();
    const hasPhoto = element.querySelector('img') !== null;
    const hasBio = element.querySelector('.bio, .biography, .description, p') !== null;
    const hasRole = /\b(ceo|cto|manager|director|founder|president|vice|lead|senior|junior)\b/.test(text);
    const bioLength = this._countWords(element.textContent || '');

    const isTeamMember = hasRole || hasBio || hasPhoto || bioLength > 20;

    return {
      element,
      isTeamMember,
      hasPhoto,
      hasBio,
      hasRole,
      bioLength,
      quality: this._assessMemberQuality(hasPhoto, hasBio, hasRole, bioLength),
    };
  }

  _assessMemberQuality(hasPhoto, hasBio, hasRole, bioLength) {
    let quality = 0;
    if (hasPhoto) quality += 25;
    if (hasBio) quality += 30;
    if (hasRole) quality += 25;
    if (bioLength > 50) quality += 20;
    return quality;
  }

  _assessStoryRichness(indicators, dates, milestones) {
    const indicatorCount = indicators.reduce((sum, i) => sum + i.count, 0);
    const score = indicatorCount + dates.length + milestones.length;
    
    if (score >= 10) return 'rich';
    if (score >= 5) return 'moderate';
    if (score >= 2) return 'basic';
    return 'minimal';
  }

  _identifyMissionType(section) {
    const text = (section.textContent || '').toLowerCase();
    const className = (section.className || '').toLowerCase();
    
    if (text.includes('mission') || className.includes('mission')) return 'mission';
    if (text.includes('vision') || className.includes('vision')) return 'vision';
    if (text.includes('values') || className.includes('values')) return 'values';
    if (text.includes('purpose') || className.includes('purpose')) return 'purpose';
    return 'general';
  }

  _findCredentials(document) {
    const credentials = [];
    const credentialPatterns = [
      /\b(phd|md|jd|mba|cpa|pe|rn)\b/gi,
      /\b\d+\s*years?\s*of?\s*experience\b/gi,
      /\blicensed\s+\w+/gi,
      /\bcertified\s+\w+/gi,
    ];

    const text = document.body.textContent;
    credentialPatterns.forEach((pattern) => {
      const matches = text.match(pattern) || [];
      credentials.push(...matches);
    });

    return [...new Set(credentials)];
  }

  _findAwards(document) {
    const awards = [];
    const awardKeywords = ['award', 'winner', 'recognition', 'honor', 'prize', 'best', 'top'];
    const text = document.body.textContent.toLowerCase();

    awardKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex) || [];
      awards.push(...matches);
    });

    return awards;
  }

  _findCertifications(document) {
    const certifications = [];
    const certKeywords = ['certified', 'certification', 'accredited', 'accreditation', 'iso', 'pci'];
    const text = document.body.textContent.toLowerCase();

    certKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex) || [];
      certifications.push(...matches);
    });

    return certifications;
  }

  _assessReadability(text) {
    // Simple readability assessment
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length || 0;
    
    // Ideal range: 15-20 words per sentence
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) return 80;
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) return 60;
    if (avgWordsPerSentence >= 5 && avgWordsPerSentence <= 30) return 40;
    return 20;
  }

  _assessEngagement(element) {
    let score = 0;
    
    // Check for engaging elements
    if (element.querySelector('img')) score += 20;
    if (element.querySelector('video')) score += 30;
    if (element.querySelector('a')) score += 10;
    if (element.querySelector('ul, ol')) score += 15;
    if (element.querySelector('blockquote')) score += 15;
    
    // Check text engagement
    const text = (element.textContent || '').toLowerCase();
    const engagingWords = ['we', 'our', 'you', 'your', 'customer', 'client', 'passion', 'love', 'believe'];
    const engagingCount = engagingWords.filter(word => text.includes(word)).length;
    score += engagingCount * 3;
    
    return Math.min(score, 100);
  }

  _assessProfessionalism(text) {
    let score = 50; // Base score
    
    // Check for professional language
    const professionalWords = ['professional', 'expertise', 'experience', 'qualified', 'certified', 'licensed'];
    const professionalCount = professionalWords.filter(word => text.toLowerCase().includes(word)).length;
    score += professionalCount * 8;
    
    // Deduct for unprofessional elements
    const unprofessionalWords = ['awesome', 'amazing', 'super', 'cool', 'totally'];
    const unprofessionalCount = unprofessionalWords.filter(word => text.toLowerCase().includes(word)).length;
    score -= unprofessionalCount * 5;
    
    return Math.max(0, Math.min(score, 100));
  }

  // Scoring methods
  _calculatePresenceScore(aboutLinks, aboutSections) {
    let score = 0;
    
    if (aboutLinks.length > 0) score += 40;
    if (aboutSections.length > 0) score += 40;
    if (aboutLinks.some(link => link.location === 'navigation')) score += 10;
    if (aboutSections.some(section => section.wordCount > 100)) score += 10;
    
    return Math.min(score, 100);
  }

  _calculateContentScore(contentAnalysis) {
    let score = 0;
    
    // Word count scoring
    if (contentAnalysis.totalWordCount > 500) score += 30;
    else if (contentAnalysis.totalWordCount > 200) score += 20;
    else if (contentAnalysis.totalWordCount > 100) score += 10;
    
    // Structure scoring
    if (contentAnalysis.hasStructuredContent) score += 25;
    if (contentAnalysis.hasImages) score += 15;
    
    // Depth scoring
    switch (contentAnalysis.contentDepth) {
      case 'comprehensive': score += 30; break;
      case 'good': score += 25; break;
      case 'moderate': score += 15; break;
      case 'shallow': score += 5; break;
    }
    
    return Math.min(score, 100);
  }

  _calculateTeamScore(teamSections, teamMembers) {
    let score = 0;
    
    if (teamSections.length > 0) score += 30;
    if (teamMembers.length > 0) score += 20;
    if (teamMembers.length > 3) score += 10;
    if (teamMembers.some(m => m.hasPhoto)) score += 15;
    if (teamMembers.some(m => m.hasBio)) score += 15;
    if (teamMembers.some(m => m.hasRole)) score += 10;
    
    return Math.min(score, 100);
  }

  _calculateStoryScore(indicators, dates, foundingMatches, milestones) {
    let score = 0;
    
    const indicatorCount = indicators.reduce((sum, i) => sum + i.count, 0);
    score += Math.min(indicatorCount * 5, 30);
    score += Math.min(dates.length * 5, 25);
    score += foundingMatches.length * 15;
    score += Math.min(milestones.length * 5, 20);
    
    return Math.min(score, 100);
  }

  _calculateMissionScore(indicators, content) {
    let score = 0;
    
    const indicatorCount = indicators.reduce((sum, i) => sum + i.count, 0);
    score += Math.min(indicatorCount * 3, 30);
    score += Math.min(content.length * 15, 45);
    
    const totalWords = content.reduce((sum, c) => sum + c.wordCount, 0);
    if (totalWords > 100) score += 15;
    if (totalWords > 50) score += 10;
    
    return Math.min(score, 100);
  }

  _calculateCredibilityScore(mentions, credentials, awards, certifications) {
    let score = 0;
    
    score += Math.min(mentions.length * 5, 25);
    score += Math.min(credentials.length * 10, 30);
    score += Math.min(awards.length * 8, 25);
    score += Math.min(certifications.length * 10, 30);
    
    return Math.min(score, 100);
  }

  _calculateQualityScore(readability, engagement, professionalism, elementCount) {
    if (elementCount === 0) return 0;
    
    return Math.round((readability + engagement + professionalism) / (3 * elementCount));
  }

  _calculateAboutScore(analysis) {
    const weights = {
      aboutPagePresence: 0.15,
      aboutContent: 0.25,
      teamInformation: 0.20,
      companyStory: 0.15,
      missionVision: 0.15,
      credibilityIndicators: 0.10,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      if (analysis[category] && analysis[category].score !== undefined) {
        totalScore += analysis[category].score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  _assignGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  _identifyAboutStrengths(analysis) {
    const strengths = [];
    
    if (analysis.aboutPagePresence.inNavigation) strengths.push('About page prominently featured in navigation');
    if (analysis.aboutContent.contentDepth === 'comprehensive') strengths.push('Comprehensive about content');
    if (analysis.teamInformation.hasPhotos && analysis.teamInformation.hasBios) strengths.push('Detailed team information with photos and bios');
    if (analysis.companyStory.hasFoundingStory) strengths.push('Clear company founding story');
    if (analysis.missionVision.hasMissionStatement) strengths.push('Clear mission statement');
    if (analysis.credibilityIndicators.hasCredentials) strengths.push('Professional credentials displayed');
    
    return strengths;
  }

  _generateAboutRecommendations(analysis) {
    const recommendations = [];
    
    if (!analysis.aboutPagePresence.hasAboutPage) {
      recommendations.push({
        category: 'About Page',
        priority: 'high',
        title: 'Create About Page',
        description: 'Add a dedicated about page to build trust and credibility.',
        impact: 'high',
      });
    }
    
    if (analysis.aboutContent.contentDepth === 'shallow') {
      recommendations.push({
        category: 'Content Quality',
        priority: 'high',
        title: 'Expand About Content',
        description: 'Add more detailed information about your company story and mission.',
        impact: 'medium',
      });
    }
    
    if (!analysis.teamInformation.hasTeamSection) {
      recommendations.push({
        category: 'Team Information',
        priority: 'medium',
        title: 'Add Team Section',
        description: 'Include team member information to humanize your business.',
        impact: 'medium',
      });
    }
    
    if (!analysis.companyStory.hasFoundingStory) {
      recommendations.push({
        category: 'Company Story',
        priority: 'medium',
        title: 'Add Company History',
        description: 'Share your company\'s founding story and milestones.',
        impact: 'medium',
      });
    }
    
    if (!analysis.missionVision.hasMissionStatement) {
      recommendations.push({
        category: 'Mission & Vision',
        priority: 'medium',
        title: 'Add Mission Statement',
        description: 'Clearly articulate your company\'s mission and values.',
        impact: 'medium',
      });
    }
    
    return recommendations;
  }

  /**
   * Generate executive summary
   * @param {Object} analysis - Analysis results
   * @param {number} score - Overall score
   * @returns {string} Executive summary
   */
  _generateExecutiveSummary(analysis, score) {
    const grade = this._assignGrade(score);
    
    let summary = `About Page Analysis (Grade: ${grade}, Score: ${score}/100)\n\n`;
    
    summary += `Overall Assessment: `;
    if (score >= 80) {
      summary += `Excellent about page content with comprehensive company information and strong credibility indicators. `;
    } else if (score >= 60) {
      summary += `Good about page foundation with room for improvement in storytelling and team presentation. `;
    } else if (score >= 40) {
      summary += `Basic about page present but lacking depth and credibility elements. `;
    } else {
      summary += `Limited or missing about page content, requires significant development. `;
    }
    
    // About page presence
    if (analysis.aboutPagePresence.hasAboutPage) {
      summary += `Dedicated about page found with ${analysis.aboutPagePresence.aboutSections.length} relevant sections. `;
    } else {
      summary += `No dedicated about page detected. `;
    }
    
    // Company story summary
    if (analysis.companyStory.hasFoundingStory) {
      summary += `Company story present with ${analysis.companyStory.storyRichness} richness level. `;
    } else {
      summary += `Company story not found or underdeveloped. `;
    }
    
    // Team information summary
    if (analysis.teamInformation.hasTeamSection) {
      summary += `Team information includes ${analysis.teamInformation.teamMembers.length} member(s) with ${Math.round(analysis.teamInformation.averageBioLength)} average bio length. `;
    } else {
      summary += `No team information or member profiles found. `;
    }
    
    // Mission/vision summary
    if (analysis.missionVision.hasMissionStatement) {
      summary += `Mission statement present. `;
      if (analysis.missionVision.hasVisionStatement) {
        summary += `Vision statement also included. `;
      }
    } else {
      summary += `Mission and vision statements not clearly defined. `;
    }
    
    // Credibility indicators summary
    if (analysis.credibilityIndicators.credibilityMentions.length > 0) {
      summary += `${analysis.credibilityIndicators.credibilityMentions.length} credibility indicator(s) found including ${analysis.credibilityIndicators.credibilityMentions.slice(0, 3).map(i => i.indicator).join(', ')}. `;
    } else {
      summary += `No credibility indicators detected. `;
    }
    
    return summary.trim();
  }

  /**
   * Assign letter grade based on score
   * @param {number} score - Numerical score
   * @returns {string} Letter grade
   */
  _assignGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }
}
