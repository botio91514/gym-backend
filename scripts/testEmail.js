require('dotenv').config();
const { sendEmail } = require('../services/emailService');

async function testEmail() {
  try {
    console.log('Starting email test...');
    console.log('Environment variables loaded:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER
    });

    const result = await sendEmail({
      email: 'dudeseriouslyjunior@gmail.com', // The email address you want to test with
      subject: 'Test Email from Gym Management System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email from your Gym Management System.</p>
          <p>If you receive this, your email configuration is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    console.log('Test email sent successfully:', result);
  } catch (error) {
    console.error('Test email failed:', error);
    process.exit(1);
  }
}

testEmail(); 