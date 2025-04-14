const nodemailer = require('nodemailer');
const { formatIndianPrice, getPlanAmount, getPlanDisplayName } = require('../utils/formatters');

// Create reusable transporter object using SMTP transport
const createTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // Using Gmail service instead of custom SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
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
          name: 'Gym Test',
          address: process.env.EMAIL_USER
        },
        to: options.email,
        subject: options.subject,
        html: options.html,
        headers: {
          'X-Priority': '1',
          'Importance': 'high'
        }
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

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
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
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Gym Test</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Welcome to Gym Test! 💪</h1>
          <p style="color: #666; margin-top: 10px;">Your Journey to a Healthier Life Begins Here</p>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px;">Dear ${user.name},</p>
          <p style="color: #444; line-height: 1.5;">Thank you for choosing Gym Test! We're thrilled to have you join our fitness family. Your registration has been successfully received and is currently pending approval.</p>
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