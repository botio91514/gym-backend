const nodemailer = require('nodemailer');
const { formatIndianPrice, getPlanAmount, getPlanDisplayName } = require('../utils/formatters');

// Create reusable transporter object using SMTP transport
const createTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      pool: true, // Use pooled connections
      maxConnections: 1,
      rateDelta: 1000,
      rateLimit: 3,
      secure: true, // Use TLS
      debug: true,
      logger: true
    });

    // Verify connection configuration
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
};

// Send email function with retries
const sendEmail = async (options) => {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`Attempt ${attempts} to send email to: ${options.email}`);
      
      const transporter = await createTransporter();
      
      const mailOptions = {
        from: {
          name: 'Gym Test Support',
          address: process.env.EMAIL_USER
        },
        to: options.email,
        subject: options.subject,
        html: options.html,
        headers: {
          'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
          'Precedence': 'bulk',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'X-Report-Abuse': `Please report abuse here: mailto:${process.env.EMAIL_USER}`,
          'X-Priority': '1',
          'Importance': 'high'
        },
        priority: 'high',
        encoding: 'utf-8',
        disableFileAccess: true,
        disableUrlAccess: true
      };

      console.log('Sending email with options:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        from: mailOptions.from
      });

      const info = await transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });
      
      return info;
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        stack: error.stack
      });

      if (attempts === maxAttempts) {
        throw new Error(`Failed to send email after ${maxAttempts} attempts: ${error.message}`);
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempts)));
    }
  }
};

// Template for registration confirmation
const createRegistrationEmail = (user) => {
  const amount = getPlanAmount(user.plan);
  const planName = getPlanDisplayName(user.plan);
  const formattedAmount = formatIndianPrice(amount);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title>Welcome to Gym Test - Registration Confirmation</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px; color: #333333;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header Logo -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px;">
          <h1 style="color: #1a1a1a; margin: 0; font-size: 28px;">Gym Test</h1>
          <p style="color: #666666; margin-top: 10px; font-size: 16px;">Registration Confirmation</p>
        </div>

        <!-- Main Content -->
        <div style="margin-bottom: 30px;">
          <p style="color: #1a1a1a; font-size: 16px; font-weight: 500;">Dear ${user.name},</p>
          <p style="color: #444444; line-height: 1.6;">Thank you for registering with Gym Test. We're excited to be part of your fitness journey. Your registration has been received and is pending approval.</p>
        </div>

        <!-- Membership Details -->
        <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #eeeeee;">
          <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px;">Membership Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 10px 0; color: #666666;">Selected Plan:</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-weight: 500;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666666;">Amount Due:</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-weight: 500;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666666;">Start Date:</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-weight: 500;">${new Date(user.startDate).toLocaleDateString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666666;">End Date:</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-weight: 500;">${new Date(user.endDate).toLocaleDateString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <!-- Next Steps -->
        <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #ffe082;">
          <h3 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px;">Next Steps</h3>
          <ol style="color: #444444; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Visit our facility during business hours</li>
            <li>Complete your payment</li>
            <li>Receive your membership card</li>
            <li>Schedule your complimentary fitness assessment</li>
          </ol>
        </div>

        <!-- Operating Hours -->
        <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bbdefb;">
          <h3 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 18px;">Operating Hours</h3>
          <ul style="color: #444444; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Morning: 6:00 AM - 11:00 AM</li>
            <li>Evening: 4:00 PM - 10:00 PM</li>
            <li>Sunday: Closed</li>
          </ul>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
          <p style="color: #666666; margin-bottom: 15px; font-size: 16px;">Contact Information</p>
          <p style="color: #666666; margin: 5px 0; font-size: 14px;">📞 +91 9662460000</p>
          <p style="color: #666666; margin: 5px 0; font-size: 14px;">📧 dudeseriouslyjunior@gmail.com</p>
          <p style="color: #666666; margin: 5px 0; font-size: 14px;">📍 Petlad, Gujarat</p>
          <p style="color: #999999; margin-top: 20px; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
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
      <title>Payment Confirmation - Gym Test</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Payment Confirmed! 🎉</h1>
          <p style="color: #666; margin-top: 10px;">Your Gym Test Membership is Now Active</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px;">Dear ${user.name},</p>
          <p style="color: #444; line-height: 1.5;">Fantastic news! Your payment has been confirmed and your membership is now active. Welcome to the Gym Test family!</p>
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

// Export all functions in a single object
module.exports = { 
  sendEmail, 
  createRegistrationEmail,
  createPaymentConfirmationEmail 
};