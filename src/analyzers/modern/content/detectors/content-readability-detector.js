/**
 * ============================================================================
 * CONTENT READABILITY DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced readability assessment and text analysis
 * Part of Content Analyzer Combined Approach (21st Implementation)
 * 
 * Capabilities:
 * - Flesch-Kincaid readability scoring
 * - SMOG Index and Gunning Fog Index calculation
 * - Automated Readability Index (ARI) assessment
 * - Coleman-Liau Index evaluation
 * - Sentence complexity and variety analysis
 * - Typography and formatting readability
 * 
 * @version 1.0.0
 * @author Development Team  
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ContentReadabilityDetector {
  constructor(options = {}) {
    this.options = {
      // Readability Analysis Configuration
      enableFleschKincaid: options.enableFleschKincaid !== false,
      enableSMOGIndex: options.enableSMOGIndex !== false,
      enableGunningFog: options.enableGunningFog !== false,
      enableARI: options.enableARI !== false,
      enableColemanLiau: options.enableColemanLiau !== false,
      enableTypographyAnalysis: options.enableTypographyAnalysis !== false,
      
      // Readability Targets
      targetFleschScore: options.targetFleschScore || 70,
      targetGradeLevel: options.targetGradeLevel || 8,
      maxSentenceLength: options.maxSentenceLength || 20,
      maxParagraphLength: options.maxParagraphLength || 150,
      
      // Text Analysis Parameters
      enableSentenceVariety: options.enableSentenceVariety !== false,
      enableWordComplexity: options.enableWordComplexity !== false,
      enablePassiveVoice: options.enablePassiveVoice !== false,
      
      ...options
    };

    this.detectorType = 'content_readability';
    this.version = '1.0.0';
    
    // Readability assessment patterns
    this.readabilityPatterns = {
      sentence_endings: /[.!?]+/g,
      word_boundaries: /\s+/g,
      syllable_count: /[aeiouAEIOU]/g,
      complex_words: /\b\w{7,}\b/g,
      passive_voice: /\b(is|are|was|were|been|being)\s+\w*ed\b/gi,
      transition_words: /\b(however|therefore|furthermore|moreover|consequently|meanwhile|nevertheless|nonetheless)\b/gi,
      difficult_words: /\b(consequently|nevertheless|furthermore|therefore|however|although|meanwhile|moreover)\b/gi
    };
    
    // Typography and formatting patterns
    this.typographyPatterns = {
      all_caps: /\b[A-Z]{3,}\b/g,
      excessive_punctuation: /[!?]{2,}/g,
      long_lines: /.{80,}/g,
      bullet_points: /^\s*[•\-\*]\s/gm,
      numbered_lists: /^\s*\d+\.\s/gm
    };

    // Readability scoring thresholds
    this.readabilityThresholds = {
      flesch: {
        'very_easy': 90,
        'easy': 80,
        'fairly_easy': 70,
        'standard': 60,
        'fairly_difficult': 50,
        'difficult': 30,
        'very_difficult': 0
      },
      grade_level: {
        'elementary': 6,
        'middle_school': 9,
        'high_school': 12,
        'college': 16,
        'graduate': 18
      }
    };

    console.log('📖 Content Readability Detector initialized');
    console.log(`📊 Flesch-Kincaid: ${this.options.enableFleschKincaid ? 'Enabled' : 'Disabled'}`);
    console.log(`🎯 Target Grade Level: ${this.options.targetGradeLevel}`);
    console.log(`📝 Typography Analysis: ${this.options.enableTypographyAnalysis ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Main detection method for readability analysis
   */
  async detect(context, configuration) {
    const startTime = Date.now();
    
    try {
      console.log('📖 Analyzing content readability...');
      
      const { document } = context;
      if (!document) {
        throw new Error('Document is required for readability analysis');
      }

      // Extract and prepare text content
      const textContent = this.extractTextContent(document);
      const textMetrics = this.calculateBasicTextMetrics(textContent);
      
      // Phase 1: Flesch-Kincaid Readability Analysis
      const fleschAnalysis = await this.analyzeFleschKincaid(textContent, textMetrics);
      
      // Phase 2: SMOG Index Analysis
      const smogAnalysis = await this.analyzeSMOGIndex(textContent, textMetrics);
      
      // Phase 3: Gunning Fog Index Analysis
      const gunningFogAnalysis = await this.analyzeGunningFog(textContent, textMetrics);
      
      // Phase 4: Automated Readability Index
      const ariAnalysis = await this.analyzeARI(textContent, textMetrics);
      
      // Phase 5: Coleman-Liau Index
      const colemanLiauAnalysis = await this.analyzeColemanLiau(textContent, textMetrics);
      
      // Phase 6: Sentence Structure Analysis
      const sentenceAnalysis = await this.analyzeSentenceStructure(textContent, document);
      
      // Phase 7: Typography and Formatting Analysis
      const typographyAnalysis = await this.analyzeTypography(textContent, document);
      
      // Phase 8: Overall Readability Assessment
      const readabilityAssessment = await this.assessOverallReadability({
        flesch: fleschAnalysis,
        smog: smogAnalysis,
        gunningFog: gunningFogAnalysis,
        ari: ariAnalysis,
        colemanLiau: colemanLiauAnalysis,
        sentence: sentenceAnalysis,
        typography: typographyAnalysis,
        metrics: textMetrics
      });
      
      const endTime = Date.now();
      
      return {
        detector: this.detectorType,
        version: this.version,
        timestamp: new Date().toISOString(),
        processing_time: endTime - startTime,
        
        // Text Metrics
        text_metrics: textMetrics,
        
        // Readability Analysis Results
        flesch_kincaid: fleschAnalysis,
        smog_index: smogAnalysis,
        gunning_fog: gunningFogAnalysis,
        automated_readability_index: ariAnalysis,
        coleman_liau: colemanLiauAnalysis,
        sentence_analysis: sentenceAnalysis,
        typography_analysis: typographyAnalysis,
        
        // Overall Assessment
        readability_assessment: readabilityAssessment,
        
        // Readability Score
        readability_score: readabilityAssessment.overall_score,
        
        // Key Readability Metrics
        readability_metrics: {
          flesch_score: fleschAnalysis.flesch_score,
          grade_level: readabilityAssessment.consensus_grade_level,
          reading_ease: fleschAnalysis.reading_ease_level,
          avg_sentence_length: textMetrics.average_sentence_length,
          avg_syllables_per_word: textMetrics.average_syllables_per_word,
          complex_word_ratio: textMetrics.complex_word_ratio,
          passive_voice_ratio: sentenceAnalysis.passive_voice_ratio
        },
        
        // Readability Insights
        readability_insights: this.generateReadabilityInsights(readabilityAssessment),
        
        // Improvement Suggestions
        improvement_suggestions: this.generateImprovementSuggestions(readabilityAssessment),
        
        // Accessibility Recommendations
        accessibility_recommendations: this.generateAccessibilityRecommendations({
          typography: typographyAnalysis,
          sentence: sentenceAnalysis,
          readability: readabilityAssessment
        })
      };
      
    } catch (error) {
      console.error('❌ Content readability detection failed:', error);
      return this.handleDetectionError(error);
    }
  }

  /**
   * Extract clean text content for analysis
   */
  extractTextContent(document) {
    // Remove script, style, and non-content elements
    const elementsToRemove = document.querySelectorAll('script, style, noscript, nav, header, footer, aside');
    elementsToRemove.forEach(element => element.remove());
    
    // Focus on main content areas
    const contentSelectors = [
      'main', 'article', '[role="main"]', '.content', '.post-content', 
      '.entry-content', '.article-content', '.page-content', '.text-content'
    ];
    
    let textContent = '';
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        textContent = element.textContent || '';
        break;
      }
    }
    
    // Fallback to body content
    if (!textContent && document.body) {
      textContent = document.body.textContent || '';
    }
    
    // Clean up the text
    textContent = textContent
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n+/g, ' ')  // Remove line breaks
      .trim();
    
    return textContent;
  }

  /**
   * Calculate basic text metrics
   */
  calculateBasicTextMetrics(text) {
    const metrics = {
      character_count: text.length,
      character_count_no_spaces: text.replace(/\s/g, '').length,
      word_count: 0,
      sentence_count: 0,
      paragraph_count: 0,
      syllable_count: 0,
      complex_word_count: 0,
      average_sentence_length: 0,
      average_word_length: 0,
      average_syllables_per_word: 0,
      complex_word_ratio: 0
    };
    
    // Count words
    const words = text.split(this.readabilityPatterns.word_boundaries).filter(word => word.length > 0);
    metrics.word_count = words.length;
    
    // Count sentences
    const sentences = text.split(this.readabilityPatterns.sentence_endings).filter(sentence => sentence.trim().length > 0);
    metrics.sentence_count = sentences.length;
    
    // Count paragraphs (estimated based on double line breaks)
    metrics.paragraph_count = Math.max(1, text.split(/\n\s*\n/).length);
    
    // Count syllables and complex words
    words.forEach(word => {
      const syllables = this.countSyllables(word);
      metrics.syllable_count += syllables;
      
      if (syllables >= 3 || word.length >= 7) {
        metrics.complex_word_count++;
      }
    });
    
    // Calculate averages
    if (metrics.sentence_count > 0) {
      metrics.average_sentence_length = Math.round(metrics.word_count / metrics.sentence_count * 10) / 10;
    }
    
    if (metrics.word_count > 0) {
      metrics.average_word_length = Math.round(metrics.character_count_no_spaces / metrics.word_count * 10) / 10;
      metrics.average_syllables_per_word = Math.round(metrics.syllable_count / metrics.word_count * 10) / 10;
      metrics.complex_word_ratio = Math.round((metrics.complex_word_count / metrics.word_count) * 100);
    }
    
    return metrics;
  }

  /**
   * Count syllables in a word
   */
  countSyllables(word) {
    word = word.toLowerCase();
    
    // Remove punctuation
    word = word.replace(/[^\w]/g, '');
    
    if (word.length === 0) return 0;
    if (word.length <= 3) return 1;
    
    // Count vowel groups
    let syllables = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = /[aeiouAEIOU]/.test(word[i]);
      
      if (isVowel && !previousWasVowel) {
        syllables++;
      }
      
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    // Adjust for le ending
    if (word.endsWith('le') && syllables > 1 && /[^aeiouAEIOU]/.test(word[word.length - 3])) {
      syllables++;
    }
    
    return Math.max(1, syllables);
  }

  /**
   * Phase 1: Analyze Flesch-Kincaid readability
   */
  async analyzeFleschKincaid(text, metrics) {
    const analysis = {
      category: 'Flesch-Kincaid Analysis',
      flesch_score: 0,
      flesch_kincaid_grade: 0,
      reading_ease_level: 'unknown'
    };
    
    try {
      if (metrics.sentence_count > 0 && metrics.word_count > 0) {
        // Flesch Reading Ease Score
        analysis.flesch_score = Math.round(
          206.835 - 
          (1.015 * metrics.average_sentence_length) - 
          (84.6 * metrics.average_syllables_per_word)
        );
        
        // Flesch-Kincaid Grade Level
        analysis.flesch_kincaid_grade = Math.round(
          (0.39 * metrics.average_sentence_length) + 
          (11.8 * metrics.average_syllables_per_word) - 
          15.59
        );
        
        // Determine reading ease level
        analysis.reading_ease_level = this.getFleschReadingEaseLevel(analysis.flesch_score);
      }
      
      analysis.interpretation = this.interpretFleschKincaid(analysis);
      
    } catch (error) {
      console.error('Flesch-Kincaid analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 2: Analyze SMOG Index
   */
  async analyzeSMOGIndex(text, metrics) {
    const analysis = {
      category: 'SMOG Index Analysis',
      smog_index: 0,
      polysyllable_count: 0
    };
    
    try {
      // Count polysyllabic words (3+ syllables)
      const words = text.split(this.readabilityPatterns.word_boundaries).filter(word => word.length > 0);
      
      words.forEach(word => {
        if (this.countSyllables(word) >= 3) {
          analysis.polysyllable_count++;
        }
      });
      
      // SMOG Index calculation
      if (metrics.sentence_count >= 30) {
        analysis.smog_index = Math.round(
          1.043 * Math.sqrt(analysis.polysyllable_count * (30 / metrics.sentence_count)) + 3.1291
        );
      } else {
        // Simplified SMOG for shorter texts
        analysis.smog_index = Math.round(
          Math.sqrt(analysis.polysyllable_count) + 3
        );
      }
      
      analysis.interpretation = this.interpretSMOG(analysis);
      
    } catch (error) {
      console.error('SMOG analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 3: Analyze Gunning Fog Index
   */
  async analyzeGunningFog(text, metrics) {
    const analysis = {
      category: 'Gunning Fog Analysis',
      gunning_fog_index: 0,
      complex_word_percentage: 0
    };
    
    try {
      if (metrics.sentence_count > 0 && metrics.word_count > 0) {
        analysis.complex_word_percentage = metrics.complex_word_ratio;
        
        // Gunning Fog Index
        analysis.gunning_fog_index = Math.round(
          0.4 * (metrics.average_sentence_length + analysis.complex_word_percentage)
        );
      }
      
      analysis.interpretation = this.interpretGunningFog(analysis);
      
    } catch (error) {
      console.error('Gunning Fog analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 4: Analyze Automated Readability Index
   */
  async analyzeARI(text, metrics) {
    const analysis = {
      category: 'Automated Readability Index',
      ari_score: 0,
      grade_level: 0
    };
    
    try {
      if (metrics.sentence_count > 0 && metrics.word_count > 0) {
        // ARI calculation
        analysis.ari_score = Math.round(
          (4.71 * (metrics.character_count_no_spaces / metrics.word_count)) + 
          (0.5 * (metrics.word_count / metrics.sentence_count)) - 
          21.43
        );
        
        analysis.grade_level = Math.max(1, analysis.ari_score);
      }
      
      analysis.interpretation = this.interpretARI(analysis);
      
    } catch (error) {
      console.error('ARI analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 5: Analyze Coleman-Liau Index
   */
  async analyzeColemanLiau(text, metrics) {
    const analysis = {
      category: 'Coleman-Liau Analysis',
      coleman_liau_index: 0,
      grade_level: 0
    };
    
    try {
      if (metrics.word_count > 0) {
        // Calculate letters per 100 words and sentences per 100 words
        const lettersper100words = (metrics.character_count_no_spaces / metrics.word_count) * 100;
        const sentencesPer100words = (metrics.sentence_count / metrics.word_count) * 100;
        
        // Coleman-Liau Index
        analysis.coleman_liau_index = Math.round(
          (0.0588 * lettersper100words) - 
          (0.296 * sentencesPer100words) - 
          15.8
        );
        
        analysis.grade_level = Math.max(1, analysis.coleman_liau_index);
      }
      
      analysis.interpretation = this.interpretColemanLiau(analysis);
      
    } catch (error) {
      console.error('Coleman-Liau analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 6: Analyze sentence structure
   */
  async analyzeSentenceStructure(text, document) {
    const analysis = {
      category: 'Sentence Structure',
      sentence_variety: {},
      complexity_analysis: {},
      passive_voice_analysis: {}
    };
    
    try {
      const sentences = text.split(this.readabilityPatterns.sentence_endings).filter(s => s.trim().length > 0);
      
      // Sentence length variety
      analysis.sentence_variety = this.analyzeSentenceVariety(sentences);
      
      // Complexity analysis
      analysis.complexity_analysis = this.analyzeSentenceComplexity(sentences);
      
      // Passive voice analysis
      analysis.passive_voice_analysis = this.analyzePassiveVoice(text);
      
      // Transition words usage
      analysis.transition_usage = this.analyzeTransitionUsage(text);
      
      // Calculate passive voice ratio
      analysis.passive_voice_ratio = analysis.passive_voice_analysis.passive_count > 0 ?
        Math.round((analysis.passive_voice_analysis.passive_count / sentences.length) * 100) : 0;
      
    } catch (error) {
      console.error('Sentence structure analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 7: Analyze typography and formatting
   */
  async analyzeTypography(text, document) {
    const analysis = {
      category: 'Typography Analysis',
      formatting_issues: {},
      readability_enhancements: {},
      visual_structure: {}
    };
    
    try {
      // Formatting issues
      analysis.formatting_issues = this.detectFormattingIssues(text);
      
      // Readability enhancements
      analysis.readability_enhancements = this.analyzeReadabilityEnhancements(document);
      
      // Visual structure
      analysis.visual_structure = this.analyzeVisualStructure(document);
      
      // Line length analysis
      analysis.line_length_analysis = this.analyzeLineLength(text);
      
    } catch (error) {
      console.error('Typography analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 8: Assess overall readability
   */
  async assessOverallReadability(analyses) {
    const assessment = {
      category: 'Overall Readability Assessment',
      readability_scores: {},
      consensus_analysis: {},
      target_audience: {}
    };
    
    try {
      // Collect all readability scores
      assessment.readability_scores = {
        flesch_score: analyses.flesch?.flesch_score || 0,
        flesch_kincaid_grade: analyses.flesch?.flesch_kincaid_grade || 0,
        smog_index: analyses.smog?.smog_index || 0,
        gunning_fog: analyses.gunningFog?.gunning_fog_index || 0,
        ari_score: analyses.ari?.ari_score || 0,
        coleman_liau: analyses.colemanLiau?.coleman_liau_index || 0
      };
      
      // Calculate consensus metrics
      assessment.consensus_analysis = this.calculateConsensusMetrics(assessment.readability_scores);
      
      // Determine target audience
      assessment.target_audience = this.determineTargetAudience(assessment.consensus_analysis);
      
      // Calculate overall readability score
      assessment.overall_score = this.calculateOverallReadabilityScore(analyses);
      
      // Grade level consensus
      assessment.consensus_grade_level = this.calculateConsensusGradeLevel(assessment.readability_scores);
      
      // Readability classification
      assessment.readability_classification = this.classifyReadability(assessment.overall_score);
      
    } catch (error) {
      console.error('Overall readability assessment failed:', error);
      assessment.error = error.message;
    }
    
    return assessment;
  }

  /**
   * Get Flesch Reading Ease level
   */
  getFleschReadingEaseLevel(score) {
    for (const [level, threshold] of Object.entries(this.readabilityThresholds.flesch)) {
      if (score >= threshold) {
        return level;
      }
    }
    return 'very_difficult';
  }

  /**
   * Interpret Flesch-Kincaid results
   */
  interpretFleschKincaid(analysis) {
    return {
      ease_description: this.getReadingEaseDescription(analysis.reading_ease_level),
      grade_description: this.getGradeLevelDescription(analysis.flesch_kincaid_grade),
      recommendation: this.getFleschRecommendation(analysis.flesch_score, analysis.flesch_kincaid_grade)
    };
  }

  /**
   * Get reading ease description
   */
  getReadingEaseDescription(level) {
    const descriptions = {
      'very_easy': 'Very easy to read - suitable for 5th grade and below',
      'easy': 'Easy to read - suitable for 6th grade level',
      'fairly_easy': 'Fairly easy to read - suitable for 7th grade level',
      'standard': 'Standard reading level - suitable for 8th-9th grade',
      'fairly_difficult': 'Fairly difficult - suitable for 10th-12th grade',
      'difficult': 'Difficult - suitable for college level',
      'very_difficult': 'Very difficult - suitable for graduate level'
    };
    
    return descriptions[level] || 'Unknown reading level';
  }

  /**
   * Get grade level description
   */
  getGradeLevelDescription(grade) {
    if (grade <= 6) return 'Elementary school level';
    if (grade <= 9) return 'Middle school level';
    if (grade <= 12) return 'High school level';
    if (grade <= 16) return 'College level';
    return 'Graduate school level';
  }

  /**
   * Get Flesch recommendation
   */
  getFleschRecommendation(fleschScore, gradeLevel) {
    if (fleschScore < 50 || gradeLevel > 12) {
      return 'Consider simplifying sentences and using shorter words for broader accessibility';
    } else if (fleschScore > 80) {
      return 'Text is very accessible - good for general audiences';
    }
    return 'Readability is appropriate for most audiences';
  }

  /**
   * Interpret SMOG results
   */
  interpretSMOG(analysis) {
    return {
      description: `Requires ${analysis.smog_index} years of education to understand`,
      audience: analysis.smog_index <= 8 ? 'General public' : 
               analysis.smog_index <= 12 ? 'High school graduates' : 'College-educated readers',
      recommendation: analysis.smog_index > 12 ? 'Consider reducing polysyllabic words' : 'Good readability level'
    };
  }

  /**
   * Interpret Gunning Fog results
   */
  interpretGunningFog(analysis) {
    return {
      description: `Requires ${analysis.gunning_fog_index} years of formal education`,
      complexity: analysis.gunning_fog_index <= 8 ? 'Simple' :
                 analysis.gunning_fog_index <= 12 ? 'Moderate' : 'Complex',
      recommendation: analysis.gunning_fog_index > 14 ? 'Simplify complex sentences' : 'Appropriate complexity'
    };
  }

  /**
   * Interpret ARI results
   */
  interpretARI(analysis) {
    return {
      description: `Grade ${analysis.grade_level} reading level`,
      audience: this.getGradeLevelDescription(analysis.grade_level),
      recommendation: analysis.grade_level > 12 ? 'Consider shorter sentences' : 'Good sentence structure'
    };
  }

  /**
   * Interpret Coleman-Liau results
   */
  interpretColemanLiau(analysis) {
    return {
      description: `Grade ${analysis.grade_level} reading level based on character complexity`,
      focus: 'Character and sentence length based assessment',
      recommendation: analysis.grade_level > 12 ? 'Use shorter words and sentences' : 'Appropriate word complexity'
    };
  }

  /**
   * Analyze sentence variety
   */
  analyzeSentenceVariety(sentences) {
    const variety = {
      length_distribution: { short: 0, medium: 0, long: 0, very_long: 0 },
      average_length: 0,
      variety_score: 0
    };
    
    if (sentences.length === 0) return variety;
    
    const lengths = sentences.map(sentence => {
      const wordCount = sentence.split(/\s+/).filter(word => word.length > 0).length;
      return wordCount;
    });
    
    variety.average_length = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    
    // Categorize sentence lengths
    lengths.forEach(length => {
      if (length <= 8) variety.length_distribution.short++;
      else if (length <= 15) variety.length_distribution.medium++;
      else if (length <= 25) variety.length_distribution.long++;
      else variety.length_distribution.very_long++;
    });
    
    // Calculate variety score (coefficient of variation)
    const mean = variety.average_length;
    const variance = lengths.reduce((sum, length) => sum + Math.pow(length - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    variety.variety_score = mean > 0 ? Math.round((stdDev / mean) * 100) : 0;
    
    return variety;
  }

  /**
   * Analyze sentence complexity
   */
  analyzeSentenceComplexity(sentences) {
    const complexity = {
      simple_sentences: 0,
      compound_sentences: 0,
      complex_sentences: 0,
      compound_complex: 0,
      average_clauses: 0
    };
    
    sentences.forEach(sentence => {
      const clauseCount = this.countClauses(sentence);
      
      if (clauseCount === 1) {
        complexity.simple_sentences++;
      } else if (sentence.includes(',') || sentence.includes(';')) {
        if (sentence.match(/\b(and|but|or|nor|for|so|yet)\b/i)) {
          complexity.compound_sentences++;
        } else {
          complexity.complex_sentences++;
        }
      } else {
        complexity.compound_complex++;
      }
    });
    
    const totalClauses = sentences.reduce((sum, sentence) => sum + this.countClauses(sentence), 0);
    complexity.average_clauses = sentences.length > 0 ? Math.round(totalClauses / sentences.length * 10) / 10 : 0;
    
    return complexity;
  }

  /**
   * Count clauses in a sentence (simplified)
   */
  countClauses(sentence) {
    // Simple heuristic: count by conjunctions and punctuation
    const conjunctions = (sentence.match(/\b(and|but|or|because|since|although|while|if|when|where)\b/gi) || []).length;
    const commas = (sentence.match(/,/g) || []).length;
    const semicolons = (sentence.match(/;/g) || []).length;
    
    return Math.max(1, 1 + conjunctions + Math.floor(commas / 2) + semicolons);
  }

  /**
   * Analyze passive voice usage
   */
  analyzePassiveVoice(text) {
    const analysis = {
      passive_count: 0,
      passive_examples: [],
      recommendation: ''
    };
    
    const passiveMatches = text.match(this.readabilityPatterns.passive_voice) || [];
    analysis.passive_count = passiveMatches.length;
    analysis.passive_examples = passiveMatches.slice(0, 3);
    
    const sentenceCount = text.split(this.readabilityPatterns.sentence_endings).filter(s => s.trim().length > 0).length;
    const passiveRatio = sentenceCount > 0 ? (analysis.passive_count / sentenceCount) * 100 : 0;
    
    if (passiveRatio > 25) {
      analysis.recommendation = 'Consider using more active voice constructions';
    } else if (passiveRatio < 10) {
      analysis.recommendation = 'Good balance of active voice usage';
    } else {
      analysis.recommendation = 'Reasonable balance of active and passive voice';
    }
    
    return analysis;
  }

  /**
   * Analyze transition words usage
   */
  analyzeTransitionUsage(text) {
    const analysis = {
      transition_count: 0,
      transition_examples: [],
      flow_assessment: ''
    };
    
    const transitionMatches = text.match(this.readabilityPatterns.transition_words) || [];
    analysis.transition_count = transitionMatches.length;
    analysis.transition_examples = [...new Set(transitionMatches)].slice(0, 5);
    
    const sentenceCount = text.split(this.readabilityPatterns.sentence_endings).filter(s => s.trim().length > 0).length;
    const transitionRatio = sentenceCount > 0 ? (analysis.transition_count / sentenceCount) * 100 : 0;
    
    if (transitionRatio < 5) {
      analysis.flow_assessment = 'Consider adding more transition words for better flow';
    } else if (transitionRatio > 20) {
      analysis.flow_assessment = 'May have too many transition words';
    } else {
      analysis.flow_assessment = 'Good use of transition words for text flow';
    }
    
    return analysis;
  }

  /**
   * Detect formatting issues
   */
  detectFormattingIssues(text) {
    const issues = {
      all_caps_count: 0,
      excessive_punctuation: 0,
      formatting_problems: []
    };
    
    // All caps detection
    const allCapsMatches = text.match(this.typographyPatterns.all_caps) || [];
    issues.all_caps_count = allCapsMatches.length;
    
    if (issues.all_caps_count > 0) {
      issues.formatting_problems.push('Excessive use of ALL CAPS detected');
    }
    
    // Excessive punctuation
    const excessivePunctMatches = text.match(this.typographyPatterns.excessive_punctuation) || [];
    issues.excessive_punctuation = excessivePunctMatches.length;
    
    if (issues.excessive_punctuation > 0) {
      issues.formatting_problems.push('Excessive punctuation usage detected');
    }
    
    return issues;
  }

  /**
   * Analyze readability enhancements
   */
  analyzeReadabilityEnhancements(document) {
    const enhancements = {
      has_headings: false,
      has_lists: false,
      has_emphasis: false,
      has_paragraphs: false,
      structure_score: 0
    };
    
    enhancements.has_headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0;
    enhancements.has_lists = document.querySelectorAll('ul, ol').length > 0;
    enhancements.has_emphasis = document.querySelectorAll('strong, b, em, i').length > 0;
    enhancements.has_paragraphs = document.querySelectorAll('p').length > 1;
    
    // Calculate structure score
    let score = 0;
    if (enhancements.has_headings) score += 25;
    if (enhancements.has_lists) score += 20;
    if (enhancements.has_emphasis) score += 15;
    if (enhancements.has_paragraphs) score += 40;
    
    enhancements.structure_score = score;
    
    return enhancements;
  }

  /**
   * Analyze visual structure
   */
  analyzeVisualStructure(document) {
    const structure = {
      paragraph_count: 0,
      average_paragraph_length: 0,
      heading_hierarchy: false,
      white_space_usage: 'unknown'
    };
    
    const paragraphs = document.querySelectorAll('p');
    structure.paragraph_count = paragraphs.length;
    
    if (paragraphs.length > 0) {
      const totalLength = Array.from(paragraphs).reduce((sum, p) => sum + p.textContent.length, 0);
      structure.average_paragraph_length = Math.round(totalLength / paragraphs.length);
    }
    
    // Check heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    structure.heading_hierarchy = headings.length >= 2;
    
    return structure;
  }

  /**
   * Analyze line length
   */
  analyzeLineLength(text) {
    const analysis = {
      long_lines: 0,
      average_line_length: 0,
      line_length_recommendation: ''
    };
    
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length > 0) {
      const totalLength = lines.reduce((sum, line) => sum + line.length, 0);
      analysis.average_line_length = Math.round(totalLength / lines.length);
      
      analysis.long_lines = lines.filter(line => line.length > 80).length;
      
      if (analysis.average_line_length > 80) {
        analysis.line_length_recommendation = 'Consider shorter lines for better readability';
      } else {
        analysis.line_length_recommendation = 'Line length is appropriate for readability';
      }
    }
    
    return analysis;
  }

  /**
   * Calculate consensus metrics
   */
  calculateConsensusMetrics(scores) {
    const metrics = {
      average_grade_level: 0,
      grade_level_range: { min: 0, max: 0 },
      consistency_score: 0
    };
    
    const gradeLevels = [
      scores.flesch_kincaid_grade,
      scores.smog_index,
      scores.gunning_fog,
      scores.ari_score,
      scores.coleman_liau
    ].filter(score => score > 0);
    
    if (gradeLevels.length > 0) {
      metrics.average_grade_level = Math.round(gradeLevels.reduce((a, b) => a + b, 0) / gradeLevels.length);
      metrics.grade_level_range.min = Math.min(...gradeLevels);
      metrics.grade_level_range.max = Math.max(...gradeLevels);
      
      // Calculate consistency (lower variance = higher consistency)
      const variance = gradeLevels.reduce((sum, level) => {
        return sum + Math.pow(level - metrics.average_grade_level, 2);
      }, 0) / gradeLevels.length;
      
      metrics.consistency_score = Math.max(0, 100 - (variance * 10));
    }
    
    return metrics;
  }

  /**
   * Determine target audience
   */
  determineTargetAudience(consensus) {
    const gradeLevel = consensus.average_grade_level;
    
    if (gradeLevel <= 6) return 'Elementary school children and general public';
    if (gradeLevel <= 9) return 'Middle school students and general readers';
    if (gradeLevel <= 12) return 'High school students and average adults';
    if (gradeLevel <= 16) return 'College students and educated adults';
    return 'Graduate students and academic professionals';
  }

  /**
   * Calculate overall readability score
   */
  calculateOverallReadabilityScore(analyses) {
    let score = 70; // Base score
    
    // Flesch score influence
    if (analyses.flesch?.flesch_score) {
      const fleschScore = analyses.flesch.flesch_score;
      if (fleschScore >= 70) score += 15;
      else if (fleschScore >= 50) score += 5;
      else score -= 10;
    }
    
    // Grade level influence
    const avgGradeLevel = analyses.flesch?.flesch_kincaid_grade || 12;
    if (avgGradeLevel <= 8) score += 10;
    else if (avgGradeLevel > 14) score -= 15;
    
    // Sentence variety bonus
    if (analyses.sentence?.sentence_variety?.variety_score > 20) {
      score += 5;
    }
    
    // Passive voice penalty
    if (analyses.sentence?.passive_voice_ratio > 30) {
      score -= 10;
    }
    
    // Typography bonus
    if (analyses.typography?.readability_enhancements?.structure_score > 60) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate consensus grade level
   */
  calculateConsensusGradeLevel(scores) {
    const validScores = Object.values(scores).filter(score => score > 0 && score < 30);
    return validScores.length > 0 ? 
      Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 12;
  }

  /**
   * Classify readability
   */
  classifyReadability(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very_good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 50) return 'poor';
    return 'very_poor';
  }

  /**
   * Generate readability insights
   */
  generateReadabilityInsights(assessment) {
    const insights = [];
    
    if (assessment.overall_score >= 80) {
      insights.push({
        type: 'positive',
        message: 'Content has excellent readability for target audience',
        impact: 'high'
      });
    }
    
    if (assessment.consensus_grade_level > 12) {
      insights.push({
        type: 'improvement',
        message: 'Content may be too complex for general audiences',
        impact: 'medium'
      });
    }
    
    if (assessment.readability_classification === 'poor' || assessment.readability_classification === 'very_poor') {
      insights.push({
        type: 'critical',
        message: 'Readability issues may significantly impact user comprehension',
        impact: 'high'
      });
    }
    
    return insights;
  }

  /**
   * Generate improvement suggestions
   */
  generateImprovementSuggestions(assessment) {
    const suggestions = [];
    
    if (assessment.consensus_grade_level > this.options.targetGradeLevel) {
      suggestions.push({
        category: 'sentence_structure',
        priority: 'high',
        action: 'Shorten sentences and reduce complex words',
        expected_impact: 'Significant readability improvement'
      });
    }
    
    if (assessment.overall_score < 70) {
      suggestions.push({
        category: 'general_readability',
        priority: 'medium',
        action: 'Improve overall text clarity and flow',
        expected_impact: 'Better user comprehension'
      });
    }
    
    return suggestions;
  }

  /**
   * Generate accessibility recommendations
   */
  generateAccessibilityRecommendations({ typography, sentence, readability }) {
    const recommendations = [];
    
    if (typography?.formatting_issues?.all_caps_count > 0) {
      recommendations.push({
        category: 'typography',
        issue: 'Excessive use of capital letters',
        recommendation: 'Use emphasis tags instead of ALL CAPS',
        accessibility_impact: 'Screen readers may interpret as shouting'
      });
    }
    
    if (sentence?.passive_voice_ratio > 30) {
      recommendations.push({
        category: 'sentence_structure',
        issue: 'High passive voice usage',
        recommendation: 'Convert to active voice where possible',
        accessibility_impact: 'Clearer for cognitive accessibility'
      });
    }
    
    if (readability?.consensus_grade_level > 14) {
      recommendations.push({
        category: 'complexity',
        issue: 'Content too complex for general audience',
        recommendation: 'Simplify vocabulary and sentence structure',
        accessibility_impact: 'Better comprehension for diverse audiences'
      });
    }
    
    return recommendations;
  }

  /**
   * Handle detection errors
   */
  handleDetectionError(error) {
    return {
      success: false,
      error: error.message,
      detector: this.detectorType,
      version: this.version,
      timestamp: new Date().toISOString(),
      fallback_data: {
        readability_score: 0,
        readability_metrics: {
          flesch_score: 0,
          grade_level: 12,
          reading_ease: 'unknown',
          avg_sentence_length: 0,
          avg_syllables_per_word: 0,
          complex_word_ratio: 0,
          passive_voice_ratio: 0
        }
      }
    };
  }
}

export default ContentReadabilityDetector;
