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
      pool: true,
      maxConnections: 1,
      rateDelta: 1500, // Increased delay between messages
      rateLimit: 3,
      secure: true,
      tls: {
        rejectUnauthorized: true
      },
      dkim: {
        domainName: 'gmail.com',
        keySelector: 'default',
        privateKey: process.env.DKIM_PRIVATE_KEY
      }
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
          name: 'Gym Test Fitness Center',
          address: process.env.EMAIL_USER
        },
        to: options.email,
        subject: options.subject,
        html: options.html,
        headers: {
          'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
          'Feedback-ID': 'Gym-Test:registration:gmail',
          'X-Entity-Ref-ID': new Date().getTime().toString(),
          'X-Report-Abuse': `Please report abuse here: mailto:${process.env.EMAIL_USER}`,
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'Precedence': 'bulk',
          'X-Mailer': 'GymTest Mailer v1.0.0'
        },
        priority: 'high',
        encoding: 'utf-8',
        dsn: {
          id: true,
          return: 'headers',
          notify: ['failure', 'delay'],
          recipient: process.env.EMAIL_USER
        }
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, error);
      if (attempts === maxAttempts) throw error;
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
      <title>Welcome to Gym Test Fitness Center</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif;">
        <!-- Header -->
        <div style="background-color: #212529; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Gym Test Fitness Center</h1>
          <p style="color: #e9ecef; margin-top: 10px; font-size: 16px;">Your Journey to Fitness Begins Here</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #212529; margin: 0 0 20px; font-size: 24px;">Registration Confirmation</h2>
          <p style="color: #495057; line-height: 1.6; margin-bottom: 25px;">Dear ${user.name},</p>
          <p style="color: #495057; line-height: 1.6; margin-bottom: 25px;">Thank you for choosing Gym Test Fitness Center. We're excited to welcome you to our fitness family. Your registration has been received and is currently pending approval.</p>

          <!-- Membership Card -->
          <div style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); border-radius: 12px; padding: 25px; color: white; margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px; font-size: 20px;">Membership Details</h3>
            <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #e9ecef;">Plan:</td>
                  <td style="padding: 8px 0; color: white; font-weight: 500; text-align: right;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #e9ecef;">Amount:</td>
                  <td style="padding: 8px 0; color: white; font-weight: 500; text-align: right;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #e9ecef;">Start Date:</td>
                  <td style="padding: 8px 0; color: white; font-weight: 500; text-align: right;">${new Date(user.startDate).toLocaleDateString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #e9ecef;">End Date:</td>
                  <td style="padding: 8px 0; color: white; font-weight: 500; text-align: right;">${new Date(user.endDate).toLocaleDateString('en-IN')}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Next Steps -->
          <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #212529; margin: 0 0 15px; font-size: 20px;">Next Steps</h3>
            <ol style="color: #495057; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Visit our facility during business hours</li>
              <li>Complete your payment</li>
              <li>Receive your membership card</li>
              <li>Schedule your complimentary fitness assessment</li>
            </ol>
          </div>

          <!-- Facility Hours -->
          <div style="background-color: #e9ecef; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #212529; margin: 0 0 15px; font-size: 20px;">Facility Hours</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #495057;">Morning:</td>
                <td style="padding: 8px 0; color: #212529; font-weight: 500;">6:00 AM - 11:00 AM</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #495057;">Evening:</td>
                <td style="padding: 8px 0; color: #212529; font-weight: 500;">4:00 PM - 10:00 PM</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #495057;">Sunday:</td>
                <td style="padding: 8px 0; color: #212529; font-weight: 500;">Closed</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #212529; color: #ffffff; padding: 30px 20px; text-align: center;">
          <h3 style="margin: 0 0 20px; font-size: 20px;">Contact Information</h3>
          <p style="margin: 10px 0; color: #e9ecef;">
            <span style="display: inline-block; margin-right: 10px;">📞 +91 9662460000</span>
            <span style="display: inline-block;">📧 dudeseriouslyjunior@gmail.com</span>
          </p>
          <p style="margin: 10px 0; color: #e9ecef;">📍 Petlad, Gujarat</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
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