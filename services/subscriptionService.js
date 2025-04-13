const User = require('../models/User');
const { sendEmail } = require('./emailService');

const checkExpiredSubscriptions = async () => {
  try {
    const today = new Date();
    
    // Find users whose subscriptions have expired
    const expiredUsers = await User.find({
      endDate: { $lt: today },
      subscriptionStatus: { $ne: 'expired' }
    });

    // Update their status and send notifications
    for (const user of expiredUsers) {
      user.subscriptionStatus = 'expired';
      await user.save();

      // Send notification email
      await sendEmail({
        email: user.email,
        subject: 'Membership Expired',
        html: expiredEmailTemplate(user.name, user.endDate)
      });
    }

    // Find users whose subscriptions are about to expire
    const nearingExpiry = await User.find({
      endDate: {
        $gt: today,
        $lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      },
      subscriptionStatus: 'active'
    });

    // Send reminder emails
    for (const user of nearingExpiry) {
      const daysLeft = Math.ceil((new Date(user.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      await sendEmail({
        email: user.email,
        subject: 'Membership Expiring Soon',
        html: expiringEmailTemplate(user.name, daysLeft, user.endDate)
      });
    }
  } catch (error) {
    console.error('Error checking subscriptions:', error);
  }
};

const expiredEmailTemplate = (name, endDate) => `
<!DOCTYPE html>
<html>
<head>
  <title>Membership Expired</title>
</head>
<body>
  <div>
    <h1>Your Gym Membership Has Expired</h1>
    <p>Dear ${name},</p>
    <p>Your membership expired on ${new Date(endDate).toLocaleDateString()}.</p>
    <p>Thank you for choosing Gym!</p>
  </div>
</body>
</html>
`;

const expiringEmailTemplate = (name, daysLeft, endDate) => `
<!DOCTYPE html>
<html>
<head>
  <title>Membership Expiring Soon</title>
</head>
<body>
  <div>
    <h1>Your Gym Membership is Expiring Soon</h1>
    <p>Dear ${name},</p>
    <p>Your membership will expire in ${daysLeft} days on ${new Date(endDate).toLocaleDateString()}.</p>
    <p>Thank you for choosing Gym!</p>
  </div>
</body>
</html>
`;

module.exports = { checkExpiredSubscriptions }; 