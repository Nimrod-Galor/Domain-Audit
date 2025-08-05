/**
 * Script to create test notifications
 * Run this to populate the database with sample notifications
 */
import { initializeDatabase } from '../models/database.js';
import { Notification } from '../models/Notification.js';

async function createTestNotifications() {
    try {
        console.log('🚀 Initializing database...');
        initializeDatabase();
        
        console.log('📋 Creating notification table...');
        await Notification.createTable();
        
        console.log('➕ Creating test notifications...');
        
        // Test notifications for user ID 1 (assuming the logged-in user)
        const userId = 1;
        
        await Notification.create(
            userId,
            'message',
            'Welcome to SiteScope!',
            'Your account has been successfully set up. You can now start auditing websites and tracking their performance.'
        );
        
        await Notification.create(
            userId,
            'alert',
            'Audit Limit Warning',
            'You have used 80% of your monthly audit quota. Consider upgrading your plan for unlimited audits.'
        );
        
        await Notification.create(
            userId,
            'critical',
            'Critical Issues Found',
            'Your recent audit of example.com found 15 critical SEO issues that need immediate attention. Review the full report for details.'
        );
        
        await Notification.create(
            userId,
            'message',
            'New Feature Available',
            'We\'ve added a new performance monitoring feature. Check out the enhanced audit reports with Core Web Vitals metrics.'
        );
        
        await Notification.create(
            userId,
            'alert',
            'Scheduled Audit Failed',
            'The scheduled weekly audit for your website failed due to connectivity issues. Please check your domain settings.'
        );
        
        console.log('✅ Test notifications created successfully!');
        console.log('🔔 You should now see a notification badge in the header');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test notifications:', error);
        process.exit(1);
    }
}

createTestNotifications();
