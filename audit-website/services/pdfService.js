/**
 * PDF Generation Service
 * Converts HTML audit reports to downloadable PDF files using Puppeteer
 * Author: Domain Audit Tool
 * Date: August 5, 2025
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
    constructor() {
        this.browser = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Puppeteer browser instance
     */
    async initialize() {
        if (!this.isInitialized) {
            try {
                this.browser = await puppeteer.launch({
                    headless: 'new', // Use new headless mode
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--disable-gpu',
                        '--disable-web-security',
                        '--disable-features=VizDisplayCompositor',
                        '--no-first-run',
                        '--no-default-browser-check',
                        '--disable-background-timer-throttling',
                        '--disable-backgrounding-occluded-windows',
                        '--disable-renderer-backgrounding'
                    ],
                    timeout: 30000
                });
                this.isInitialized = true;
                console.log('✅ PDF Service initialized successfully');
            } catch (error) {
                console.error('❌ Failed to initialize PDF Service:', error);
                throw error;
            }
        }
    }

    /**
     * Generate PDF from audit results data
     * @param {Object} auditData - The audit results data
     * @param {Object} options - PDF generation options
     * @returns {Buffer} PDF buffer
     */
    async generatePDFFromData(auditData, options = {}) {
        let page = null;
        try {
            await this.initialize();

            page = await this.browser.newPage();
            
            // Set viewport for consistent rendering
            await page.setViewport({ width: 1200, height: 800 });

            // Generate HTML content for PDF
            const htmlContent = this.generatePDFHTML(auditData, options);

            // Set the HTML content
            await page.setContent(htmlContent, { 
                waitUntil: ['networkidle0', 'domcontentloaded'],
                timeout: 30000 
            });

            // Wait a bit for content to render
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate PDF with optimized settings
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                displayHeaderFooter: true,
                headerTemplate: `
                    <div style="font-size: 10px; margin: 0 auto; color: #666;">
                        Domain Audit Report - Generated on ${new Date().toLocaleDateString()}
                    </div>
                `,
                footerTemplate: `
                    <div style="font-size: 10px; margin: 0 auto; color: #666;">
                        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                    </div>
                `,
                ...options
            });

            console.log(`✅ PDF generated successfully for ${auditData.domain || 'unknown domain'}`);
            return pdfBuffer;

        } catch (error) {
            console.error('❌ PDF generation failed:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        } finally {
            if (page && !page.isClosed()) {
                try {
                    await page.close();
                } catch (closeError) {
                    console.warn('Warning: Failed to close page:', closeError.message);
                }
            }
        }
    }

    /**
     * Generate PDF from existing HTML file
     * @param {string} htmlFilePath - Path to HTML file
     * @param {Object} options - PDF generation options
     * @returns {Buffer} PDF buffer
     */
    async generatePDFFromHTML(htmlFilePath, options = {}) {
        let page = null;
        try {
            await this.initialize();

            page = await this.browser.newPage();
            
            // Set viewport for consistent rendering
            await page.setViewport({ width: 1200, height: 800 });

            // Load HTML file
            await page.goto(`file://${htmlFilePath}`, { 
                waitUntil: ['networkidle0', 'domcontentloaded'],
                timeout: 30000 
            });

            // Wait a bit for content to render
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                displayHeaderFooter: true,
                headerTemplate: `
                    <div style="font-size: 10px; margin: 0 auto; color: #666;">
                        Domain Audit Report - Generated on ${new Date().toLocaleDateString()}
                    </div>
                `,
                footerTemplate: `
                    <div style="font-size: 10px; margin: 0 auto; color: #666;">
                        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                    </div>
                `,
                ...options
            });
            
            console.log(`✅ PDF generated successfully from ${htmlFilePath}`);
            return pdfBuffer;

        } catch (error) {
            console.error('❌ PDF generation from HTML failed:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        } finally {
            if (page && !page.isClosed()) {
                try {
                    await page.close();
                } catch (closeError) {
                    console.warn('Warning: Failed to close page:', closeError.message);
                }
            }
        }
    }

    /**
     * Generate optimized HTML content for PDF rendering
     * @param {Object} auditData - Audit results data
     * @param {Object} options - HTML generation options
     * @returns {string} HTML content
     */
    generatePDFHTML(auditData, options = {}) {
        const {
            domain = 'Unknown Domain',
            grade = 'N/A',
            score = 0,
            totalPages = 0,
            totalLinks = 0,
            internalLinks = 0,
            externalLinks = 0,
            brokenLinks = 0,
            emails = [],
            phoneNumbers = [],
            pages = [],
            analysis = {},
            timestamp = new Date().toISOString()
        } = auditData;

        const includeDetailed = options.includeDetailed !== false;
        const brandColor = options.brandColor || '#007bff';

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Domain Audit Report - ${domain}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, ${brandColor}, #0056b3);
            color: white;
            border-radius: 8px;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .grade-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .grade {
            font-size: 72px;
            font-weight: bold;
            color: ${this.getGradeColor(grade)};
            margin-bottom: 10px;
        }
        
        .score {
            font-size: 24px;
            color: #666;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            text-align: center;
        }
        
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: ${brandColor};
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .section {
            margin: 30px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }
        
        .section h2 {
            font-size: 20px;
            margin-bottom: 15px;
            color: ${brandColor};
            border-bottom: 2px solid #f8f9fa;
            padding-bottom: 10px;
        }
        
        .section h3 {
            font-size: 16px;
            margin: 15px 0 10px 0;
            color: #333;
        }
        
        .list-item {
            padding: 8px 0;
            border-bottom: 1px solid #f8f9fa;
        }
        
        .list-item:last-child {
            border-bottom: none;
        }
        
        .status-ok { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-error { color: #dc3545; }
        
        .page-break {
            page-break-before: always;
        }
        
        .footer {
            margin-top: 40px;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #dee2e6;
        }
        
        @media print {
            .container {
                padding: 10px;
            }
            
            .section {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Domain Audit Report</h1>
            <p>${domain}</p>
            <p>Generated on ${new Date(timestamp).toLocaleString()}</p>
        </div>

        <!-- Grade Section -->
        <div class="grade-section">
            <div class="grade">${grade}</div>
            <div class="score">${score}/100 Points</div>
        </div>

        <!-- Statistics Overview -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalPages}</div>
                <div class="stat-label">Total Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalLinks}</div>
                <div class="stat-label">Total Links</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${internalLinks}</div>
                <div class="stat-label">Internal Links</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${externalLinks}</div>
                <div class="stat-label">External Links</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${brokenLinks}</div>
                <div class="stat-label">Broken Links</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${emails.length}</div>
                <div class="stat-label">Email Addresses</div>
            </div>
        </div>

        <!-- Link Analysis -->
        <div class="section">
            <h2>Link Analysis Summary</h2>
            <div class="stats-grid">
                <div>
                    <h3>Internal Links</h3>
                    <p>${internalLinks} links pointing to pages within ${domain}</p>
                </div>
                <div>
                    <h3>External Links</h3>
                    <p>${externalLinks} links pointing to external websites</p>
                </div>
                <div>
                    <h3>Broken Links</h3>
                    <p class="${brokenLinks > 0 ? 'status-error' : 'status-ok'}">
                        ${brokenLinks} broken or unreachable links found
                    </p>
                </div>
            </div>
        </div>

        ${emails.length > 0 ? `
        <!-- Email Addresses -->
        <div class="section">
            <h2>Email Addresses Found (${emails.length})</h2>
            ${emails.slice(0, 20).map(email => `
                <div class="list-item">${email}</div>
            `).join('')}
            ${emails.length > 20 ? `<div class="list-item"><em>... and ${emails.length - 20} more</em></div>` : ''}
        </div>
        ` : ''}

        ${phoneNumbers.length > 0 ? `
        <!-- Phone Numbers -->
        <div class="section">
            <h2>Phone Numbers Found (${phoneNumbers.length})</h2>
            ${phoneNumbers.slice(0, 10).map(phone => `
                <div class="list-item">${phone}</div>
            `).join('')}
            ${phoneNumbers.length > 10 ? `<div class="list-item"><em>... and ${phoneNumbers.length - 10} more</em></div>` : ''}
        </div>
        ` : ''}

        ${includeDetailed && pages.length > 0 ? `
        <!-- Detailed Page Analysis -->
        <div class="section page-break">
            <h2>Detailed Page Analysis</h2>
            ${pages.slice(0, 50).map(page => `
                <div class="list-item">
                    <strong>${page.url || page.title || 'Unknown Page'}</strong>
                    ${page.status ? `<span class="status-${page.status === 200 ? 'ok' : 'error'}">(${page.status})</span>` : ''}
                    ${page.links ? `<br><small>${page.links.length} links found</small>` : ''}
                </div>
            `).join('')}
            ${pages.length > 50 ? `<div class="list-item"><em>... and ${pages.length - 50} more pages</em></div>` : ''}
        </div>
        ` : ''}

        <!-- Recommendations -->
        <div class="section">
            <h2>Recommendations</h2>
            ${this.generateRecommendations(auditData)}
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This report was generated by Domain Audit Tool</p>
            <p>For more information, visit our website or contact support</p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Get color for grade display
     */
    getGradeColor(grade) {
        const colors = {
            'A': '#28a745',
            'B': '#6c757d', 
            'C': '#ffc107',
            'D': '#fd7e14',
            'F': '#dc3545'
        };
        return colors[grade] || '#6c757d';
    }

    /**
     * Generate recommendations based on audit data
     */
    generateRecommendations(auditData) {
        const recommendations = [];
        
        if (auditData.brokenLinks > 0) {
            recommendations.push(`<div class="list-item status-error">Fix ${auditData.brokenLinks} broken links to improve user experience and SEO</div>`);
        }
        
        if (auditData.externalLinks > auditData.internalLinks * 2) {
            recommendations.push(`<div class="list-item status-warning">Consider balancing external links (${auditData.externalLinks}) with more internal links (${auditData.internalLinks})</div>`);
        }
        
        if (auditData.totalPages < 5) {
            recommendations.push(`<div class="list-item status-warning">Website has only ${auditData.totalPages} pages. Consider adding more content for better SEO</div>`);
        }
        
        if (auditData.emails.length === 0) {
            recommendations.push(`<div class="list-item status-warning">No contact email addresses found. Consider adding contact information for better user experience</div>`);
        }
        
        if (recommendations.length === 0) {
            recommendations.push(`<div class="list-item status-ok">Great job! No major issues found. Your website structure looks good.</div>`);
        }
        
        return recommendations.join('');
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.isInitialized = false;
            console.log('✅ PDF Service cleaned up');
        }
    }

    /**
     * Get PDF generation status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            browserConnected: !!this.browser
        };
    }
}

// Export singleton instance
export default new PDFService();
