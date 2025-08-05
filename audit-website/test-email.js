import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmailConnection() {
    console.log('🔧 Testing Gmail SMTP connection...');
    console.log('📧 Email:', process.env.SMTP_USER);
    console.log('🔑 Password length:', process.env.SMTP_PASS?.length);
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        // Test connection
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        // Try sending a test email
        const info = await transporter.sendMail({
            from: `"Domain Audit Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to yourself
            subject: 'Email Verification Test',
            text: 'If you receive this, email verification is working!',
            html: '<p>If you receive this, <strong>email verification is working!</strong></p>'
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        
    } catch (error) {
        console.error('❌ Email test failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response);
        
        // Common error suggestions
        if (error.code === 'EAUTH') {
            console.log('\n🔍 EAUTH Error - Authentication failed:');
            console.log('1. Check that 2FA is enabled on your Gmail account');
            console.log('2. Generate a new App Password from: https://myaccount.google.com/apppasswords');
            console.log('3. Make sure the App Password has no spaces');
            console.log('4. Try revoking and creating a new App Password');
        }
        
        if (error.code === 'ENOTFOUND') {
            console.log('\n🔍 ENOTFOUND Error - Network issue:');
            console.log('1. Check your internet connection');
            console.log('2. Verify SMTP_HOST is correct: smtp.gmail.com');
        }
    }
}

testEmailConnection();
