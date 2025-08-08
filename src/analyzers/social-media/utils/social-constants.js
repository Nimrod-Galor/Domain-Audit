/**
 * Social Media Standards and Constants
 * Platform specifications and optimization standards
 */

export const SOCIAL_MEDIA_STANDARDS = {
  // Open Graph Standards
  OPEN_GRAPH: {
    TITLE: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 60,
      OPTIMAL_LENGTH: 40,
    },
    DESCRIPTION: {
      MIN_LENGTH: 20,
      MAX_LENGTH: 160,
      OPTIMAL_LENGTH: 120,
    },
    IMAGE: {
      RECOMMENDED_WIDTH: 1200,
      RECOMMENDED_HEIGHT: 630,
      MIN_WIDTH: 600,
      MIN_HEIGHT: 315,
      ASPECT_RATIO: '1.91:1',
    },
  },

  // Twitter Card Standards
  TWITTER: {
    TITLE: {
      MAX_LENGTH: 70,
      OPTIMAL_LENGTH: 55,
    },
    DESCRIPTION: {
      MAX_LENGTH: 200,
      OPTIMAL_LENGTH: 160,
    },
    IMAGE: {
      SUMMARY: {
        MIN_WIDTH: 120,
        MIN_HEIGHT: 120,
        ASPECT_RATIO: '1:1',
      },
      SUMMARY_LARGE: {
        MIN_WIDTH: 280,
        MIN_HEIGHT: 150,
        RECOMMENDED_WIDTH: 1200,
        RECOMMENDED_HEIGHT: 600,
        ASPECT_RATIO: '2:1',
      },
    },
    CARD_TYPES: ['summary', 'summary_large_image', 'app', 'player'],
  },

  // LinkedIn Standards
  LINKEDIN: {
    TITLE: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 60,
      OPTIMAL_LENGTH: 50,
    },
    DESCRIPTION: {
      MIN_LENGTH: 50,
      MAX_LENGTH: 160,
      OPTIMAL_LENGTH: 140,
    },
    IMAGE: {
      MIN_WIDTH: 520,
      MIN_HEIGHT: 272,
      RECOMMENDED_WIDTH: 1200,
      RECOMMENDED_HEIGHT: 627,
      ASPECT_RATIO: '1.91:1',
    },
  },

  // Pinterest Standards
  PINTEREST: {
    TITLE: {
      MIN_LENGTH: 20,
      MAX_LENGTH: 100,
      OPTIMAL_LENGTH: 80,
    },
    DESCRIPTION: {
      MIN_LENGTH: 50,
      MAX_LENGTH: 500,
      OPTIMAL_LENGTH: 200,
    },
    IMAGE: {
      MIN_WIDTH: 600,
      RECOMMENDED_WIDTH: 1000,
      ASPECT_RATIO_VERTICAL: '2:3',
      ASPECT_RATIO_SQUARE: '1:1',
      PREFERRED_ORIENTATION: 'vertical',
    },
    RICH_PIN_TYPES: ['article', 'product', 'recipe', 'app'],
  },

  // WhatsApp Standards
  WHATSAPP: {
    TITLE: {
      MAX_LENGTH: 65,
      OPTIMAL_LENGTH: 50,
    },
    DESCRIPTION: {
      MAX_LENGTH: 160,
      OPTIMAL_LENGTH: 120,
    },
    IMAGE: {
      MAX_SIZE_KB: 300,
      RECOMMENDED_WIDTH: 400,
      RECOMMENDED_HEIGHT: 400,
      PREFERRED_PROTOCOL: 'https',
    },
  },

  // Platform Detection Patterns
  PLATFORMS: {
    FACEBOOK: {
      DOMAINS: ['facebook.com', 'fb.com', 'fb.me'],
      SHARING_URL: 'https://www.facebook.com/sharer/sharer.php',
      ICONS: ['fab fa-facebook', 'facebook-icon', 'fb-icon'],
    },
    TWITTER: {
      DOMAINS: ['twitter.com', 't.co'],
      SHARING_URL: 'https://twitter.com/intent/tweet',
      ICONS: ['fab fa-twitter', 'twitter-icon'],
    },
    LINKEDIN: {
      DOMAINS: ['linkedin.com', 'lnkd.in'],
      SHARING_URL: 'https://www.linkedin.com/sharing/share-offsite/',
      ICONS: ['fab fa-linkedin', 'linkedin-icon'],
    },
    PINTEREST: {
      DOMAINS: ['pinterest.com', 'pin.it'],
      SHARING_URL: 'https://pinterest.com/pin/create/button/',
      ICONS: ['fab fa-pinterest', 'pinterest-icon'],
    },
    WHATSAPP: {
      DOMAINS: ['whatsapp.com', 'wa.me'],
      SHARING_URL: 'https://wa.me/',
      ICONS: ['fab fa-whatsapp', 'whatsapp-icon'],
    },
    INSTAGRAM: {
      DOMAINS: ['instagram.com', 'instagr.am'],
      ICONS: ['fab fa-instagram', 'instagram-icon'],
    },
    YOUTUBE: {
      DOMAINS: ['youtube.com', 'youtu.be'],
      ICONS: ['fab fa-youtube', 'youtube-icon'],
    },
    TIKTOK: {
      DOMAINS: ['tiktok.com'],
      ICONS: ['fab fa-tiktok', 'tiktok-icon'],
    },
  },

  // Social Sharing Button Selectors
  SHARE_SELECTORS: [
    '.social-share',
    '.share-button',
    '.social-sharing',
    '.share-this',
    '.addthis',
    '.shareaholic',
    '[class*="share"]',
    '[data-share]',
    '[href*="facebook.com/sharer"]',
    '[href*="twitter.com/intent"]',
    '[href*="linkedin.com/sharing"]',
    '[href*="pinterest.com/pin"]',
    '[href*="wa.me"]',
    '[href*="whatsapp.com/send"]',
  ],

  // Social Media Link Selectors
  SOCIAL_LINK_SELECTORS: [
    '.social-links',
    '.social-icons',
    '.social-media',
    '.social-profiles',
    '[class*="social"]',
    '[href*="facebook.com"]',
    '[href*="twitter.com"]',
    '[href*="instagram.com"]',
    '[href*="linkedin.com"]',
    '[href*="youtube.com"]',
    '[href*="pinterest.com"]',
    '[href*="tiktok.com"]',
  ],

  // Social Proof Selectors
  SOCIAL_PROOF: {
    TESTIMONIALS: [
      '.testimonial',
      '.review',
      '.feedback',
      '.quote',
      '.recommendation',
      '.customer-review',
      '[data-testimonial]',
      '.client-testimonial',
    ],
    RATINGS: [
      '.rating',
      '.stars',
      '.score',
      '.rating-stars',
      '[data-rating]',
      '.star-rating',
      '.review-rating',
    ],
    SOCIAL_COUNTS: [
      '.social-count',
      '.followers',
      '.likes',
      '.shares',
      '.subscriber-count',
      '.fan-count',
      '[data-count]',
    ],
    TRUST_BADGES: [
      '.trust-badge',
      '.security-badge',
      '.certification',
      '.award',
      '.badge',
      '.trust-seal',
      '.verified-badge',
    ],
    CUSTOMER_LOGOS: [
      '.customer-logo',
      '.client-logo',
      '.partner-logo',
      '.brand-logo',
      '.featured-client',
      '.customer-brands',
    ],
  },

  // Image Format Standards
  IMAGE_FORMATS: {
    SUPPORTED: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    PREFERRED: ['jpg', 'png', 'webp'],
    AVOID: ['bmp', 'tiff'],
  },

  // Content Quality Standards
  CONTENT_QUALITY: {
    PROFESSIONAL_KEYWORDS: [
      'professional', 'business', 'industry', 'corporate',
      'executive', 'leadership', 'expertise', 'experience',
      'skills', 'qualifications', 'achievements', 'results',
      'certified', 'licensed', 'accredited',
    ],
    ENGAGEMENT_KEYWORDS: [
      'discover', 'learn', 'explore', 'find out', 'see how',
      'get started', 'join', 'connect', 'follow', 'share',
      'like', 'comment', 'subscribe',
    ],
    TRUST_INDICATORS: [
      'guarantee', 'certified', 'verified', 'secure',
      'trusted', 'award-winning', 'established', 'experienced',
      'professional', 'expert', 'leader', 'authorized',
    ],
  },

  // Optimization Scoring Weights
  SCORING_WEIGHTS: {
    OPEN_GRAPH: {
      TITLE: 0.25,
      DESCRIPTION: 0.25,
      IMAGE: 0.30,
      URL: 0.10,
      TYPE: 0.10,
    },
    TWITTER: {
      CARD_TYPE: 0.20,
      TITLE: 0.25,
      DESCRIPTION: 0.25,
      IMAGE: 0.20,
      CREATOR: 0.10,
    },
    SOCIAL_PROOF: {
      TESTIMONIALS: 0.30,
      RATINGS: 0.25,
      SOCIAL_METRICS: 0.20,
      TRUST_SIGNALS: 0.15,
      CUSTOMER_LOGOS: 0.10,
    },
  },

  // Error Types and Priorities
  ERROR_TYPES: {
    CRITICAL: {
      MISSING_REQUIRED_TAGS: 'high',
      INVALID_IMAGE_URL: 'high',
      EMPTY_CONTENT: 'high',
    },
    WARNING: {
      MISSING_RECOMMENDED_TAGS: 'medium',
      SUBOPTIMAL_LENGTH: 'medium',
      MISSING_ALT_TEXT: 'medium',
    },
    OPTIMIZATION: {
      IMPROVE_CONTENT_QUALITY: 'low',
      ADD_STRUCTURED_DATA: 'low',
      ENHANCE_VISUAL_ELEMENTS: 'low',
    },
  },

  // Regular Expressions for Validation
  REGEX_PATTERNS: {
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    IMAGE_URL: /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    SOCIAL_HANDLE: /^@[a-zA-Z0-9_]+$/,
    HASHTAG: /#[a-zA-Z0-9_]+/g,
    EMOJI: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu,
  },

  // Performance Thresholds
  PERFORMANCE: {
    ANALYSIS_TIME_LIMIT: 5000, // milliseconds
    MAX_ELEMENTS_TO_ANALYZE: 100,
    MAX_TEXT_LENGTH_TO_ANALYZE: 10000,
    IMAGE_SIZE_WARNING_THRESHOLD: 1000000, // 1MB
  },

  // Accessibility Standards
  ACCESSIBILITY: {
    MIN_COLOR_CONTRAST: 4.5,
    MIN_TOUCH_TARGET_SIZE: 44, // pixels
    REQUIRED_ALT_TEXT: true,
    KEYBOARD_NAVIGATION: true,
  },
};
