require('dotenv').config();
const { sendEmail } = require('../services/emailService');

const testEmail = async () => {
  try {
    console.log('Starting email test...');
    
    const testEmailOptions = {
      email: 'dudeseriouslyjunior@gmail.com', // Send test email to yourself
      subject: 'Test Email from Star Fitness',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Test Email</h1>
          <p>This is a test email from Star Fitness Management System.</p>
          <p>If you receive this email, the email service is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    console.log('Sending test email...');
    const result = await sendEmail(testEmailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

testEmail(); 