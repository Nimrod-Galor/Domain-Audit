import { Notification } from './models/Notification.js';
import { query } from './models/database.js';

/**
 * Test script to create banner notifications for testing
 */

async function createTestBannerNotifications() {
    try {
        // First, get a user ID (assuming there's at least one user)
        const userResult = await query('SELECT id FROM users LIMIT 1');
        
        if (userResult.rows.length === 0) {
            console.log('❌ No users found. Please create a user first.');
            return;
        }
        
        const userId = userResult.rows[0].id;
        console.log(`🔍 Creating test notifications for user ID: ${userId}`);
        
        // Create a critical notification
        const criticalNotification = await Notification.create(
            userId,
            'critical',
            'System Maintenance Alert',
            'Critical system maintenance is scheduled for tonight at 11 PM EST. All services will be temporarily unavailable for approximately 2 hours.'
        );
        
        console.log('🚨 Created critical notification:', criticalNotification.title);
        
        // Create an alert notification
        const alertNotification = await Notification.create(
            userId,
            'alert',
            'Security Update Required',
            'A security update is available for your account. Please review and update your password to ensure account security.'
        );
        
        console.log('⚠️ Created alert notification:', alertNotification.title);
        
        // Create a regular message (should not appear in banner)
        const messageNotification = await Notification.create(
            userId,
            'message',
            'Welcome Message',
            'Welcome to SiteScope! This is a regular message notification that should only appear in the notification center.'
        );
        
        console.log('💬 Created message notification:', messageNotification.title);
        
        console.log('✅ Test notifications created successfully!');
        console.log('🌐 Visit http://localhost:3000 to see the banner notifications in action.');
        
    } catch (error) {
        console.error('❌ Error creating test notifications:', error);
    } finally {
        process.exit(0);
    }
}

// Initialize and run
async function init() {
    try {
        await Notification.createTable();
        await createTestBannerNotifications();
    } catch (error) {
        console.error('❌ Initialization error:', error);
        process.exit(1);
    }
}

init();
