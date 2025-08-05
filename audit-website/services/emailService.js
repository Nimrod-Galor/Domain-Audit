const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    generateVerificationToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    async sendVerificationEmail(email, firstName, token) {
        const verificationUrl = `${process.env.VERIFICATION_URL_BASE || 'http://localhost:3000'}/auth/verify-email/${token}`;
        
        const mailOptions = {
            from: `"Domain Audit" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Verify Your Email Address - Domain Audit',
            html: this.getVerificationEmailTemplate(firstName, verificationUrl)
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Verification email sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Error sending verification email:', error.message);
            return false;
        }
    }

    getVerificationEmailTemplate(firstName, verificationUrl) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Verify Your Email</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f8f9fa; }
                .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Domain Audit!</h1>
                </div>
                <div class="content">
                    <h2>Hi ${firstName || 'there'}!</h2>
                    <p>Thank you for registering with Domain Audit. To complete your registration and start using our domain analysis tools, please verify your email address.</p>
                    
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    </div>
                    
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px;">
                        ${verificationUrl}
                    </p>
                    
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    
                    <p>If you didn't create this account, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 Domain Audit. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async sendWelcomeEmail(email, firstName) {
        const mailOptions = {
            from: `"Domain Audit" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Welcome to Domain Audit!',
            html: this.getWelcomeEmailTemplate(firstName)
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Welcome email sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Error sending welcome email:', error.message);
            return false;
        }
    }

    getWelcomeEmailTemplate(firstName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome to Domain Audit</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #28a745; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f8f9fa; }
                .feature { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Email Verified Successfully!</h1>
                </div>
                <div class="content">
                    <h2>Welcome ${firstName || 'to Domain Audit'}!</h2>
                    <p>Your email has been verified and your account is now fully active. You can now access all our domain analysis features:</p>
                    
                    <div class="feature">
                        <h3>🔍 Domain Analysis</h3>
                        <p>Comprehensive domain auditing with detailed reports</p>
                    </div>
                    
                    <div class="feature">
                        <h3>🔗 Link Monitoring</h3>
                        <p>Track internal and external links across your domains</p>
                    </div>
                    
                    <div class="feature">
                        <h3>📊 Performance Insights</h3>
                        <p>Get detailed performance metrics and recommendations</p>
                    </div>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.VERIFICATION_URL_BASE || 'http://localhost:3000'}/dashboard" 
                           style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                            Start Your First Audit
                        </a>
                    </p>
                    
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2025 Domain Audit. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new EmailService();
