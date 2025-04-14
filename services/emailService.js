const nodemailer = require('nodemailer');
const { formatIndianPrice, getPlanAmount, getPlanDisplayName } = require('../utils/formatters');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// Template for registration confirmation
const createRegistrationEmail = (user) => {
  const amount = getPlanAmount(user.plan);
  const planName = getPlanDisplayName(user.plan);
  const formattedAmount = formatIndianPrice(amount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Star Fitness</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Welcome to Star Fitness! 💪</h1>
          <p style="color: #666; margin-top: 10px;">Your Journey to a Healthier Life Begins Here</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px;">Dear ${user.name},</p>
          <p style="color: #444; line-height: 1.5;">Thank you for choosing Star Fitness! We're thrilled to have you join our fitness family. Your registration has been successfully received and is currently pending approval.</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0; font-size: 18px;">Your Membership Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Plan Selected:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Amount to Pay:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Start Date:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(user.startDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">End Date:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(user.endDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Payment Status:</td>
              <td style="padding: 8px 0; color: #ff9800; font-weight: bold;">Pending</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #f57c00; margin: 0;">⚠️ Important Information:</p>
          <p style="color: #666; margin: 10px 0 0 0;">Your membership will be activated once the payment is confirmed. Please visit our gym with the payment to complete your registration.</p>
        </div>

        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #1976d2; margin: 0;">🕒 Gym Timings:</p>
          <ul style="color: #666; margin: 10px 0 0 0; padding-left: 20px;">
            <li>Morning: 6:00 AM - 11:00 AM</li>
            <li>Evening: 4:00 PM - 10:00 PM</li>
            <li>Sunday: Closed</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin-bottom: 5px;">Need assistance? Contact us:</p>
          <p style="color: #666; margin: 0;">📞 Phone: 9662460000</p>
          <p style="color: #666; margin: 5px 0;">📧 Email: dudeseriouslyjunior@gmail.com</p>
          <p style="color: #666; margin: 5px 0;">📍 Location: Petlad, Gujarat</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for payment confirmation
const createPaymentConfirmationEmail = (user, receiptUrl) => {
  const amount = getPlanAmount(user.plan);
  const planName = getPlanDisplayName(user.plan);
  const formattedAmount = formatIndianPrice(amount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation - Star Fitness</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Payment Confirmed! 🎉</h1>
          <p style="color: #666; margin-top: 10px;">Your Star Fitness Membership is Now Active</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px;">Dear ${user.name},</p>
          <p style="color: #444; line-height: 1.5;">Fantastic news! Your payment has been confirmed and your membership is now active. Welcome to the Star Fitness family!</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0; font-size: 18px;">Membership Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Plan:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Start Date:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(user.startDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">End Date:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(user.endDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Status:</td>
              <td style="padding: 8px 0; color: #4caf50; font-weight: bold;">Active</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #2e7d32; margin: 0;">✨ Getting Started:</p>
          <ul style="color: #666; margin: 10px 0 0 0; padding-left: 20px;">
            <li>Visit during operational hours</li>
            <li>Bring your ID for first-time check-in</li>
            <li>Get your complimentary fitness assessment</li>
            <li>Join our orientation session</li>
            <li>Follow our social media for updates and tips</li>
          </ul>
        </div>

        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: #1976d2; margin: 0;">🕒 Gym Timings:</p>
          <ul style="color: #666; margin: 10px 0 0 0; padding-left: 20px;">
            <li>Morning: 6:00 AM - 11:00 AM</li>
            <li>Evening: 4:00 PM - 10:00 PM</li>
            <li>Sunday: Closed</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin-bottom: 5px;">Need assistance? Contact us:</p>
          <p style="color: #666; margin: 0;">📞 Phone: 9662460000</p>
          <p style="color: #666; margin: 5px 0;">📧 Email: dudeseriouslyjunior@gmail.com</p>
          <p style="color: #666; margin: 5px 0;">📍 Location: Petlad, Gujarat</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmail = async (options) => {
  try {
    console.log('Attempting to send email to:', options.email);
    console.log('Using SMTP settings:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER
    });

    const mailOptions = {
      from: {
        name: 'Gym Management',
        address: process.env.EMAIL_USER
      },
      to: options.email,
      subject: options.subject,
      html: options.customEmail || options.html,
      headers: {
        'X-Mailer': 'Gym Management System',
        'X-Priority': '1',
        'Importance': 'high'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Export all functions in a single object
module.exports = { 
  sendEmail, 
  createRegistrationEmail,
  createPaymentConfirmationEmail 
};