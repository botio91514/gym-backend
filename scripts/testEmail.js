require('dotenv').config();
const { sendEmail } = require('../services/emailService');

async function testEmail() {
  try {
    console.log('Starting email test...');
    console.log('Using email:', process.env.EMAIL_USER);

    const result = await sendEmail({
      email: process.env.EMAIL_USER, // Send to the same email for testing
      subject: 'Test Email from Gym Management System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email from your Gym Management System.</p>
          <p>If you receive this, your email configuration is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
          <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
        </div>
      `
    });

    console.log('Test email sent successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('Test email failed:', error);
    process.exit(1);
  }
}

testEmail(); 