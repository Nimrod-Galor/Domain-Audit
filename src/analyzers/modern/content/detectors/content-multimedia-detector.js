/**
 * ============================================================================
 * CONTENT MULTIMEDIA DETECTOR - GPT-5 STYLE MODULAR COMPONENT
 * ============================================================================
 * 
 * Advanced multimedia content analysis and optimization detection
 * Part of Content Analyzer Combined Approach (21st Implementation)
 * 
 * Capabilities:
 * - Image optimization and accessibility analysis
 * - Video content assessment and performance evaluation
 * - Audio content detection and quality assessment
 * - Interactive media and embed analysis
 * - File size and loading performance optimization
 * - Alt text and caption quality evaluation
 * 
 * @version 1.0.0
 * @author Development Team  
 * @integration GPT-5 Style Detector
 * @created 2025-08-13
 */

export class ContentMultimediaDetector {
  constructor(options = {}) {
    this.options = {
      // Multimedia Analysis Configuration
      enableImageAnalysis: options.enableImageAnalysis !== false,
      enableVideoAnalysis: options.enableVideoAnalysis !== false,
      enableAudioAnalysis: options.enableAudioAnalysis !== false,
      enableInteractiveAnalysis: options.enableInteractiveAnalysis !== false,
      enablePerformanceAnalysis: options.enablePerformanceAnalysis !== false,
      enableAccessibilityAnalysis: options.enableAccessibilityAnalysis !== false,
      
      // Performance Thresholds
      maxImageSize: options.maxImageSize || 500, // KB
      idealImageSize: options.idealImageSize || 100, // KB
      maxVideoSize: options.maxVideoSize || 50000, // KB (50MB)
      minImageWidth: options.minImageWidth || 300,
      minImageHeight: options.minImageHeight || 200,
      
      // Quality Standards
      requireAltText: options.requireAltText !== false,
      requireCaptions: options.requireCaptions !== false,
      preferWebP: options.preferWebP !== false,
      preferLazyLoading: options.preferLazyLoading !== false,
      
      ...options
    };

    this.detectorType = 'content_multimedia';
    this.version = '1.0.0';
    
    // Multimedia format patterns
    this.formatPatterns = {
      image_formats: /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i,
      video_formats: /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i,
      audio_formats: /\.(mp3|wav|ogg|aac|m4a|flac)$/i,
      modern_formats: /\.(webp|avif|webm)$/i,
      legacy_formats: /\.(bmp|tiff|gif)$/i
    };
    
    // Multimedia optimization indicators
    this.optimizationIndicators = {
      lazy_loading: /loading=["']lazy["']/i,
      responsive_images: /srcset|sizes/i,
      modern_video: /\.(webm|av1)$/i,
      compression: /quality|compress|optimiz/i,
      cdn_patterns: /cloudinary|imgur|cdn|imagekit/i
    };

    // Accessibility patterns
    this.accessibilityPatterns = {
      descriptive_alt: /\b(shows|displays|depicts|illustrates|contains|features)\b/i,
      generic_alt: /\b(image|picture|photo|graphic|icon|logo)\b/i,
      caption_indicators: /\b(caption|subtitle|transcript|description)\b/i,
      aria_labels: /aria-label|aria-describedby|aria-labelledby/i
    };

    // Content scoring weights
    this.multimediaWeights = {
      image_optimization: 25,
      video_optimization: 20,
      accessibility: 20,
      performance: 15,
      modern_formats: 10,
      interactive_media: 10
    };

    console.log('🎬 Content Multimedia Detector initialized');
    console.log(`🖼️ Image Analysis: ${this.options.enableImageAnalysis ? 'Enabled' : 'Disabled'}`);
    console.log(`🎥 Video Analysis: ${this.options.enableVideoAnalysis ? 'Enabled' : 'Disabled'}`);
    console.log(`♿ Accessibility Analysis: ${this.options.enableAccessibilityAnalysis ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Main detection method for multimedia content analysis
   */
  async detect(context, configuration) {
    const startTime = Date.now();
    
    try {
      console.log('🎬 Analyzing content multimedia...');
      
      const { document } = context;
      if (!document) {
        throw new Error('Document is required for multimedia content analysis');
      }

      // Phase 1: Image Content Analysis
      const imageAnalysis = await this.analyzeImageContent(document);
      
      // Phase 2: Video Content Analysis
      const videoAnalysis = await this.analyzeVideoContent(document);
      
      // Phase 3: Audio Content Analysis
      const audioAnalysis = await this.analyzeAudioContent(document);
      
      // Phase 4: Interactive Media Analysis
      const interactiveAnalysis = await this.analyzeInteractiveMedia(document);
      
      // Phase 5: Multimedia Performance Analysis
      const performanceAnalysis = await this.analyzeMultimediaPerformance(document);
      
      // Phase 6: Accessibility Analysis
      const accessibilityAnalysis = await this.analyzeMultimediaAccessibility(document);
      
      // Phase 7: Format Optimization Analysis
      const formatAnalysis = await this.analyzeFormatOptimization(document);
      
      // Phase 8: Overall Multimedia Assessment
      const multimediaAssessment = await this.assessOverallMultimedia({
        images: imageAnalysis,
        videos: videoAnalysis,
        audio: audioAnalysis,
        interactive: interactiveAnalysis,
        performance: performanceAnalysis,
        accessibility: accessibilityAnalysis,
        formats: formatAnalysis
      });
      
      const endTime = Date.now();
      
      return {
        detector: this.detectorType,
        version: this.version,
        timestamp: new Date().toISOString(),
        processing_time: endTime - startTime,
        
        // Multimedia Analysis Results
        image_analysis: imageAnalysis,
        video_analysis: videoAnalysis,
        audio_analysis: audioAnalysis,
        interactive_analysis: interactiveAnalysis,
        performance_analysis: performanceAnalysis,
        accessibility_analysis: accessibilityAnalysis,
        format_analysis: formatAnalysis,
        
        // Overall Assessment
        multimedia_assessment: multimediaAssessment,
        
        // Multimedia Score
        multimedia_score: multimediaAssessment.overall_score,
        
        // Key Multimedia Metrics
        multimedia_metrics: {
          total_images: imageAnalysis.total_images,
          total_videos: videoAnalysis.total_videos,
          total_audio: audioAnalysis.total_audio,
          images_with_alt: accessibilityAnalysis.images_with_alt,
          optimized_images: formatAnalysis.optimized_images,
          modern_formats: formatAnalysis.modern_format_count,
          performance_score: performanceAnalysis.performance_score,
          accessibility_score: accessibilityAnalysis.accessibility_score
        },
        
        // Multimedia Insights
        multimedia_insights: this.generateMultimediaInsights(multimediaAssessment),
        
        // Optimization Recommendations
        optimization_recommendations: this.generateOptimizationRecommendations(multimediaAssessment),
        
        // Performance Issues
        performance_issues: this.identifyPerformanceIssues({
          images: imageAnalysis,
          videos: videoAnalysis,
          performance: performanceAnalysis
        })
      };
      
    } catch (error) {
      console.error('❌ Content multimedia detection failed:', error);
      return this.handleDetectionError(error);
    }
  }

  /**
   * Phase 1: Analyze image content
   */
  async analyzeImageContent(document) {
    const analysis = {
      category: 'Image Content',
      image_inventory: [],
      format_distribution: {},
      size_analysis: {},
      optimization_status: {}
    };
    
    try {
      const images = document.querySelectorAll('img');
      analysis.total_images = images.length;
      
      // Image inventory
      analysis.image_inventory = this.createImageInventory(images);
      
      // Format distribution
      analysis.format_distribution = this.analyzeImageFormats(images);
      
      // Size analysis
      analysis.size_analysis = this.analyzeImageSizes(images);
      
      // Optimization status
      analysis.optimization_status = this.assessImageOptimization(images);
      
      // Image quality score
      analysis.image_score = this.calculateImageScore(
        analysis.format_distribution,
        analysis.size_analysis,
        analysis.optimization_status
      );
      
    } catch (error) {
      console.error('Image content analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 2: Analyze video content
   */
  async analyzeVideoContent(document) {
    const analysis = {
      category: 'Video Content',
      video_inventory: [],
      video_sources: {},
      optimization_features: {},
      accessibility_features: {}
    };
    
    try {
      const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"]');
      analysis.total_videos = videos.length;
      
      // Video inventory
      analysis.video_inventory = this.createVideoInventory(videos);
      
      // Video sources analysis
      analysis.video_sources = this.analyzeVideoSources(videos);
      
      // Optimization features
      analysis.optimization_features = this.analyzeVideoOptimization(videos);
      
      // Accessibility features
      analysis.accessibility_features = this.analyzeVideoAccessibility(videos);
      
      // Video quality score
      analysis.video_score = this.calculateVideoScore(
        analysis.video_sources,
        analysis.optimization_features,
        analysis.accessibility_features
      );
      
    } catch (error) {
      console.error('Video content analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 3: Analyze audio content
   */
  async analyzeAudioContent(document) {
    const analysis = {
      category: 'Audio Content',
      audio_inventory: [],
      format_analysis: {},
      controls_analysis: {},
      accessibility_features: {}
    };
    
    try {
      const audioElements = document.querySelectorAll('audio, embed[type*="audio"], object[type*="audio"]');
      analysis.total_audio = audioElements.length;
      
      // Audio inventory
      analysis.audio_inventory = this.createAudioInventory(audioElements);
      
      // Format analysis
      analysis.format_analysis = this.analyzeAudioFormats(audioElements);
      
      // Controls analysis
      analysis.controls_analysis = this.analyzeAudioControls(audioElements);
      
      // Accessibility features
      analysis.accessibility_features = this.analyzeAudioAccessibility(audioElements);
      
      // Audio quality score
      analysis.audio_score = this.calculateAudioScore(
        analysis.format_analysis,
        analysis.controls_analysis,
        analysis.accessibility_features
      );
      
    } catch (error) {
      console.error('Audio content analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 4: Analyze interactive media
   */
  async analyzeInteractiveMedia(document) {
    const analysis = {
      category: 'Interactive Media',
      interactive_elements: [],
      embed_analysis: {},
      canvas_analysis: {},
      svg_analysis: {}
    };
    
    try {
      // Interactive elements
      const interactiveElements = document.querySelectorAll('canvas, svg, embed, object, iframe');
      analysis.total_interactive = interactiveElements.length;
      
      // Interactive inventory
      analysis.interactive_elements = this.createInteractiveInventory(interactiveElements);
      
      // Embed analysis
      analysis.embed_analysis = this.analyzeEmbeds(document.querySelectorAll('iframe, embed, object'));
      
      // Canvas analysis
      analysis.canvas_analysis = this.analyzeCanvas(document.querySelectorAll('canvas'));
      
      // SVG analysis
      analysis.svg_analysis = this.analyzeSVG(document.querySelectorAll('svg'));
      
      // Interactive score
      analysis.interactive_score = this.calculateInteractiveScore(
        analysis.embed_analysis,
        analysis.canvas_analysis,
        analysis.svg_analysis
      );
      
    } catch (error) {
      console.error('Interactive media analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 5: Analyze multimedia performance
   */
  async analyzeMultimediaPerformance(document) {
    const analysis = {
      category: 'Multimedia Performance',
      loading_optimization: {},
      size_optimization: {},
      delivery_optimization: {},
      caching_analysis: {}
    };
    
    try {
      // Loading optimization
      analysis.loading_optimization = this.analyzeLoadingOptimization(document);
      
      // Size optimization
      analysis.size_optimization = this.analyzeSizeOptimization(document);
      
      // Delivery optimization
      analysis.delivery_optimization = this.analyzeDeliveryOptimization(document);
      
      // Caching analysis
      analysis.caching_analysis = this.analyzeCaching(document);
      
      // Performance score
      analysis.performance_score = this.calculatePerformanceScore(
        analysis.loading_optimization,
        analysis.size_optimization,
        analysis.delivery_optimization
      );
      
    } catch (error) {
      console.error('Multimedia performance analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 6: Analyze multimedia accessibility
   */
  async analyzeMultimediaAccessibility(document) {
    const analysis = {
      category: 'Multimedia Accessibility',
      alt_text_analysis: {},
      caption_analysis: {},
      transcript_analysis: {},
      keyboard_navigation: {}
    };
    
    try {
      // Alt text analysis
      analysis.alt_text_analysis = this.analyzeAltText(document);
      
      // Caption analysis
      analysis.caption_analysis = this.analyzeCaptions(document);
      
      // Transcript analysis
      analysis.transcript_analysis = this.analyzeTranscripts(document);
      
      // Keyboard navigation
      analysis.keyboard_navigation = this.analyzeKeyboardNavigation(document);
      
      // Count accessible images
      const images = document.querySelectorAll('img');
      analysis.images_with_alt = Array.from(images).filter(img => 
        img.hasAttribute('alt') && img.getAttribute('alt').trim().length > 0
      ).length;
      
      // Accessibility score
      analysis.accessibility_score = this.calculateAccessibilityScore(
        analysis.alt_text_analysis,
        analysis.caption_analysis,
        analysis.transcript_analysis,
        analysis.keyboard_navigation
      );
      
    } catch (error) {
      console.error('Multimedia accessibility analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 7: Analyze format optimization
   */
  async analyzeFormatOptimization(document) {
    const analysis = {
      category: 'Format Optimization',
      modern_formats: {},
      legacy_formats: {},
      format_recommendations: {},
      compression_analysis: {}
    };
    
    try {
      // Modern formats analysis
      analysis.modern_formats = this.analyzeModernFormats(document);
      
      // Legacy formats analysis
      analysis.legacy_formats = this.analyzeLegacyFormats(document);
      
      // Format recommendations
      analysis.format_recommendations = this.generateFormatRecommendations(document);
      
      // Compression analysis
      analysis.compression_analysis = this.analyzeCompression(document);
      
      // Count optimized images
      const images = document.querySelectorAll('img');
      analysis.optimized_images = Array.from(images).filter(img => {
        const src = img.src || '';
        return this.formatPatterns.modern_formats.test(src);
      }).length;
      
      analysis.modern_format_count = analysis.modern_formats.webp_count + 
                                     analysis.modern_formats.avif_count + 
                                     analysis.modern_formats.webm_count;
      
      // Format optimization score
      analysis.format_score = this.calculateFormatScore(
        analysis.modern_formats,
        analysis.legacy_formats,
        analysis.compression_analysis
      );
      
    } catch (error) {
      console.error('Format optimization analysis failed:', error);
      analysis.error = error.message;
    }
    
    return analysis;
  }

  /**
   * Phase 8: Assess overall multimedia quality
   */
  async assessOverallMultimedia(analyses) {
    const assessment = {
      category: 'Overall Multimedia Assessment',
      component_scores: {},
      multimedia_health: {},
      optimization_opportunities: {}
    };
    
    try {
      // Component scores
      assessment.component_scores = {
        images: analyses.images?.image_score || 0,
        videos: analyses.videos?.video_score || 0,
        audio: analyses.audio?.audio_score || 0,
        interactive: analyses.interactive?.interactive_score || 0,
        performance: analyses.performance?.performance_score || 0,
        accessibility: analyses.accessibility?.accessibility_score || 0,
        formats: analyses.formats?.format_score || 0
      };
      
      // Calculate weighted overall score
      assessment.overall_score = this.calculateWeightedMultimediaScore(assessment.component_scores);
      
      // Multimedia health assessment
      assessment.multimedia_health = this.assessMultimediaHealth(assessment.component_scores);
      
      // Optimization opportunities
      assessment.optimization_opportunities = this.identifyOptimizationOpportunities(assessment.component_scores);
      
      // Classification
      assessment.multimedia_classification = this.classifyMultimediaQuality(assessment.overall_score);
      
      // Priority improvements
      assessment.priority_improvements = this.identifyPriorityImprovements(assessment.component_scores);
      
    } catch (error) {
      console.error('Overall multimedia assessment failed:', error);
      assessment.error = error.message;
    }
    
    return assessment;
  }

  /**
   * Create image inventory
   */
  createImageInventory(images) {
    const inventory = [];
    
    images.forEach((img, index) => {
      const src = img.src || img.getAttribute('data-src') || '';
      const alt = img.getAttribute('alt') || '';
      const width = img.width || img.getAttribute('width') || 0;
      const height = img.height || img.getAttribute('height') || 0;
      
      inventory.push({
        index,
        src: src.substring(0, 100), // Truncate long URLs
        alt: alt.substring(0, 100),
        width: parseInt(width) || 0,
        height: parseInt(height) || 0,
        has_alt: alt.length > 0,
        has_dimensions: width > 0 && height > 0,
        format: this.getImageFormat(src),
        loading: img.getAttribute('loading'),
        srcset: img.hasAttribute('srcset')
      });
    });
    
    return inventory;
  }

  /**
   * Get image format from URL
   */
  getImageFormat(src) {
    const match = src.match(this.formatPatterns.image_formats);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  /**
   * Analyze image formats
   */
  analyzeImageFormats(images) {
    const formats = {
      jpg: 0, jpeg: 0, png: 0, gif: 0, webp: 0, svg: 0, avif: 0, other: 0
    };
    
    images.forEach(img => {
      const src = img.src || '';
      const format = this.getImageFormat(src);
      
      if (formats.hasOwnProperty(format)) {
        formats[format]++;
      } else {
        formats.other++;
      }
    });
    
    return formats;
  }

  /**
   * Analyze image sizes
   */
  analyzeImageSizes(images) {
    const analysis = {
      oversized_images: 0,
      undersized_images: 0,
      well_sized_images: 0,
      missing_dimensions: 0
    };
    
    images.forEach(img => {
      const width = img.width || img.getAttribute('width') || 0;
      const height = img.height || img.getAttribute('height') || 0;
      
      if (!width || !height) {
        analysis.missing_dimensions++;
      } else if (width > 1920 || height > 1080) {
        analysis.oversized_images++;
      } else if (width < this.options.minImageWidth || height < this.options.minImageHeight) {
        analysis.undersized_images++;
      } else {
        analysis.well_sized_images++;
      }
    });
    
    return analysis;
  }

  /**
   * Assess image optimization
   */
  assessImageOptimization(images) {
    const optimization = {
      lazy_loaded: 0,
      responsive: 0,
      modern_format: 0,
      optimized_delivery: 0
    };
    
    images.forEach(img => {
      // Lazy loading
      if (img.getAttribute('loading') === 'lazy') {
        optimization.lazy_loaded++;
      }
      
      // Responsive images
      if (img.hasAttribute('srcset') || img.hasAttribute('sizes')) {
        optimization.responsive++;
      }
      
      // Modern format
      const src = img.src || '';
      if (this.formatPatterns.modern_formats.test(src)) {
        optimization.modern_format++;
      }
      
      // Optimized delivery (CDN patterns)
      if (this.optimizationIndicators.cdn_patterns.test(src)) {
        optimization.optimized_delivery++;
      }
    });
    
    return optimization;
  }

  /**
   * Calculate image score
   */
  calculateImageScore(formats, sizes, optimization) {
    let score = 60; // Base score
    
    const totalImages = Object.values(formats).reduce((a, b) => a + b, 0);
    if (totalImages === 0) return score;
    
    // Format optimization
    const modernFormatRatio = (formats.webp + formats.avif) / totalImages;
    score += Math.min(20, modernFormatRatio * 100);
    
    // Size optimization
    const wellSizedRatio = sizes.well_sized_images / totalImages;
    score += Math.min(15, wellSizedRatio * 15);
    
    // Loading optimization
    const lazyLoadedRatio = optimization.lazy_loaded / totalImages;
    score += Math.min(10, lazyLoadedRatio * 10);
    
    // Responsive images
    const responsiveRatio = optimization.responsive / totalImages;
    score += Math.min(10, responsiveRatio * 10);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Create video inventory
   */
  createVideoInventory(videos) {
    const inventory = [];
    
    videos.forEach((video, index) => {
      const tagName = video.tagName.toLowerCase();
      let src = '';
      let type = 'unknown';
      
      if (tagName === 'video') {
        src = video.src || video.querySelector('source')?.src || '';
        type = 'native';
      } else if (tagName === 'iframe') {
        src = video.src || '';
        if (src.includes('youtube')) type = 'youtube';
        else if (src.includes('vimeo')) type = 'vimeo';
        else type = 'embed';
      }
      
      inventory.push({
        index,
        type,
        src: src.substring(0, 100),
        has_controls: video.hasAttribute('controls'),
        has_autoplay: video.hasAttribute('autoplay'),
        has_poster: video.hasAttribute('poster'),
        width: video.width || video.getAttribute('width') || 0,
        height: video.height || video.getAttribute('height') || 0
      });
    });
    
    return inventory;
  }

  /**
   * Analyze video sources
   */
  analyzeVideoSources(videos) {
    const sources = {
      native_videos: 0,
      youtube_embeds: 0,
      vimeo_embeds: 0,
      other_embeds: 0,
      total_videos: videos.length
    };
    
    videos.forEach(video => {
      const tagName = video.tagName.toLowerCase();
      const src = video.src || '';
      
      if (tagName === 'video') {
        sources.native_videos++;
      } else if (tagName === 'iframe') {
        if (src.includes('youtube')) sources.youtube_embeds++;
        else if (src.includes('vimeo')) sources.vimeo_embeds++;
        else sources.other_embeds++;
      }
    });
    
    return sources;
  }

  /**
   * Analyze video optimization
   */
  analyzeVideoOptimization(videos) {
    const optimization = {
      has_poster: 0,
      has_preload: 0,
      has_dimensions: 0,
      lazy_loading: 0
    };
    
    videos.forEach(video => {
      if (video.hasAttribute('poster')) optimization.has_poster++;
      if (video.hasAttribute('preload')) optimization.has_preload++;
      if (video.getAttribute('loading') === 'lazy') optimization.lazy_loading++;
      
      const width = video.width || video.getAttribute('width');
      const height = video.height || video.getAttribute('height');
      if (width && height) optimization.has_dimensions++;
    });
    
    return optimization;
  }

  /**
   * Analyze video accessibility
   */
  analyzeVideoAccessibility(videos) {
    const accessibility = {
      has_captions: 0,
      has_transcripts: 0,
      has_audio_description: 0,
      keyboard_accessible: 0
    };
    
    videos.forEach(video => {
      // Check for caption tracks
      const tracks = video.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
      if (tracks.length > 0) accessibility.has_captions++;
      
      // Check for transcript links
      const parent = video.parentElement;
      if (parent && parent.textContent.toLowerCase().includes('transcript')) {
        accessibility.has_transcripts++;
      }
      
      // Check for audio description
      const audioTracks = video.querySelectorAll('track[kind="descriptions"]');
      if (audioTracks.length > 0) accessibility.has_audio_description++;
      
      // Keyboard accessibility (basic check)
      if (video.hasAttribute('controls') || video.getAttribute('tabindex') !== '-1') {
        accessibility.keyboard_accessible++;
      }
    });
    
    return accessibility;
  }

  /**
   * Calculate video score
   */
  calculateVideoScore(sources, optimization, accessibility) {
    let score = 70; // Base score
    
    if (sources.total_videos === 0) return score;
    
    // Optimization factors
    const posterRatio = optimization.has_poster / sources.total_videos;
    score += Math.min(10, posterRatio * 10);
    
    const dimensionRatio = optimization.has_dimensions / sources.total_videos;
    score += Math.min(10, dimensionRatio * 10);
    
    // Accessibility factors
    const captionRatio = accessibility.has_captions / sources.total_videos;
    score += Math.min(15, captionRatio * 15);
    
    const keyboardRatio = accessibility.keyboard_accessible / sources.total_videos;
    score += Math.min(5, keyboardRatio * 5);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Create audio inventory
   */
  createAudioInventory(audioElements) {
    const inventory = [];
    
    audioElements.forEach((audio, index) => {
      const src = audio.src || audio.querySelector('source')?.src || '';
      
      inventory.push({
        index,
        src: src.substring(0, 100),
        has_controls: audio.hasAttribute('controls'),
        has_autoplay: audio.hasAttribute('autoplay'),
        has_loop: audio.hasAttribute('loop'),
        format: this.getAudioFormat(src)
      });
    });
    
    return inventory;
  }

  /**
   * Get audio format from URL
   */
  getAudioFormat(src) {
    const match = src.match(this.formatPatterns.audio_formats);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  /**
   * Analyze audio formats
   */
  analyzeAudioFormats(audioElements) {
    const formats = {
      mp3: 0, wav: 0, ogg: 0, aac: 0, m4a: 0, flac: 0, other: 0
    };
    
    audioElements.forEach(audio => {
      const src = audio.src || audio.querySelector('source')?.src || '';
      const format = this.getAudioFormat(src);
      
      if (formats.hasOwnProperty(format)) {
        formats[format]++;
      } else {
        formats.other++;
      }
    });
    
    return formats;
  }

  /**
   * Analyze audio controls
   */
  analyzeAudioControls(audioElements) {
    const controls = {
      has_controls: 0,
      autoplay_enabled: 0,
      user_friendly: 0
    };
    
    audioElements.forEach(audio => {
      if (audio.hasAttribute('controls')) controls.has_controls++;
      if (audio.hasAttribute('autoplay')) controls.autoplay_enabled++;
      
      // User-friendly (has controls, no autoplay)
      if (audio.hasAttribute('controls') && !audio.hasAttribute('autoplay')) {
        controls.user_friendly++;
      }
    });
    
    return controls;
  }

  /**
   * Analyze audio accessibility
   */
  analyzeAudioAccessibility(audioElements) {
    const accessibility = {
      has_transcripts: 0,
      has_descriptions: 0,
      keyboard_accessible: 0
    };
    
    audioElements.forEach(audio => {
      // Check for transcript indicators nearby
      const parent = audio.parentElement;
      if (parent && this.accessibilityPatterns.caption_indicators.test(parent.textContent)) {
        accessibility.has_transcripts++;
      }
      
      // Keyboard accessibility
      if (audio.hasAttribute('controls')) {
        accessibility.keyboard_accessible++;
      }
    });
    
    return accessibility;
  }

  /**
   * Calculate audio score
   */
  calculateAudioScore(formats, controls, accessibility) {
    let score = 70; // Base score
    
    const totalAudio = Object.values(formats).reduce((a, b) => a + b, 0);
    if (totalAudio === 0) return score;
    
    // Control factors
    const controlRatio = controls.has_controls / totalAudio;
    score += Math.min(15, controlRatio * 15);
    
    const userFriendlyRatio = controls.user_friendly / totalAudio;
    score += Math.min(10, userFriendlyRatio * 10);
    
    // Accessibility factors
    const transcriptRatio = accessibility.has_transcripts / totalAudio;
    score += Math.min(10, transcriptRatio * 10);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Create interactive inventory
   */
  createInteractiveInventory(elements) {
    const inventory = [];
    
    elements.forEach((element, index) => {
      const tagName = element.tagName.toLowerCase();
      
      inventory.push({
        index,
        type: tagName,
        src: element.src || element.getAttribute('data') || '',
        width: element.width || element.getAttribute('width') || 0,
        height: element.height || element.getAttribute('height') || 0,
        has_fallback: this.hasFallbackContent(element)
      });
    });
    
    return inventory;
  }

  /**
   * Check if element has fallback content
   */
  hasFallbackContent(element) {
    return element.textContent.trim().length > 0 || 
           element.children.length > 0;
  }

  /**
   * Analyze embeds
   */
  analyzeEmbeds(embeds) {
    const analysis = {
      total_embeds: embeds.length,
      responsive_embeds: 0,
      secure_embeds: 0,
      optimized_embeds: 0
    };
    
    embeds.forEach(embed => {
      const src = embed.src || '';
      
      // Responsive (has percentage width or uses CSS)
      const style = embed.getAttribute('style') || '';
      if (style.includes('%') || embed.classList.contains('responsive')) {
        analysis.responsive_embeds++;
      }
      
      // Secure (HTTPS)
      if (src.startsWith('https://')) {
        analysis.secure_embeds++;
      }
      
      // Optimized (lazy loading, etc.)
      if (embed.getAttribute('loading') === 'lazy') {
        analysis.optimized_embeds++;
      }
    });
    
    return analysis;
  }

  /**
   * Analyze canvas elements
   */
  analyzeCanvas(canvasElements) {
    const analysis = {
      total_canvas: canvasElements.length,
      accessible_canvas: 0,
      interactive_canvas: 0
    };
    
    canvasElements.forEach(canvas => {
      // Accessibility (has fallback content)
      if (canvas.textContent.trim().length > 0) {
        analysis.accessible_canvas++;
      }
      
      // Interactive (has event listeners - basic check)
      if (canvas.getAttribute('tabindex') || canvas.onclick) {
        analysis.interactive_canvas++;
      }
    });
    
    return analysis;
  }

  /**
   * Analyze SVG elements
   */
  analyzeSVG(svgElements) {
    const analysis = {
      total_svg: svgElements.length,
      accessible_svg: 0,
      optimized_svg: 0,
      inline_svg: 0
    };
    
    svgElements.forEach(svg => {
      // Accessibility
      if (svg.hasAttribute('role') || svg.querySelector('title, desc')) {
        analysis.accessible_svg++;
      }
      
      // Optimized (has viewBox)
      if (svg.hasAttribute('viewBox')) {
        analysis.optimized_svg++;
      }
      
      // Inline SVG
      if (!svg.hasAttribute('src')) {
        analysis.inline_svg++;
      }
    });
    
    return analysis;
  }

  /**
   * Calculate interactive score
   */
  calculateInteractiveScore(embeds, canvas, svg) {
    let score = 70; // Base score
    
    const totalInteractive = embeds.total_embeds + canvas.total_canvas + svg.total_svg;
    if (totalInteractive === 0) return score;
    
    // Embed optimization
    if (embeds.total_embeds > 0) {
      const embedOptimization = (embeds.responsive_embeds + embeds.secure_embeds) / (embeds.total_embeds * 2);
      score += Math.min(15, embedOptimization * 15);
    }
    
    // Canvas accessibility
    if (canvas.total_canvas > 0) {
      const canvasAccessibility = canvas.accessible_canvas / canvas.total_canvas;
      score += Math.min(10, canvasAccessibility * 10);
    }
    
    // SVG optimization
    if (svg.total_svg > 0) {
      const svgOptimization = (svg.accessible_svg + svg.optimized_svg) / (svg.total_svg * 2);
      score += Math.min(10, svgOptimization * 10);
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze loading optimization
   */
  analyzeLoadingOptimization(document) {
    const optimization = {
      lazy_loaded_images: 0,
      lazy_loaded_videos: 0,
      preload_hints: 0,
      critical_images: 0
    };
    
    // Lazy loaded images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    optimization.lazy_loaded_images = lazyImages.length;
    
    // Lazy loaded videos
    const lazyVideos = document.querySelectorAll('video[loading="lazy"], iframe[loading="lazy"]');
    optimization.lazy_loaded_videos = lazyVideos.length;
    
    // Preload hints
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    optimization.preload_hints = preloadLinks.length;
    
    // Critical images (above the fold estimate)
    const allImages = document.querySelectorAll('img');
    optimization.critical_images = Math.min(3, allImages.length); // Assume first 3 are critical
    
    return optimization;
  }

  /**
   * Analyze size optimization
   */
  analyzeSizeOptimization(document) {
    const optimization = {
      responsive_images: 0,
      srcset_usage: 0,
      sizes_attribute: 0,
      optimized_formats: 0
    };
    
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      if (img.hasAttribute('srcset')) {
        optimization.srcset_usage++;
        optimization.responsive_images++;
      }
      
      if (img.hasAttribute('sizes')) {
        optimization.sizes_attribute++;
      }
      
      const src = img.src || '';
      if (this.formatPatterns.modern_formats.test(src)) {
        optimization.optimized_formats++;
      }
    });
    
    return optimization;
  }

  /**
   * Analyze delivery optimization
   */
  analyzeDeliveryOptimization(document) {
    const optimization = {
      cdn_usage: 0,
      webp_support: 0,
      compression_hints: 0
    };
    
    const mediaElements = document.querySelectorAll('img, video, audio');
    
    mediaElements.forEach(element => {
      const src = element.src || '';
      
      // CDN usage
      if (this.optimizationIndicators.cdn_patterns.test(src)) {
        optimization.cdn_usage++;
      }
      
      // WebP support
      if (src.includes('.webp')) {
        optimization.webp_support++;
      }
      
      // Compression hints in URL
      if (this.optimizationIndicators.compression.test(src)) {
        optimization.compression_hints++;
      }
    });
    
    return optimization;
  }

  /**
   * Analyze caching
   */
  analyzeCaching(document) {
    const caching = {
      cache_friendly_urls: 0,
      versioned_assets: 0,
      immutable_resources: 0
    };
    
    const mediaElements = document.querySelectorAll('img, video, audio, source');
    
    mediaElements.forEach(element => {
      const src = element.src || '';
      
      // Cache-friendly URLs (no query params with timestamps)
      if (!src.includes('?t=') && !src.includes('&t=')) {
        caching.cache_friendly_urls++;
      }
      
      // Versioned assets
      if (src.match(/\.(jpg|png|mp4|webp)\?v=|\/v\d+\//)) {
        caching.versioned_assets++;
      }
    });
    
    return caching;
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(loading, size, delivery) {
    let score = 60; // Base score
    
    const totalImages = document.querySelectorAll('img').length;
    if (totalImages === 0) return score;
    
    // Loading optimization
    const lazyRatio = loading.lazy_loaded_images / totalImages;
    score += Math.min(20, lazyRatio * 20);
    
    // Size optimization
    const responsiveRatio = size.responsive_images / totalImages;
    score += Math.min(15, responsiveRatio * 15);
    
    // Delivery optimization
    const cdnRatio = delivery.cdn_usage / totalImages;
    score += Math.min(10, cdnRatio * 10);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze alt text quality
   */
  analyzeAltText(document) {
    const analysis = {
      images_with_alt: 0,
      images_without_alt: 0,
      descriptive_alt: 0,
      generic_alt: 0,
      empty_alt: 0
    };
    
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      
      if (alt === null) {
        analysis.images_without_alt++;
      } else if (alt.trim() === '') {
        analysis.empty_alt++;
        analysis.images_with_alt++; // Has attribute but empty
      } else {
        analysis.images_with_alt++;
        
        // Check if descriptive or generic
        if (this.accessibilityPatterns.descriptive_alt.test(alt)) {
          analysis.descriptive_alt++;
        } else if (this.accessibilityPatterns.generic_alt.test(alt)) {
          analysis.generic_alt++;
        } else {
          analysis.descriptive_alt++; // Assume non-generic is descriptive
        }
      }
    });
    
    return analysis;
  }

  /**
   * Analyze captions
   */
  analyzeCaptions(document) {
    const analysis = {
      videos_with_captions: 0,
      caption_tracks: 0,
      subtitle_tracks: 0
    };
    
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
      const captionTracks = video.querySelectorAll('track[kind="captions"]');
      const subtitleTracks = video.querySelectorAll('track[kind="subtitles"]');
      
      if (captionTracks.length > 0 || subtitleTracks.length > 0) {
        analysis.videos_with_captions++;
      }
      
      analysis.caption_tracks += captionTracks.length;
      analysis.subtitle_tracks += subtitleTracks.length;
    });
    
    return analysis;
  }

  /**
   * Analyze transcripts
   */
  analyzeTranscripts(document) {
    const analysis = {
      transcript_links: 0,
      transcript_sections: 0
    };
    
    // Look for transcript links
    const transcriptLinks = document.querySelectorAll('a[href*="transcript"], a:contains("transcript")');
    analysis.transcript_links = transcriptLinks.length;
    
    // Look for transcript sections
    const transcriptSections = document.querySelectorAll('.transcript, #transcript, [class*="transcript"]');
    analysis.transcript_sections = transcriptSections.length;
    
    return analysis;
  }

  /**
   * Analyze keyboard navigation
   */
  analyzeKeyboardNavigation(document) {
    const analysis = {
      focusable_media: 0,
      custom_controls: 0,
      skip_links: 0
    };
    
    const mediaElements = document.querySelectorAll('video, audio, canvas, iframe');
    
    mediaElements.forEach(element => {
      // Focusable (has tabindex or controls)
      if (element.hasAttribute('controls') || element.getAttribute('tabindex') !== '-1') {
        analysis.focusable_media++;
      }
      
      // Custom controls
      if (element.nextElementSibling?.classList.contains('controls') ||
          element.parentElement?.querySelector('.controls')) {
        analysis.custom_controls++;
      }
    });
    
    // Skip links for media
    const skipLinks = document.querySelectorAll('a[href^="#"][href*="skip"]');
    analysis.skip_links = skipLinks.length;
    
    return analysis;
  }

  /**
   * Calculate accessibility score
   */
  calculateAccessibilityScore(altText, captions, transcripts, keyboard) {
    let score = 50; // Base score
    
    const totalImages = document.querySelectorAll('img').length;
    const totalVideos = document.querySelectorAll('video').length;
    
    // Alt text score
    if (totalImages > 0) {
      const altRatio = altText.images_with_alt / totalImages;
      const descriptiveRatio = altText.descriptive_alt / Math.max(1, altText.images_with_alt);
      score += Math.min(25, altRatio * 20 + descriptiveRatio * 5);
    }
    
    // Caption score
    if (totalVideos > 0) {
      const captionRatio = captions.videos_with_captions / totalVideos;
      score += Math.min(15, captionRatio * 15);
    }
    
    // Transcript score
    if (transcripts.transcript_links > 0 || transcripts.transcript_sections > 0) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze modern formats
   */
  analyzeModernFormats(document) {
    const formats = {
      webp_count: 0,
      avif_count: 0,
      webm_count: 0,
      modern_ratio: 0
    };
    
    const images = document.querySelectorAll('img');
    const videos = document.querySelectorAll('video source, video');
    
    images.forEach(img => {
      const src = img.src || '';
      if (src.includes('.webp')) formats.webp_count++;
      if (src.includes('.avif')) formats.avif_count++;
    });
    
    videos.forEach(video => {
      const src = video.src || '';
      if (src.includes('.webm')) formats.webm_count++;
    });
    
    const totalMedia = images.length + videos.length;
    if (totalMedia > 0) {
      formats.modern_ratio = ((formats.webp_count + formats.avif_count + formats.webm_count) / totalMedia) * 100;
    }
    
    return formats;
  }

  /**
   * Analyze legacy formats
   */
  analyzeLegacyFormats(document) {
    const formats = {
      gif_count: 0,
      bmp_count: 0,
      tiff_count: 0,
      legacy_ratio: 0
    };
    
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const src = img.src || '';
      if (src.includes('.gif')) formats.gif_count++;
      if (src.includes('.bmp')) formats.bmp_count++;
      if (src.includes('.tiff') || src.includes('.tif')) formats.tiff_count++;
    });
    
    if (images.length > 0) {
      formats.legacy_ratio = ((formats.gif_count + formats.bmp_count + formats.tiff_count) / images.length) * 100;
    }
    
    return formats;
  }

  /**
   * Generate format recommendations
   */
  generateFormatRecommendations(document) {
    const recommendations = {
      convert_to_webp: 0,
      convert_to_avif: 0,
      optimize_gifs: 0,
      use_svg: 0
    };
    
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const src = img.src || '';
      
      // JPG/PNG to WebP
      if (src.match(/\.(jpg|jpeg|png)$/i)) {
        recommendations.convert_to_webp++;
      }
      
      // Large images to AVIF
      if ((img.width > 800 || img.height > 600) && src.match(/\.(jpg|jpeg|png)$/i)) {
        recommendations.convert_to_avif++;
      }
      
      // GIFs to video
      if (src.includes('.gif')) {
        recommendations.optimize_gifs++;
      }
      
      // Simple graphics to SVG
      if (src.match(/\.(png|jpg)$/i) && (img.width < 200 && img.height < 200)) {
        recommendations.use_svg++;
      }
    });
    
    return recommendations;
  }

  /**
   * Analyze compression
   */
  analyzeCompression(document) {
    const compression = {
      optimized_images: 0,
      cdn_optimized: 0,
      compression_indicators: 0
    };
    
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const src = img.src || '';
      
      // CDN optimization indicators
      if (this.optimizationIndicators.cdn_patterns.test(src)) {
        compression.cdn_optimized++;
      }
      
      // Compression indicators in URL
      if (this.optimizationIndicators.compression.test(src)) {
        compression.compression_indicators++;
      }
      
      // Modern format (implies optimization)
      if (this.formatPatterns.modern_formats.test(src)) {
        compression.optimized_images++;
      }
    });
    
    return compression;
  }

  /**
   * Calculate format optimization score
   */
  calculateFormatScore(modern, legacy, compression) {
    let score = 60; // Base score
    
    // Modern format bonus
    score += Math.min(25, modern.modern_ratio);
    
    // Legacy format penalty
    score -= Math.min(15, legacy.legacy_ratio);
    
    // Compression optimization
    const totalImages = document.querySelectorAll('img').length;
    if (totalImages > 0) {
      const compressionRatio = compression.optimized_images / totalImages;
      score += Math.min(15, compressionRatio * 15);
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate weighted multimedia score
   */
  calculateWeightedMultimediaScore(scores) {
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(this.multimediaWeights).forEach(([component, weight]) => {
      if (scores[component] !== undefined) {
        weightedSum += scores[component] * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  /**
   * Assess multimedia health
   */
  assessMultimediaHealth(scores) {
    const health = {
      critical_issues: [],
      warnings: [],
      strengths: [],
      overall_health: 'poor'
    };
    
    Object.entries(scores).forEach(([component, score]) => {
      if (score < 40) {
        health.critical_issues.push({ component, score, severity: 'critical' });
      } else if (score < 70) {
        health.warnings.push({ component, score, severity: 'warning' });
      } else {
        health.strengths.push({ component, score, severity: 'strength' });
      }
    });
    
    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    if (avgScore >= 80) health.overall_health = 'excellent';
    else if (avgScore >= 70) health.overall_health = 'good';
    else if (avgScore >= 60) health.overall_health = 'fair';
    
    return health;
  }

  /**
   * Identify optimization opportunities
   */
  identifyOptimizationOpportunities(scores) {
    const opportunities = [];
    
    Object.entries(scores).forEach(([component, score]) => {
      if (score < 80) {
        opportunities.push({
          component,
          current_score: score,
          potential_improvement: 80 - score,
          priority: score < 50 ? 'high' : score < 70 ? 'medium' : 'low',
          impact: this.multimediaWeights[component] || 5
        });
      }
    });
    
    return opportunities.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Classify multimedia quality
   */
  classifyMultimediaQuality(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very_good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 50) return 'poor';
    return 'very_poor';
  }

  /**
   * Identify priority improvements
   */
  identifyPriorityImprovements(scores) {
    const improvements = [];
    
    Object.entries(scores).forEach(([component, score]) => {
      if (score < 70) {
        improvements.push({
          component,
          score,
          priority: score < 40 ? 'critical' : score < 60 ? 'high' : 'medium',
          weight: this.multimediaWeights[component] || 5,
          actions: this.getMultimediaImprovementActions(component, score)
        });
      }
    });
    
    return improvements.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get multimedia improvement actions
   */
  getMultimediaImprovementActions(component, score) {
    const actions = {
      images: [
        'Add alt text to all images',
        'Convert images to modern formats (WebP, AVIF)',
        'Implement responsive images with srcset',
        'Enable lazy loading for images'
      ],
      videos: [
        'Add captions and subtitles to videos',
        'Include poster images for videos',
        'Optimize video file sizes',
        'Provide video transcripts'
      ],
      audio: [
        'Provide transcripts for audio content',
        'Add user controls to audio elements',
        'Avoid autoplay for accessibility'
      ],
      interactive: [
        'Add fallback content for interactive elements',
        'Ensure keyboard accessibility',
        'Optimize embed performance'
      ],
      performance: [
        'Implement lazy loading for media',
        'Use CDN for media delivery',
        'Optimize file sizes and compression',
        'Add preload hints for critical resources'
      ],
      accessibility: [
        'Improve alt text quality and descriptions',
        'Add captions to video content',
        'Ensure keyboard navigation support',
        'Provide text alternatives for multimedia'
      ],
      formats: [
        'Convert to modern image formats',
        'Optimize legacy format usage',
        'Implement progressive enhancement',
        'Use appropriate compression settings'
      ]
    };
    
    return actions[component] || ['Review and optimize multimedia content'];
  }

  /**
   * Generate multimedia insights
   */
  generateMultimediaInsights(assessment) {
    const insights = [];
    
    if (assessment.overall_score >= 85) {
      insights.push({
        type: 'positive',
        message: 'Excellent multimedia optimization with strong performance and accessibility',
        impact: 'high'
      });
    }
    
    if (assessment.multimedia_health.critical_issues.length > 0) {
      insights.push({
        type: 'critical',
        message: `${assessment.multimedia_health.critical_issues.length} critical multimedia issues need immediate attention`,
        impact: 'high'
      });
    }
    
    if (assessment.component_scores.accessibility < 60) {
      insights.push({
        type: 'improvement',
        message: 'Multimedia accessibility needs significant improvement for better user inclusion',
        impact: 'high'
      });
    }
    
    return insights;
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(assessment) {
    const recommendations = [];
    
    assessment.priority_improvements.forEach(improvement => {
      recommendations.push({
        category: improvement.component,
        priority: improvement.priority,
        current_score: improvement.score,
        target_score: Math.min(100, improvement.score + 20),
        actions: improvement.actions,
        expected_impact: improvement.weight > 20 ? 'high' : improvement.weight > 15 ? 'medium' : 'low'
      });
    });
    
    return recommendations;
  }

  /**
   * Identify performance issues
   */
  identifyPerformanceIssues({ images, videos, performance }) {
    const issues = [];
    
    // Large image issues
    if (images?.size_analysis?.oversized_images > 0) {
      issues.push({
        type: 'oversized_images',
        severity: 'high',
        count: images.size_analysis.oversized_images,
        message: 'Oversized images detected that may impact loading performance',
        impact: 'Page loading speed and user experience'
      });
    }
    
    // Missing lazy loading
    if (performance?.loading_optimization?.lazy_loaded_images === 0 && images?.total_images > 3) {
      issues.push({
        type: 'missing_lazy_loading',
        severity: 'medium',
        message: 'Images not using lazy loading',
        impact: 'Initial page load performance'
      });
    }
    
    // Legacy formats
    if (images?.format_distribution?.gif > 2) {
      issues.push({
        type: 'legacy_gif_usage',
        severity: 'medium',
        count: images.format_distribution.gif,
        message: 'Multiple GIF files detected - consider converting to video',
        impact: 'File size and loading performance'
      });
    }
    
    // Missing video optimization
    if (videos?.total_videos > 0 && videos?.optimization_features?.has_poster === 0) {
      issues.push({
        type: 'missing_video_posters',
        severity: 'medium',
        message: 'Videos missing poster images',
        impact: 'Perceived performance and user experience'
      });
    }
    
    return issues;
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
        multimedia_score: 0,
        multimedia_metrics: {
          total_images: 0,
          total_videos: 0,
          total_audio: 0,
          images_with_alt: 0,
          optimized_images: 0,
          modern_formats: 0,
          performance_score: 0,
          accessibility_score: 0
        }
      }
    };
  }
}

export default ContentMultimediaDetector;
