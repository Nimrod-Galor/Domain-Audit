/**
 * ============================================================================
 * AUDIT COMPARISON REPORT GENERATOR
 * ============================================================================
 * 
 * This module generates comprehensive comparison reports between different audits
 * highlighting progression, improvements, regressions, and trends over time.
 * 
 * @author Nimrod Galor
 * @AI assistant Claude Sonnet 4
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';

/**
 * Audit Comparison Report Generator Class
 */
export class AuditComparisonReportGenerator {
  constructor(auditManager) {
    this.auditManager = auditManager;
  }

  /**
   * Generate comparison report between two audits
   */
  async generateComparisonReport(auditId1, auditId2, options = {}) {
    const outputFormat = options.format || 'html';
    const audits = this.auditManager.listAudits();
    const audit1 = audits.find(a => a.id === auditId1);
    const audit2 = audits.find(a => a.id === auditId2);

    if (!audit1 || !audit2) {
      throw new Error(`One or both audit IDs not found: ${auditId1}, ${auditId2}`);
    }

    // Load audit data
    const audit1Data = await this.loadAuditData(auditId1);
    const audit2Data = await this.loadAuditData(auditId2);

    // Perform comparison analysis
    const comparison = this.performComparisonAnalysis(audit1Data, audit2Data, audit1, audit2);

    // Generate report based on format
    let reportContent;
    let reportPath = null;
    
    if (outputFormat === 'html') {
      reportContent = this.generateHTMLComparisonReport(comparison);
      if (options.saveToFile !== false) {
        const filename = `comparison-${auditId1}-vs-${auditId2}`;
        reportPath = await this.saveComparisonReport(reportContent, filename, 'html', auditId1, auditId2);
      }
    } else if (outputFormat === 'json') {
      reportContent = this.generateJSONComparisonReport(comparison);
      if (options.saveToFile !== false) {
        const filename = `comparison-${auditId1}-vs-${auditId2}`;
        reportPath = await this.saveComparisonReport(reportContent, filename, 'json', auditId1, auditId2);
      }
    } else {
      reportContent = this.generateTextComparisonReport(comparison);
      if (options.saveToFile !== false) {
        const filename = `comparison-${auditId1}-vs-${auditId2}`;
        reportPath = await this.saveComparisonReport(reportContent, filename, 'txt', auditId1, auditId2);
      }
    }

    // Add report path to comparison result
    const result = {
      ...comparison,
      reportContent,
      reportPath,
      format: outputFormat
    };

    // Output to console if requested
    if (options.outputToConsole && outputFormat === 'text') {
      console.log(reportContent);
    }

    return result;
  }

  /**
   * Generate progression report for multiple audits
   */
  async generateProgressionReport(auditIds = null, outputFormat = 'html') {
    const audits = this.auditManager.listAudits();
    
    // Use provided audit IDs or all completed audits
    const targetAudits = auditIds 
      ? audits.filter(a => auditIds.includes(a.id))
      : audits.filter(a => a.status === 'completed').slice(0, 10); // Last 10 completed

    if (targetAudits.length < 2) {
      throw new Error('At least 2 audits are required for progression analysis');
    }

    // Sort by start time
    targetAudits.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Load all audit data
    const auditDataList = [];
    for (const audit of targetAudits) {
      try {
        const data = await this.loadAuditData(audit.id);
        auditDataList.push({ audit, data });
      } catch (error) {
        console.warn(`⚠️  Failed to load data for audit ${audit.id}: ${error.message}`);
      }
    }

    // Perform progression analysis
    const progression = this.performProgressionAnalysis(auditDataList);

    // Generate report
    if (outputFormat === 'html') {
      return this.generateHTMLProgressionReport(progression);
    } else if (outputFormat === 'json') {
      return this.generateJSONProgressionReport(progression);
    } else {
      return this.generateTextProgressionReport(progression);
    }
  }

  /**
   * Load audit data from state file
   */
  async loadAuditData(auditId) {
    const auditDir = path.resolve(this.auditManager.baseAuditDir, auditId);
    
    // Check if the audit directory exists
    if (!fs.existsSync(auditDir)) {
      throw new Error(`Audit directory not found for audit ${auditId}`);
    }

    // Try different possible state file names and locations
    const possibleStateFiles = [
      path.resolve(auditDir, `${auditId}-crawl-state.json`),
      path.resolve(auditDir, 'crawl-state.json'),
      path.resolve(this.auditManager.baseAuditDir, `${auditId}-crawl-state.json`)
    ];

    let stateFilePath = null;
    for (const filePath of possibleStateFiles) {
      if (fs.existsSync(filePath)) {
        stateFilePath = filePath;
        break;
      }
    }

    if (!stateFilePath) {
      throw new Error(`State file not found for audit ${auditId}. Checked: ${possibleStateFiles.join(', ')}`);
    }

    const rawData = fs.readFileSync(stateFilePath, 'utf-8');
    return JSON.parse(rawData);
  }

  /**
   * Perform detailed comparison analysis between two audits
   */
  performComparisonAnalysis(data1, data2, audit1, audit2) {
    const comparison = {
      metadata: {
        audit1: audit1,
        audit2: audit2,
        comparisonDate: new Date().toISOString(),
        timeBetweenAudits: this.calculateTimeDifference(audit1.startTime, audit2.startTime)
      },
      metrics: this.compareMetrics(data1, data2),
      links: this.compareLinks(data1, data2),
      performance: this.comparePerformance(data1, data2),
      issues: this.compareIssues(data1, data2),
      pages: this.comparePages(data1, data2),
      summary: {}
    };

    // Generate summary
    comparison.summary = this.generateComparisonSummary(comparison);
    
    return comparison;
  }

  /**
   * Compare basic metrics between audits
   */
  compareMetrics(data1, data2) {
    const getMetrics = (data) => ({
      totalPages: Object.keys(data.stats || {}).length,
      totalExternalLinks: Object.keys(data.externalLinks || {}).length,
      totalBadRequests: Object.keys(data.badRequests || {}).length,
      totalMailtoLinks: Object.keys(data.mailtoLinks || {}).length,
      totalTelLinks: Object.keys(data.telLinks || {}).length,
      pageDataSize: data.pageDataSize || 0
    });

    const metrics1 = getMetrics(data1);
    const metrics2 = getMetrics(data2);
    const changes = {};

    for (const [key, value1] of Object.entries(metrics1)) {
      const value2 = metrics2[key];
      const change = value2 - value1;
      const changePercent = value1 > 0 ? Math.round((change / value1) * 100) : (value2 > 0 ? 100 : 0);
      
      changes[key] = {
        before: value1,
        after: value2,
        change: change,
        changePercent: changePercent,
        trend: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'
      };
    }

    return changes;
  }

  /**
   * Compare link status between audits
   */
  compareLinks(data1, data2) {
    const links1 = data1.externalLinks || {};
    const links2 = data2.externalLinks || {};
    
    const allUrls = new Set([...Object.keys(links1), ...Object.keys(links2)]);
    const linkChanges = {
      fixed: [], // Previously broken, now working
      broken: [], // Previously working, now broken
      new: [], // New links in audit2
      removed: [], // Links that were in audit1 but not audit2
      stable: [] // Links with same status
    };

    for (const url of allUrls) {
      const link1 = links1[url];
      const link2 = links2[url];

      if (!link1 && link2) {
        linkChanges.new.push({ url, status: link2.status });
      } else if (link1 && !link2) {
        linkChanges.removed.push({ url, status: link1.status });
      } else if (link1 && link2) {
        const status1 = link1.status;
        const status2 = link2.status;
        
        if (status1 !== 200 && status2 === 200) {
          linkChanges.fixed.push({ url, before: status1, after: status2 });
        } else if (status1 === 200 && status2 !== 200) {
          linkChanges.broken.push({ url, before: status1, after: status2 });
        } else {
          linkChanges.stable.push({ url, status: status2 });
        }
      }
    }

    return linkChanges;
  }

  /**
   * Compare performance metrics
   */
  comparePerformance(data1, data2) {
    // Extract performance data from page data if available
    const performance1 = this.extractPerformanceMetrics(data1);
    const performance2 = this.extractPerformanceMetrics(data2);

    return {
      averageLoadTime: {
        before: performance1.averageLoadTime,
        after: performance2.averageLoadTime,
        change: performance2.averageLoadTime - performance1.averageLoadTime,
        trend: performance2.averageLoadTime < performance1.averageLoadTime ? 'improved' : 'degraded'
      },
      seoScores: {
        before: performance1.averageSeoScore,
        after: performance2.averageSeoScore,
        change: performance2.averageSeoScore - performance1.averageSeoScore,
        trend: performance2.averageSeoScore > performance1.averageSeoScore ? 'improved' : 'degraded'
      },
      accessibilityScores: {
        before: performance1.averageAccessibilityScore,
        after: performance2.averageAccessibilityScore,
        change: performance2.averageAccessibilityScore - performance1.averageAccessibilityScore,
        trend: performance2.averageAccessibilityScore > performance1.averageAccessibilityScore ? 'improved' : 'degraded'
      }
    };
  }

  /**
   * Extract performance metrics from audit data
   */
  extractPerformanceMetrics(data) {
    const stats = data.stats || {};
    const pages = Object.values(stats);
    
    if (pages.length === 0) {
      return { averageLoadTime: 0, averageSeoScore: 0, averageAccessibilityScore: 0 };
    }

    const loadTimes = pages.map(p => p.loadTime || 0).filter(t => t > 0);
    const seoScores = pages.map(p => p.seoScore || 0).filter(s => s > 0);
    const accessibilityScores = pages.map(p => p.accessibilityScore || 0).filter(s => s > 0);

    return {
      averageLoadTime: loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0,
      averageSeoScore: seoScores.length > 0 ? seoScores.reduce((a, b) => a + b, 0) / seoScores.length : 0,
      averageAccessibilityScore: accessibilityScores.length > 0 ? accessibilityScores.reduce((a, b) => a + b, 0) / accessibilityScores.length : 0
    };
  }

  /**
   * Compare issues between audits
   */
  compareIssues(data1, data2) {
    const badRequests1 = data1.badRequests || {};
    const badRequests2 = data2.badRequests || {};

    return {
      resolved: Object.keys(badRequests1).filter(url => !badRequests2[url]),
      new: Object.keys(badRequests2).filter(url => !badRequests1[url]),
      persistent: Object.keys(badRequests1).filter(url => badRequests2[url]),
      total: {
        before: Object.keys(badRequests1).length,
        after: Object.keys(badRequests2).length
      }
    };
  }

  /**
   * Compare pages between audits
   */
  comparePages(data1, data2) {
    const pages1 = new Set(Object.keys(data1.stats || {}));
    const pages2 = new Set(Object.keys(data2.stats || {}));
    
    return {
      added: [...pages2].filter(p => !pages1.has(p)),
      removed: [...pages1].filter(p => !pages2.has(p)),
      common: [...pages1].filter(p => pages2.has(p)),
      total: {
        before: pages1.size,
        after: pages2.size
      }
    };
  }

  /**
   * Generate comparison summary
   */
  generateComparisonSummary(comparison) {
    const improvements = [];
    const regressions = [];
    const highlights = [];

    // Analyze metrics changes
    for (const [metric, data] of Object.entries(comparison.metrics)) {
      if (data.trend === 'increase' && ['totalPages', 'pageDataSize'].includes(metric)) {
        improvements.push(`${metric}: +${data.change} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent}%)`);
      } else if (data.trend === 'decrease' && ['totalBadRequests'].includes(metric)) {
        improvements.push(`${metric}: ${data.change} (${data.changePercent}%)`);
      } else if (data.trend === 'increase' && ['totalBadRequests'].includes(metric)) {
        regressions.push(`${metric}: +${data.change} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent}%)`);
      }
    }

    // Analyze link changes
    if (comparison.links.fixed.length > 0) {
      improvements.push(`Fixed ${comparison.links.fixed.length} broken links`);
    }
    if (comparison.links.broken.length > 0) {
      regressions.push(`${comparison.links.broken.length} links became broken`);
    }

    // Overall assessment
    const overallTrend = improvements.length > regressions.length ? 'positive' : 
                        regressions.length > improvements.length ? 'negative' : 'neutral';

    return {
      overallTrend,
      improvements,
      regressions,
      highlights,
      score: Math.max(0, improvements.length - regressions.length)
    };
  }

  /**
   * Perform progression analysis across multiple audits
   */
  performProgressionAnalysis(auditDataList) {
    const progression = {
      metadata: {
        auditCount: auditDataList.length,
        timespan: this.calculateTimeDifference(
          auditDataList[0].audit.startTime,
          auditDataList[auditDataList.length - 1].audit.startTime
        ),
        analysisDate: new Date().toISOString()
      },
      trends: this.analyzeTrends(auditDataList),
      milestones: this.identifyMilestones(auditDataList),
      recommendations: this.generateRecommendations(auditDataList)
    };

    return progression;
  }

  /**
   * Analyze trends across multiple audits
   */
  analyzeTrends(auditDataList) {
    const trends = {
      pageCount: [],
      linkHealth: [],
      performance: [],
      issues: []
    };

    for (const { audit, data } of auditDataList) {
      const metrics = {
        date: audit.startTime,
        pageCount: Object.keys(data.stats || {}).length,
        linkHealth: this.calculateLinkHealthScore(data),
        performance: this.calculatePerformanceScore(data),
        issues: Object.keys(data.badRequests || {}).length
      };

      trends.pageCount.push({ date: metrics.date, value: metrics.pageCount });
      trends.linkHealth.push({ date: metrics.date, value: metrics.linkHealth });
      trends.performance.push({ date: metrics.date, value: metrics.performance });
      trends.issues.push({ date: metrics.date, value: metrics.issues });
    }

    return trends;
  }

  /**
   * Calculate link health score
   */
  calculateLinkHealthScore(data) {
    const externalLinks = Object.values(data.externalLinks || {});
    if (externalLinks.length === 0) return 100;
    
    const workingLinks = externalLinks.filter(link => link.status === 200).length;
    return Math.round((workingLinks / externalLinks.length) * 100);
  }

  /**
   * Calculate overall performance score
   */
  calculatePerformanceScore(data) {
    const performance = this.extractPerformanceMetrics(data);
    // Weighted average of different performance aspects
    return Math.round(
      (performance.averageSeoScore * 0.4) +
      (performance.averageAccessibilityScore * 0.3) +
      ((performance.averageLoadTime > 0 ? Math.max(0, 100 - performance.averageLoadTime / 10) : 50) * 0.3)
    );
  }

  /**
   * Identify significant milestones in progression
   */
  identifyMilestones(auditDataList) {
    const milestones = [];
    
    for (let i = 1; i < auditDataList.length; i++) {
      const prev = auditDataList[i - 1];
      const curr = auditDataList[i];
      
      const prevPages = Object.keys(prev.data.stats || {}).length;
      const currPages = Object.keys(curr.data.stats || {}).length;
      
      // Significant page count increase
      if (currPages > prevPages * 1.5) {
        milestones.push({
          type: 'growth',
          date: curr.audit.startTime,
          description: `Significant site growth: ${prevPages} → ${currPages} pages (+${Math.round(((currPages - prevPages) / prevPages) * 100)}%)`
        });
      }
      
      // Major issue resolution
      const prevIssues = Object.keys(prev.data.badRequests || {}).length;
      const currIssues = Object.keys(curr.data.badRequests || {}).length;
      
      if (prevIssues > 5 && currIssues < prevIssues * 0.5) {
        milestones.push({
          type: 'improvement',
          date: curr.audit.startTime,
          description: `Major issue resolution: ${prevIssues} → ${currIssues} issues (-${Math.round(((prevIssues - currIssues) / prevIssues) * 100)}%)`
        });
      }
    }
    
    return milestones;
  }

  /**
   * Generate recommendations based on progression analysis
   */
  generateRecommendations(auditDataList) {
    const recommendations = [];
    const latest = auditDataList[auditDataList.length - 1];
    
    // Analyze current issues
    const issues = Object.keys(latest.data.badRequests || {}).length;
    if (issues > 0) {
      recommendations.push({
        priority: 'high',
        category: 'reliability',
        description: `Address ${issues} broken links to improve site reliability`
      });
    }
    
    // Analyze link health trend
    const linkHealthTrend = this.calculateTrend(
      auditDataList.map(({ data }) => this.calculateLinkHealthScore(data))
    );
    
    if (linkHealthTrend < -5) {
      recommendations.push({
        priority: 'medium',
        category: 'maintenance',
        description: 'Link health is declining - implement regular link monitoring'
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate trend from array of values
   */
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    
    return first > 0 ? ((last - first) / first) * 100 : 0;
  }

  /**
   * Calculate time difference between two dates
   */
  calculateTimeDifference(date1, date2) {
    const diff = Math.abs(new Date(date2) - new Date(date1));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  }

  /**
   * Generate HTML comparison report
   */
  generateHTMLComparisonReport(comparison) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audit Comparison Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { color: #2c3e50; margin-bottom: 10px; }
        .audit-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .audit-card { padding: 20px; border: 1px solid #ddd; border-radius: 6px; background: #f8f9fa; }
        .summary { margin-bottom: 30px; padding: 20px; border-radius: 6px; }
        .summary.positive { background: #d4edda; border: 1px solid #c3e6cb; }
        .summary.negative { background: #f8d7da; border: 1px solid #f5c6cb; }
        .summary.neutral { background: #e2e3e5; border: 1px solid #d1d3d5; }
        .section { margin-bottom: 30px; }
        .section h3 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .metric-card { padding: 15px; border: 1px solid #ddd; border-radius: 6px; }
        .metric-value { font-size: 1.2em; font-weight: bold; }
        .trend-up { color: #27ae60; }
        .trend-down { color: #e74c3c; }
        .trend-stable { color: #7f8c8d; }
        .changes-list { list-style: none; padding: 0; }
        .changes-list li { padding: 8px 12px; margin: 5px 0; border-radius: 4px; }
        .change-positive { background: #d4edda; }
        .change-negative { background: #f8d7da; }
        .change-neutral { background: #e2e3e5; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .status-200 { color: #27ae60; }
        .status-error { color: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Audit Comparison Report</h1>
            <p>Detailed analysis of changes between audit runs</p>
        </div>

        <div class="audit-info">
            <div class="audit-card">
                <h3>📅 Audit A (Baseline)</h3>
                <p><strong>ID:</strong> ${comparison.metadata.audit1.id}</p>
                <p><strong>Date:</strong> ${comparison.metadata.audit1.formattedStartTime}</p>
                <p><strong>Duration:</strong> ${comparison.metadata.audit1.formattedDuration || 'N/A'}</p>
                <p><strong>Status:</strong> ${comparison.metadata.audit1.status}</p>
            </div>
            <div class="audit-card">
                <h3>📅 Audit B (Comparison)</h3>
                <p><strong>ID:</strong> ${comparison.metadata.audit2.id}</p>
                <p><strong>Date:</strong> ${comparison.metadata.audit2.formattedStartTime}</p>
                <p><strong>Duration:</strong> ${comparison.metadata.audit2.formattedDuration || 'N/A'}</p>
                <p><strong>Status:</strong> ${comparison.metadata.audit2.status}</p>
            </div>
        </div>

        <div class="summary ${comparison.summary.overallTrend}">
            <h3>📊 Summary</h3>
            <p><strong>Overall Trend:</strong> ${comparison.summary.overallTrend.toUpperCase()}</p>
            <p><strong>Time Between Audits:</strong> ${comparison.metadata.timeBetweenAudits}</p>
            <p><strong>Improvement Score:</strong> ${comparison.summary.score}</p>
            
            ${comparison.summary.improvements.length > 0 ? `
            <h4>✅ Improvements:</h4>
            <ul class="changes-list">
                ${comparison.summary.improvements.map(imp => `<li class="change-positive">${imp}</li>`).join('')}
            </ul>
            ` : ''}
            
            ${comparison.summary.regressions.length > 0 ? `
            <h4>❌ Regressions:</h4>
            <ul class="changes-list">
                ${comparison.summary.regressions.map(reg => `<li class="change-negative">${reg}</li>`).join('')}
            </ul>
            ` : ''}
        </div>

        <div class="section">
            <h3>📈 Metrics Comparison</h3>
            <div class="metrics-grid">
                ${Object.entries(comparison.metrics).map(([metric, data]) => `
                <div class="metric-card">
                    <h4>${this.formatMetricName(metric)}</h4>
                    <div class="metric-value ${data.trend === 'increase' ? 'trend-up' : data.trend === 'decrease' ? 'trend-down' : 'trend-stable'}">
                        ${data.before} → ${data.after}
                    </div>
                    <p>Change: ${data.change > 0 ? '+' : ''}${data.change} (${data.changePercent > 0 ? '+' : ''}${data.changePercent}%)</p>
                </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h3>🔗 Link Changes</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h4>✅ Fixed Links</h4>
                    <div class="metric-value trend-up">${comparison.links.fixed.length}</div>
                    ${comparison.links.fixed.length > 0 ? `
                        <details>
                            <summary>View Details</summary>
                            <ul>
                                ${comparison.links.fixed.slice(0, 10).map(link => `<li>${link.url} (${link.before} → ${link.after})</li>`).join('')}
                                ${comparison.links.fixed.length > 10 ? `<li>... and ${comparison.links.fixed.length - 10} more</li>` : ''}
                            </ul>
                        </details>
                    ` : ''}
                </div>
                <div class="metric-card">
                    <h4>❌ Broken Links</h4>
                    <div class="metric-value trend-down">${comparison.links.broken.length}</div>
                    ${comparison.links.broken.length > 0 ? `
                        <details>
                            <summary>View Details</summary>
                            <ul>
                                ${comparison.links.broken.slice(0, 10).map(link => `<li>${link.url} (${link.before} → ${link.after})</li>`).join('')}
                                ${comparison.links.broken.length > 10 ? `<li>... and ${comparison.links.broken.length - 10} more</li>` : ''}
                            </ul>
                        </details>
                    ` : ''}
                </div>
                <div class="metric-card">
                    <h4>🆕 New Links</h4>
                    <div class="metric-value">${comparison.links.new.length}</div>
                </div>
                <div class="metric-card">
                    <h4>🗑️ Removed Links</h4>
                    <div class="metric-value">${comparison.links.removed.length}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>🏃‍♂️ Performance Comparison</h3>
            <div class="metrics-grid">
                ${Object.entries(comparison.performance).map(([metric, data]) => `
                <div class="metric-card">
                    <h4>${this.formatMetricName(metric)}</h4>
                    <div class="metric-value ${data.trend === 'improved' ? 'trend-up' : 'trend-down'}">
                        ${data.before.toFixed(2)} → ${data.after.toFixed(2)}
                    </div>
                    <p>Change: ${data.change > 0 ? '+' : ''}${data.change.toFixed(2)} (${data.trend})</p>
                </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h3>📄 Page Changes</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h4>Total Pages</h4>
                    <div class="metric-value">${comparison.pages.total.before} → ${comparison.pages.total.after}</div>
                    <p>Change: ${comparison.pages.total.after - comparison.pages.total.before}</p>
                </div>
                <div class="metric-card">
                    <h4>Added Pages</h4>
                    <div class="metric-value trend-up">${comparison.pages.added.length}</div>
                </div>
                <div class="metric-card">
                    <h4>Removed Pages</h4>
                    <div class="metric-value trend-down">${comparison.pages.removed.length}</div>
                </div>
                <div class="metric-card">
                    <h4>Common Pages</h4>
                    <div class="metric-value">${comparison.pages.common.length}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>🔧 Issues Comparison</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <h4>Total Issues</h4>
                    <div class="metric-value">${comparison.issues.total.before} → ${comparison.issues.total.after}</div>
                    <p>Change: ${comparison.issues.total.after - comparison.issues.total.before}</p>
                </div>
                <div class="metric-card">
                    <h4>Resolved Issues</h4>
                    <div class="metric-value trend-up">${comparison.issues.resolved.length}</div>
                </div>
                <div class="metric-card">
                    <h4>New Issues</h4>
                    <div class="metric-value trend-down">${comparison.issues.new.length}</div>
                </div>
                <div class="metric-card">
                    <h4>Persistent Issues</h4>
                    <div class="metric-value">${comparison.issues.persistent.length}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <p><small>Report generated on ${new Date().toLocaleString()}</small></p>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Format metric names for display
   */
  formatMetricName(metric) {
    const names = {
      totalPages: 'Total Pages',
      totalExternalLinks: 'External Links',
      totalBadRequests: 'Bad Requests',
      totalMailtoLinks: 'Email Links',
      totalTelLinks: 'Phone Links',
      pageDataSize: 'Page Data Size',
      averageLoadTime: 'Avg Load Time',
      seoScores: 'SEO Scores',
      accessibilityScores: 'Accessibility Scores'
    };
    return names[metric] || metric;
  }

  /**
   * Generate text comparison report
   */
  generateTextComparisonReport(comparison) {
    let report = '';
    
    report += '='.repeat(80) + '\n';
    report += 'AUDIT COMPARISON REPORT\n';
    report += '='.repeat(80) + '\n\n';
    
    report += `Audit A: ${comparison.metadata.audit1.id} (${comparison.metadata.audit1.formattedStartTime})\n`;
    report += `Audit B: ${comparison.metadata.audit2.id} (${comparison.metadata.audit2.formattedStartTime})\n`;
    report += `Time Between: ${comparison.metadata.timeBetweenAudits}\n\n`;
    
    report += 'SUMMARY\n';
    report += '-'.repeat(40) + '\n';
    report += `Overall Trend: ${comparison.summary.overallTrend.toUpperCase()}\n`;
    report += `Improvement Score: ${comparison.summary.score}\n\n`;
    
    if (comparison.summary.improvements.length > 0) {
      report += 'Improvements:\n';
      comparison.summary.improvements.forEach(imp => {
        report += `  ✅ ${imp}\n`;
      });
      report += '\n';
    }
    
    if (comparison.summary.regressions.length > 0) {
      report += 'Regressions:\n';
      comparison.summary.regressions.forEach(reg => {
        report += `  ❌ ${reg}\n`;
      });
      report += '\n';
    }
    
    return report;
  }

  /**
   * Generate JSON comparison report
   */
  generateJSONComparisonReport(comparison) {
    return JSON.stringify(comparison, null, 2);
  }

  /**
   * Save report to file
   */
  async saveReport(content, filename, format = 'html') {
    const extension = format === 'html' ? '.html' : format === 'json' ? '.json' : '.txt';
    const fullPath = filename.endsWith(extension) ? filename : filename + extension;
    
    fs.writeFileSync(fullPath, content, 'utf-8');
    return fullPath;
  }

  /**
   * Save comparison report to domain audit directory
   */
  async saveComparisonReport(content, filename, format = 'html', auditId1, auditId2) {
    // Create comparisons directory in the domain folder
    const comparisonsDir = path.resolve(this.auditManager.baseAuditDir, 'comparisons');
    if (!fs.existsSync(comparisonsDir)) {
      fs.mkdirSync(comparisonsDir, { recursive: true });
    }

    const extension = format === 'html' ? '.html' : format === 'json' ? '.json' : '.txt';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const fullFilename = `${filename}-${timestamp}${extension}`;
    const fullPath = path.resolve(comparisonsDir, fullFilename);
    
    try {
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`📄 Comparison report saved: ${fullPath}`);
      return fullPath;
    } catch (error) {
      console.warn(`⚠️  Failed to save comparison report: ${error.message}`);
      return null;
    }
  }
}

export default AuditComparisonReportGenerator;
