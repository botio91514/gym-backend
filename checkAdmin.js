require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const jwt = require('jsonwebtoken');

async function checkAdminSetup() {
    try {
        // 1. Check MongoDB connection
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 2. Check JWT secret
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not set in .env file');
        }
        console.log('✅ JWT_SECRET is configured');

        // 3. Check admin account
        const admin = await Admin.findOne({ email: 'workwithrc@gmail.com' });
        if (!admin) {
            throw new Error('Admin account not found');
        }
        console.log('✅ Admin account exists');

        // 4. Test JWT generation
        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        console.log('✅ JWT token generation successful');

        console.log('\nAdmin Setup Check Complete!');
        console.log('You can now try logging in with:');
        console.log('Email: workwithrc@gmail.com');
        console.log('Password: Abcd1234');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\nTo fix this:');
        if (error.message.includes('JWT_SECRET')) {
            console.log('1. Add JWT_SECRET to your .env file');
            console.log('2. Make sure it\'s a secure random string');
        }
        if (error.message.includes('Admin account')) {
            console.log('1. Run node verifyAdmin.js to create the admin account');
        }
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

checkAdminSetup(); 