require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    try {
        console.log('🔍 Testing email configuration...');
        
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection
        await transporter.verify();
        console.log('✅ SMTP connection successful');

        // Send test email
        const info = await transporter.sendMail({
            from: `"Gym" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: 'Test Email from Gym',
            html: `
                <h1>Test Email</h1>
                <p>This is a test email to verify the email configuration.</p>
                <p>Sent from Gym Management System</p>
            `
        });

        console.log('✅ Test email sent successfully');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        console.log('\nTo fix this:');
        console.log('1. Check your .env file for correct email settings');
        console.log('2. Verify your email credentials');
        console.log('3. Make sure your email provider allows SMTP access');
        if (error.message.includes('Invalid login')) {
            console.log('\nFor Gmail users:');
            console.log('1. Enable 2-Step Verification');
            console.log('2. Generate an App Password');
            console.log('3. Use the App Password in EMAIL_PASSWORD');
        }
    }
}

testEmail(); 