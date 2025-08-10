/**
 * ============================================================================
 * LOCATION ANALYZER MODULE
 * ============================================================================
 *
 * Analyzes business location and presence data including:
 * - Physical location information
 * - Service areas and coverage
 * - Local business indicators
 * - Geographic targeting
 * - Location-based structured data
 * - Regional presence
 *
 * @author Nimrod Galor
 * @version 1.0.0
 */

import { BaseAnalyzer } from '../../core/BaseAnalyzer.js';
import { AnalyzerInterface } from '../../core/AnalyzerInterface.js';

export class LocationAnalyzer extends BaseAnalyzer {
  constructor(options = {}) {
    super('LocationAnalyzer');
    this.options = {
      enableAddressAnalysis: options.enableAddressAnalysis !== false,
      enableServiceAreaAnalysis: options.enableServiceAreaAnalysis !== false,
      enableLocalBusinessAnalysis: options.enableLocalBusinessAnalysis !== false,
      enableStructuredDataAnalysis: options.enableStructuredDataAnalysis !== false,
      ...options,
    };

    this.locationSelectors = [
      '.address', '.location', '.office', '.headquarters', '.branch',
      '.contact-address', '.business-address', '.office-location',
      '[class*="address"]', '[class*="location"]', '[class*="office"]'
    ];

    this.serviceAreaSelectors = [
      '.service-area', '.coverage', '.service-region', '.areas-served',
      '.service-locations', '.we-serve', '.locations-served',
      '[class*="service"]', '[class*="coverage"]', '[class*="area"]'
    ];

    this.hoursSelectors = [
      '.hours', '.business-hours', '.operating-hours', '.open-hours',
      '.schedule', '.availability', '.working-hours',
      '[class*="hours"]', '[class*="schedule"]', '[class*="time"]'
    ];

    this.countryPatterns = {
      US: /\b(USA|United States|US|America)\b/gi,
      CA: /\b(Canada|Canadian)\b/gi,
      UK: /\b(UK|United Kingdom|Britain|British)\b/gi,
      AU: /\b(Australia|Australian)\b/gi,
      DE: /\b(Germany|German|Deutschland)\b/gi,
      FR: /\b(France|French)\b/gi,
      ES: /\b(Spain|Spanish|España)\b/gi,
      IT: /\b(Italy|Italian|Italia)\b/gi,
      NL: /\b(Netherlands|Dutch|Holland)\b/gi,
      SE: /\b(Sweden|Swedish|Sverige)\b/gi,
    };

    this.statePatterns = {
      // US States
      AL: /\b(Alabama|AL)\b/gi, AK: /\b(Alaska|AK)\b/gi, AZ: /\b(Arizona|AZ)\b/gi,
      AR: /\b(Arkansas|AR)\b/gi, CA: /\b(California|CA)\b/gi, CO: /\b(Colorado|CO)\b/gi,
      CT: /\b(Connecticut|CT)\b/gi, DE: /\b(Delaware|DE)\b/gi, FL: /\b(Florida|FL)\b/gi,
      GA: /\b(Georgia|GA)\b/gi, HI: /\b(Hawaii|HI)\b/gi, ID: /\b(Idaho|ID)\b/gi,
      IL: /\b(Illinois|IL)\b/gi, IN: /\b(Indiana|IN)\b/gi, IA: /\b(Iowa|IA)\b/gi,
      KS: /\b(Kansas|KS)\b/gi, KY: /\b(Kentucky|KY)\b/gi, LA: /\b(Louisiana|LA)\b/gi,
      ME: /\b(Maine|ME)\b/gi, MD: /\b(Maryland|MD)\b/gi, MA: /\b(Massachusetts|MA)\b/gi,
      MI: /\b(Michigan|MI)\b/gi, MN: /\b(Minnesota|MN)\b/gi, MS: /\b(Mississippi|MS)\b/gi,
      MO: /\b(Missouri|MO)\b/gi, MT: /\b(Montana|MT)\b/gi, NE: /\b(Nebraska|NE)\b/gi,
      NV: /\b(Nevada|NV)\b/gi, NH: /\b(New Hampshire|NH)\b/gi, NJ: /\b(New Jersey|NJ)\b/gi,
      NM: /\b(New Mexico|NM)\b/gi, NY: /\b(New York|NY)\b/gi, NC: /\b(North Carolina|NC)\b/gi,
      ND: /\b(North Dakota|ND)\b/gi, OH: /\b(Ohio|OH)\b/gi, OK: /\b(Oklahoma|OK)\b/gi,
      OR: /\b(Oregon|OR)\b/gi, PA: /\b(Pennsylvania|PA)\b/gi, RI: /\b(Rhode Island|RI)\b/gi,
      SC: /\b(South Carolina|SC)\b/gi, SD: /\b(South Dakota|SD)\b/gi, TN: /\b(Tennessee|TN)\b/gi,
      TX: /\b(Texas|TX)\b/gi, UT: /\b(Utah|UT)\b/gi, VT: /\b(Vermont|VT)\b/gi,
      VA: /\b(Virginia|VA)\b/gi, WA: /\b(Washington|WA)\b/gi, WV: /\b(West Virginia|WV)\b/gi,
      WI: /\b(Wisconsin|WI)\b/gi, WY: /\b(Wyoming|WY)\b/gi,
    };

    this.localBusinessKeywords = [
      'local', 'nearby', 'community', 'neighborhood', 'locally owned',
      'family owned', 'established', 'serving', 'since', 'years in business'
    ];

    this.serviceAreaKeywords = [
      'serve', 'serving', 'coverage', 'available in', 'locations',
      'areas', 'regions', 'nationwide', 'statewide', 'citywide'
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
      description: 'Analyzes business location and presence data including physical locations, service areas, local business indicators, and geographic targeting',
      version: '1.0.0',
      author: 'Nimrod Galor',
      priority: 'high',
      type: 'business-intelligence',
      capabilities: [
        'physical-location-analysis',
        'service-area-detection',
        'business-hours-analysis',
        'local-presence-assessment',
        'geographic-targeting-analysis',
        'structured-location-data',
        'multi-location-analysis'
      ],
      metrics: [
        'physical_locations_count',
        'service_areas_count',
        'business_hours_availability',
        'local_presence_score',
        'geographic_targeting_score',
        'structured_data_score',
        'overall_location_score'
      ],
      dependencies: ['cheerio'],
      performanceImpact: 'medium'
    };
  }

  /**
   * Validate input parameters
   * @param {Document} document - The DOM document
   * @param {string} url - The page URL
   * @returns {boolean} True if inputs are valid
   */
  validate(document, url) {
    if (!document) {
      this.handleError('Document is required for location analysis');
      return false;
    }

    if (!url || typeof url !== 'string') {
      this.handleError('Valid URL is required for location analysis');
      return false;
    }

    try {
      new URL(url);
    } catch (error) {
      this.handleError(`Invalid URL format: ${url}`);
      return false;
    }

    return true;
  }

  /**
   * Analyze location and business presence information
   * @param {Document} document - DOM document
   * @param {string} url - Page URL
   * @returns {Object} Location analysis results
   */
  async analyze(document, url) {
    if (!this.validate(document, url)) {
      return this.createErrorResult('Validation failed for location analysis');
    }

    try {
      const physicalLocation = this._analyzePhysicalLocation(document);
      const serviceAreas = this._analyzeServiceAreas(document);
      const businessHours = this._analyzeBusinessHours(document);
      const localPresence = this._analyzeLocalPresence(document);
      const geographicTargeting = this._analyzeGeographicTargeting(document);
      const structuredLocationData = this._analyzeStructuredLocationData(document);
      const multiLocationBusiness = this._analyzeMultiLocationBusiness(document);

      const analysis = {
        physicalLocation,
        serviceAreas,
        businessHours,
        localPresence,
        geographicTargeting,
        structuredLocationData,
        multiLocationBusiness,
      };

      const score = this._calculateLocationScore(analysis);
      const performance = performance.now() - startTime;

      const result = {
        ...analysis,
        score,
        grade: this._assignGrade(score),
        businessType: this._classifyBusinessType(analysis),
        strengths: this._identifyLocationStrengths(analysis),
        recommendations: this._generateLocationRecommendations(analysis),
        summary: this._generateExecutiveSummary(analysis, score),
        metadata: {
          ...this.getMetadata(),
          analysisDate: new Date().toISOString(),
          performanceMs: Math.round(performance),
          url: url
        }
      };

      return result;

    } catch (error) {
      this.handleError(`Location analysis failed: ${error.message}`);
      return this.createErrorResult('Location analysis failed');
    }
  }

  /**
   * Analyze physical location information
   */
  _analyzePhysicalLocation(document) {
    const addresses = [];
    const locationElements = [];

    // Find address elements
    this.locationSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const addressText = element.textContent.trim();
        if (addressText.length > 20) {
          const addressAnalysis = this._analyzeAddressQuality(addressText);
          addresses.push({
            element,
            text: addressText,
            ...addressAnalysis,
          });
        }
      });
    });

    // Look for address patterns in text
    const addressPatterns = this._findAddressPatterns(document);
    addresses.push(...addressPatterns);

    // Find phone numbers associated with locations
    const locationPhones = this._findLocationPhones(document);

    // Check for maps or location services
    const hasMap = this._hasMapIntegration(document);
    const hasDirections = this._hasDirectionsLink(document);

    return {
      addresses,
      locationElements,
      addressCount: addresses.length,
      hasPhysicalAddress: addresses.length > 0,
      hasCompleteAddress: addresses.some(a => a.quality > 80),
      hasMultipleLocations: addresses.length > 1,
      locationPhones,
      hasMap,
      hasDirections,
      score: this._calculatePhysicalLocationScore(addresses, hasMap, hasDirections),
    };
  }

  /**
   * Analyze service areas and coverage
   */
  _analyzeServiceAreas(document) {
    const serviceAreas = [];
    const textContent = document.body.textContent.toLowerCase();

    // Find service area sections
    this.serviceAreaSelectors.forEach((selector) => {
      const sections = document.querySelectorAll(selector);
      sections.forEach((section) => {
        const areaText = section.textContent.trim();
        if (areaText.length > 20) {
          serviceAreas.push({
            element: section,
            text: areaText,
            locations: this._extractLocationNames(areaText),
            coverage: this._analyzeCoverageScope(areaText),
          });
        }
      });
    });

    // Look for service area keywords
    const serviceAreaMentions = [];
    this.serviceAreaKeywords.forEach((keyword) => {
      if (textContent.includes(keyword)) {
        serviceAreaMentions.push(keyword);
      }
    });

    // Find geographic coverage indicators
    const coverageLevel = this._determineCoverageLevel(textContent);
    const specificLocations = this._findSpecificLocations(textContent);

    return {
      serviceAreas,
      serviceAreaMentions,
      specificLocations,
      coverageLevel,
      sectionCount: serviceAreas.length,
      hasServiceAreas: serviceAreas.length > 0,
      hasSpecificLocations: specificLocations.length > 0,
      isNationwide: coverageLevel === 'nationwide',
      isRegional: coverageLevel === 'regional',
      isLocal: coverageLevel === 'local',
      score: this._calculateServiceAreaScore(serviceAreas, coverageLevel, specificLocations),
    };
  }

  /**
   * Analyze business hours information
   */
  _analyzeBusinessHours(document) {
    const hoursElements = [];
    const hoursMentions = [];

    // Find business hours sections
    this.hoursSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const hoursText = element.textContent.trim();
        if (hoursText.length > 10) {
          const hoursAnalysis = this._analyzeHoursText(hoursText);
          hoursElements.push({
            element,
            text: hoursText,
            ...hoursAnalysis,
          });
        }
      });
    });

    // Look for time patterns in text
    const timePatterns = this._findTimePatterns(document);
    const dayPatterns = this._findDayPatterns(document);

    // Check for 24/7 or extended hours
    const is24_7 = this._is24_7Business(document);
    const hasExtendedHours = this._hasExtendedHours(document);

    return {
      hoursElements,
      hoursMentions,
      timePatterns,
      dayPatterns,
      elementCount: hoursElements.length,
      hasBusinessHours: hoursElements.length > 0,
      hasStructuredHours: hoursElements.some(h => h.isStructured),
      is24_7,
      hasExtendedHours,
      hoursClarity: this._assessHoursClarity(hoursElements),
      score: this._calculateBusinessHoursScore(hoursElements, is24_7, hasExtendedHours),
    };
  }

  /**
   * Analyze local business presence
   */
  _analyzeLocalPresence(document) {
    const textContent = document.body.textContent.toLowerCase();
    const localIndicators = [];

    // Look for local business keywords
    this.localBusinessKeywords.forEach((keyword) => {
      if (textContent.includes(keyword)) {
        localIndicators.push(keyword);
      }
    });

    // Find community involvement mentions
    const communityMentions = this._findCommunityMentions(document);
    
    // Look for local partnerships
    const localPartnerships = this._findLocalPartnerships(document);

    // Check for local certifications or memberships
    const localCertifications = this._findLocalCertifications(document);

    // Analyze local SEO elements
    const localSEO = this._analyzeLocalSEO(document);

    return {
      localIndicators,
      communityMentions,
      localPartnerships,
      localCertifications,
      localSEO,
      indicatorCount: localIndicators.length,
      hasLocalPresence: localIndicators.length > 2,
      hasCommunityInvolvement: communityMentions.length > 0,
      hasLocalPartnerships: localPartnerships.length > 0,
      strongLocalPresence: localIndicators.length > 5,
      score: this._calculateLocalPresenceScore(localIndicators, communityMentions, localPartnerships, localCertifications),
    };
  }

  /**
   * Analyze geographic targeting
   */
  _analyzeGeographicTargeting(document) {
    const textContent = document.body.textContent;
    const countries = [];
    const states = [];
    const cities = [];

    // Find country mentions
    Object.entries(this.countryPatterns).forEach(([code, pattern]) => {
      const matches = textContent.match(pattern) || [];
      if (matches.length > 0) {
        countries.push({
          code,
          matches: matches.length,
          pattern: pattern.source,
        });
      }
    });

    // Find state mentions
    Object.entries(this.statePatterns).forEach(([code, pattern]) => {
      const matches = textContent.match(pattern) || [];
      if (matches.length > 0) {
        states.push({
          code,
          matches: matches.length,
          pattern: pattern.source,
        });
      }
    });

    // Find city patterns
    const cityPatterns = this._findCityPatterns(textContent);
    cities.push(...cityPatterns);

    // Determine primary market
    const primaryMarket = this._determinePrimaryMarket(countries, states, cities);

    return {
      countries,
      states,
      cities,
      primaryMarket,
      countryCount: countries.length,
      stateCount: states.length,
      cityCount: cities.length,
      isInternational: countries.length > 1,
      isMultiState: states.length > 1,
      isMultiCity: cities.length > 1,
      hasGeographicFocus: countries.length > 0 || states.length > 0 || cities.length > 0,
      score: this._calculateGeographicTargetingScore(countries, states, cities),
    };
  }

  /**
   * Analyze structured location data
   */
  _analyzeStructuredLocationData(document) {
    const structuredData = {
      schema: this._findSchemaLocationData(document),
      microdata: this._findMicrodataLocation(document),
      jsonLD: this._findJSONLDLocation(document),
      openGraph: this._findOpenGraphLocation(document),
    };

    const hasAnyStructuredData = Object.values(structuredData).some(data => data.length > 0);

    return {
      ...structuredData,
      hasAnyStructuredData,
      hasSchemaOrg: structuredData.schema.length > 0,
      hasMicrodata: structuredData.microdata.length > 0,
      hasJSONLD: structuredData.jsonLD.length > 0,
      hasOpenGraph: structuredData.openGraph.length > 0,
      structuredDataQuality: this._assessStructuredDataQuality(structuredData),
      score: this._calculateStructuredDataScore(structuredData, hasAnyStructuredData),
    };
  }

  /**
   * Analyze multi-location business indicators
   */
  _analyzeMultiLocationBusiness(document) {
    const textContent = document.body.textContent.toLowerCase();
    
    // Look for multi-location indicators
    const multiLocationKeywords = [
      'locations', 'branches', 'offices', 'stores', 'outlets',
      'multiple locations', 'nationwide', 'franchise', 'chain'
    ];

    const multiLocationIndicators = multiLocationKeywords.filter(keyword =>
      textContent.includes(keyword)
    );

    // Find location lists or directories
    const locationLists = document.querySelectorAll('.locations, .stores, .branches, .offices, [class*="location-list"]');
    
    // Count potential locations
    const locationCount = this._estimateLocationCount(document);

    // Check for location finder
    const hasLocationFinder = this._hasLocationFinder(document);

    return {
      multiLocationIndicators,
      locationLists: Array.from(locationLists),
      estimatedLocationCount: locationCount,
      hasLocationFinder,
      isMultiLocation: multiLocationIndicators.length > 0 || locationCount > 1,
      isChainBusiness: textContent.includes('chain') || textContent.includes('franchise'),
      score: this._calculateMultiLocationScore(multiLocationIndicators, locationCount, hasLocationFinder),
    };
  }

  // Helper methods
  _analyzeAddressQuality(addressText) {
    let quality = 0;
    
    // Check for street number
    if (/\d+/.test(addressText)) quality += 20;
    
    // Check for street name
    if (/\b(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|place|pl)\b/i.test(addressText)) quality += 20;
    
    // Check for city
    if (/\b[A-Z][a-z]+\b/.test(addressText)) quality += 15;
    
    // Check for state/province
    if (/\b[A-Z]{2}\b|\b[A-Z][a-z]+\b/.test(addressText)) quality += 15;
    
    // Check for zip code
    if (/\b\d{5}(-\d{4})?\b|\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/.test(addressText)) quality += 20;
    
    // Check for country
    if (/\b(USA|US|United States|Canada|CA)\b/i.test(addressText)) quality += 10;

    return {
      quality,
      hasStreetNumber: /\d+/.test(addressText),
      hasStreetName: /\b(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|place|pl)\b/i.test(addressText),
      hasZipCode: /\b\d{5}(-\d{4})?\b|\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/.test(addressText),
      isComplete: quality > 80,
    };
  }

  _findAddressPatterns(document) {
    const addresses = [];
    const textContent = document.body.textContent;
    
    // Address pattern matching
    const addressPattern = /\d+\s+[A-Za-z\s,]+\b(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\b[^.]*\b\d{5}\b/gi;
    const matches = textContent.match(addressPattern) || [];
    
    matches.forEach((match) => {
      addresses.push({
        text: match.trim(),
        type: 'pattern',
        quality: 75,
        source: 'text_pattern',
      });
    });

    return addresses;
  }

  _findLocationPhones(document) {
    const phones = [];
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    phoneLinks.forEach((link) => {
      const parent = link.closest('.address, .location, .office, .contact');
      if (parent) {
        phones.push({
          number: link.href.replace('tel:', ''),
          text: link.textContent.trim(),
          associatedWithLocation: true,
        });
      }
    });

    return phones;
  }

  _hasMapIntegration(document) {
    const mapSelectors = [
      'iframe[src*="maps.google"]', 'iframe[src*="openstreetmap"]',
      '.map', '.google-map', '.location-map', '[class*="map"]'
    ];

    return mapSelectors.some(selector => 
      document.querySelector(selector) !== null
    );
  }

  _hasDirectionsLink(document) {
    const directionLinks = document.querySelectorAll('a[href*="directions"], a[href*="maps.google"]');
    return directionLinks.length > 0;
  }

  _extractLocationNames(text) {
    const locations = [];
    
    // Simple location extraction (cities, states)
    const locationPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2}|\s+[A-Z]{2})\b/g;
    const matches = text.match(locationPattern) || [];
    
    locations.push(...matches);
    
    return [...new Set(locations)];
  }

  _analyzeCoverageScope(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('nationwide') || lowerText.includes('across the country')) {
      return 'nationwide';
    }
    if (lowerText.includes('statewide') || lowerText.includes('throughout')) {
      return 'statewide';
    }
    if (lowerText.includes('regional') || lowerText.includes('metro area')) {
      return 'regional';
    }
    if (lowerText.includes('local') || lowerText.includes('city')) {
      return 'local';
    }
    
    return 'unspecified';
  }

  _determineCoverageLevel(textContent) {
    if (textContent.includes('nationwide') || textContent.includes('across the country')) {
      return 'nationwide';
    }
    if (textContent.includes('statewide') || textContent.includes('regional')) {
      return 'regional';
    }
    if (textContent.includes('local') || textContent.includes('community')) {
      return 'local';
    }
    
    return 'unspecified';
  }

  _findSpecificLocations(textContent) {
    const locations = [];
    
    // Find city, state patterns
    const cityStatePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}\b/g;
    const matches = textContent.match(cityStatePattern) || [];
    
    locations.push(...matches);
    
    return [...new Set(locations)];
  }

  _analyzeHoursText(hoursText) {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const timePattern = /\b\d{1,2}:\d{2}\s*(am|pm|AM|PM)?\b/g;
    
    const mentionedDays = daysOfWeek.filter(day => 
      hoursText.toLowerCase().includes(day)
    );
    
    const timeMatches = hoursText.match(timePattern) || [];
    
    return {
      mentionedDays,
      timeMatches,
      dayCount: mentionedDays.length,
      timeCount: timeMatches.length,
      isStructured: mentionedDays.length > 3 && timeMatches.length > 2,
      hasWeekdays: mentionedDays.includes('monday') || mentionedDays.includes('friday'),
      hasWeekends: mentionedDays.includes('saturday') || mentionedDays.includes('sunday'),
    };
  }

  _findTimePatterns(document) {
    const textContent = document.body.textContent;
    const timePattern = /\b\d{1,2}:\d{2}\s*(am|pm|AM|PM)?\b/g;
    const matches = textContent.match(timePattern) || [];
    
    return [...new Set(matches)];
  }

  _findDayPatterns(document) {
    const textContent = document.body.textContent.toLowerCase();
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return daysOfWeek.filter(day => textContent.includes(day));
  }

  _is24_7Business(document) {
    const textContent = document.body.textContent.toLowerCase();
    const patterns = ['24/7', '24 hours', 'always open', 'never closed', 'round the clock'];
    
    return patterns.some(pattern => textContent.includes(pattern));
  }

  _hasExtendedHours(document) {
    const textContent = document.body.textContent.toLowerCase();
    const patterns = ['extended hours', 'late night', 'early morning', 'weekend hours'];
    
    return patterns.some(pattern => textContent.includes(pattern));
  }

  _assessHoursClarity(hoursElements) {
    if (hoursElements.length === 0) return 0;
    
    const clarityScores = hoursElements.map(element => {
      let score = 0;
      if (element.isStructured) score += 40;
      if (element.dayCount >= 7) score += 30;
      if (element.timeCount >= 2) score += 20;
      if (element.hasWeekdays && element.hasWeekends) score += 10;
      return score;
    });
    
    return clarityScores.reduce((sum, score) => sum + score, 0) / clarityScores.length;
  }

  _findCommunityMentions(document) {
    const textContent = document.body.textContent.toLowerCase();
    const communityKeywords = [
      'community', 'volunteer', 'sponsor', 'charity', 'donate',
      'local events', 'community involvement', 'giving back'
    ];
    
    return communityKeywords.filter(keyword => textContent.includes(keyword));
  }

  _findLocalPartnerships(document) {
    const textContent = document.body.textContent.toLowerCase();
    const partnershipKeywords = [
      'local partner', 'community partner', 'local business',
      'chamber of commerce', 'business association'
    ];
    
    return partnershipKeywords.filter(keyword => textContent.includes(keyword));
  }

  _findLocalCertifications(document) {
    const textContent = document.body.textContent.toLowerCase();
    const certificationKeywords = [
      'locally licensed', 'city permit', 'local certification',
      'state licensed', 'municipal approval'
    ];
    
    return certificationKeywords.filter(keyword => textContent.includes(keyword));
  }

  _analyzeLocalSEO(document) {
    const title = document.title.toLowerCase();
    const metaDescription = document.querySelector('meta[name="description"]');
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.toLowerCase());
    
    const locationKeywords = ['near me', 'local', 'in your area', 'nearby'];
    
    let localSEOScore = 0;
    locationKeywords.forEach(keyword => {
      if (title.includes(keyword)) localSEOScore += 25;
      if (metaDescription && metaDescription.content.toLowerCase().includes(keyword)) localSEOScore += 20;
      if (headings.some(h => h.includes(keyword))) localSEOScore += 15;
    });
    
    return {
      score: Math.min(localSEOScore, 100),
      hasLocalKeywords: localSEOScore > 0,
      inTitle: locationKeywords.some(k => title.includes(k)),
      inMeta: metaDescription && locationKeywords.some(k => metaDescription.content.toLowerCase().includes(k)),
      inHeadings: headings.some(h => locationKeywords.some(k => h.includes(k))),
    };
  }

  _findCityPatterns(textContent) {
    const cities = [];
    
    // Common US city patterns
    const cityPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?=\s*,\s*[A-Z]{2}|\s+[A-Z]{2})/g;
    const matches = textContent.match(cityPattern) || [];
    
    matches.forEach(match => {
      cities.push({
        name: match.trim(),
        type: 'city',
      });
    });
    
    return cities;
  }

  _determinePrimaryMarket(countries, states, cities) {
    if (countries.length > 0) {
      return {
        type: 'country',
        value: countries[0].code,
        confidence: countries[0].matches,
      };
    }
    if (states.length > 0) {
      return {
        type: 'state',
        value: states[0].code,
        confidence: states[0].matches,
      };
    }
    if (cities.length > 0) {
      return {
        type: 'city',
        value: cities[0].name,
        confidence: 1,
      };
    }
    
    return { type: 'unknown', value: null, confidence: 0 };
  }

  _findSchemaLocationData(document) {
    const schemaElements = document.querySelectorAll('[itemtype*="LocalBusiness"], [itemtype*="PostalAddress"], [itemtype*="Place"]');
    return Array.from(schemaElements).map(el => ({
      type: el.getAttribute('itemtype'),
      element: el,
    }));
  }

  _findMicrodataLocation(document) {
    const microdataElements = document.querySelectorAll('[itemprop*="address"], [itemprop*="location"]');
    return Array.from(microdataElements).map(el => ({
      property: el.getAttribute('itemprop'),
      element: el,
    }));
  }

  _findJSONLDLocation(document) {
    const jsonLDScripts = document.querySelectorAll('script[type="application/ld+json"]');
    const locationData = [];
    
    jsonLDScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@type'] === 'LocalBusiness' || data.address || data.location) {
          locationData.push(data);
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    });
    
    return locationData;
  }

  _findOpenGraphLocation(document) {
    const ogLocation = [];
    const metaTags = document.querySelectorAll('meta[property^="og:"]');
    
    metaTags.forEach(meta => {
      const property = meta.getAttribute('property');
      if (property.includes('location') || property.includes('address')) {
        ogLocation.push({
          property,
          content: meta.getAttribute('content'),
        });
      }
    });
    
    return ogLocation;
  }

  _assessStructuredDataQuality(structuredData) {
    let quality = 0;
    
    if (structuredData.schema.length > 0) quality += 30;
    if (structuredData.jsonLD.length > 0) quality += 40;
    if (structuredData.microdata.length > 0) quality += 20;
    if (structuredData.openGraph.length > 0) quality += 10;
    
    return Math.min(quality, 100);
  }

  _estimateLocationCount(document) {
    const locationElements = document.querySelectorAll('.location, .store, .branch, .office');
    const addressElements = document.querySelectorAll('.address');
    
    return Math.max(locationElements.length, addressElements.length, 1);
  }

  _hasLocationFinder(document) {
    const finderElements = document.querySelectorAll('.location-finder, .store-finder, .find-location');
    const finderLinks = document.querySelectorAll('a[href*="locations"], a[href*="stores"], a[href*="finder"]');
    
    return finderElements.length > 0 || finderLinks.length > 0;
  }

  // Scoring methods
  _calculatePhysicalLocationScore(addresses, hasMap, hasDirections) {
    let score = 0;
    
    if (addresses.length > 0) score += 50;
    if (addresses.some(a => a.isComplete)) score += 30;
    if (hasMap) score += 10;
    if (hasDirections) score += 10;
    
    return Math.min(score, 100);
  }

  _calculateServiceAreaScore(serviceAreas, coverageLevel, specificLocations) {
    let score = 0;
    
    score += Math.min(serviceAreas.length * 20, 40);
    score += Math.min(specificLocations.length * 5, 30);
    
    switch (coverageLevel) {
      case 'nationwide': score += 30; break;
      case 'regional': score += 20; break;
      case 'local': score += 15; break;
    }
    
    return Math.min(score, 100);
  }

  _calculateBusinessHoursScore(hoursElements, is24_7, hasExtendedHours) {
    let score = 0;
    
    if (hoursElements.length > 0) score += 50;
    if (hoursElements.some(h => h.isStructured)) score += 30;
    if (is24_7) score += 20;
    else if (hasExtendedHours) score += 10;
    
    return Math.min(score, 100);
  }

  _calculateLocalPresenceScore(indicators, communityMentions, partnerships, certifications) {
    let score = 0;
    
    score += Math.min(indicators.length * 8, 40);
    score += Math.min(communityMentions.length * 10, 30);
    score += Math.min(partnerships.length * 15, 30);
    score += Math.min(certifications.length * 20, 20);
    
    return Math.min(score, 100);
  }

  _calculateGeographicTargetingScore(countries, states, cities) {
    let score = 0;
    
    score += Math.min(countries.length * 20, 40);
    score += Math.min(states.length * 10, 30);
    score += Math.min(cities.length * 5, 30);
    
    return Math.min(score, 100);
  }

  _calculateStructuredDataScore(structuredData, hasAnyStructuredData) {
    if (!hasAnyStructuredData) return 0;
    
    let score = 0;
    
    if (structuredData.schema.length > 0) score += 30;
    if (structuredData.jsonLD.length > 0) score += 40;
    if (structuredData.microdata.length > 0) score += 20;
    if (structuredData.openGraph.length > 0) score += 10;
    
    return Math.min(score, 100);
  }

  _calculateMultiLocationScore(indicators, locationCount, hasLocationFinder) {
    let score = 0;
    
    score += Math.min(indicators.length * 15, 45);
    score += Math.min(locationCount * 10, 30);
    if (hasLocationFinder) score += 25;
    
    return Math.min(score, 100);
  }

  _calculateLocationScore(analysis) {
    const weights = {
      physicalLocation: 0.25,
      serviceAreas: 0.15,
      businessHours: 0.15,
      localPresence: 0.20,
      geographicTargeting: 0.10,
      structuredLocationData: 0.10,
      multiLocationBusiness: 0.05,
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

  _classifyBusinessType(analysis) {
    if (analysis.multiLocationBusiness.isChainBusiness) return 'chain';
    if (analysis.multiLocationBusiness.isMultiLocation) return 'multi-location';
    if (analysis.serviceAreas.isNationwide) return 'national';
    if (analysis.serviceAreas.isRegional) return 'regional';
    if (analysis.localPresence.hasLocalPresence) return 'local';
    if (analysis.physicalLocation.hasPhysicalAddress) return 'brick-and-mortar';
    
    return 'online-only';
  }

  _assignGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  _identifyLocationStrengths(analysis) {
    const strengths = [];
    
    if (analysis.physicalLocation.hasCompleteAddress) strengths.push('Complete physical address provided');
    if (analysis.serviceAreas.hasSpecificLocations) strengths.push('Specific service areas clearly defined');
    if (analysis.businessHours.hasStructuredHours) strengths.push('Clear business hours information');
    if (analysis.localPresence.strongLocalPresence) strengths.push('Strong local community presence');
    if (analysis.structuredLocationData.hasAnyStructuredData) strengths.push('Structured location data implemented');
    
    return strengths;
  }

  _generateLocationRecommendations(analysis) {
    const recommendations = [];
    
    if (!analysis.physicalLocation.hasPhysicalAddress) {
      recommendations.push({
        category: 'Physical Location',
        priority: 'high',
        title: 'Add Business Address',
        description: 'Include your complete business address for local credibility.',
        impact: 'high',
      });
    }
    
    if (!analysis.businessHours.hasBusinessHours) {
      recommendations.push({
        category: 'Business Hours',
        priority: 'medium',
        title: 'Add Business Hours',
        description: 'Clearly display your business hours for customer convenience.',
        impact: 'medium',
      });
    }
    
    if (!analysis.serviceAreas.hasServiceAreas) {
      recommendations.push({
        category: 'Service Areas',
        priority: 'medium',
        title: 'Define Service Areas',
        description: 'Specify the areas where you provide services.',
        impact: 'medium',
      });
    }
    
    if (!analysis.structuredLocationData.hasAnyStructuredData) {
      recommendations.push({
        category: 'Structured Data',
        priority: 'low',
        title: 'Add Location Schema Markup',
        description: 'Implement schema.org markup for better local search visibility.',
        impact: 'medium',
      });
    }
    
    if (!analysis.localPresence.hasLocalPresence) {
      recommendations.push({
        category: 'Local Presence',
        priority: 'medium',
        title: 'Emphasize Local Connection',
        description: 'Highlight your local presence and community involvement.',
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
    const businessType = this._classifyBusinessType(analysis);
    
    let summary = `Location & Geographic Presence Analysis (Grade: ${grade}, Score: ${score}/100)\n\n`;
    
    summary += `Overall Assessment: `;
    if (score >= 80) {
      summary += `Excellent location information and geographic presence setup. `;
    } else if (score >= 60) {
      summary += `Good location information with some geographic targeting, improvements possible. `;
    } else if (score >= 40) {
      summary += `Basic location information present, needs geographic optimization. `;
    } else {
      summary += `Limited location information, requires significant geographic enhancement. `;
    }
    
    summary += `Business Type: ${businessType}. `;
    
    // Physical location summary
    if (analysis.physicalLocation.addresses.length > 0) {
      summary += `Found ${analysis.physicalLocation.addresses.length} physical address(es). `;
    } else {
      summary += `No physical addresses detected. `;
    }
    
    // Service areas summary
    if (analysis.serviceAreas.areas.length > 0) {
      summary += `Service areas defined for ${analysis.serviceAreas.areas.length} region(s). `;
    } else {
      summary += `Service areas not clearly defined. `;
    }
    
    // Business hours summary
    if (analysis.businessHours.found) {
      summary += `Business hours information available. `;
    } else {
      summary += `Business hours not specified. `;
    }
    
    // Local presence summary
    if (analysis.localPresence.hasLocalPresence) {
      summary += `Strong local business presence indicators found. `;
    } else {
      summary += `Limited local business presence. `;
    }
    
    // Structured data summary
    if (analysis.structuredLocationData.hasAnyStructuredData) {
      summary += `Location-based structured data implemented. `;
    } else {
      summary += `No location structured data found. `;
    }
    
    // Multi-location summary
    if (analysis.multiLocationBusiness.isMultiLocation) {
      summary += `Multi-location business with ${analysis.multiLocationBusiness.locationCount} locations. `;
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
