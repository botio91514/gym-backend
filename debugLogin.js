require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

async function debugLogin() {
    try {
        console.log('🔍 Starting login debug...');
        console.log('----------------------------------------');

        // 1. Check MongoDB connection
        console.log('\n1. Checking MongoDB connection...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');

        // 2. Check admin account
        console.log('\n2. Checking admin account...');
        const admin = await Admin.findOne({ email: 'workwithrc@gmail.com' }).select('+password');
        if (!admin) {
            throw new Error('Admin account not found');
        }
        console.log('✅ Admin account found');
        console.log('Admin details:', {
            email: admin.email,
            hasPassword: !!admin.password
        });

        // 3. Test password verification
        console.log('\n3. Testing password verification...');
        const testPassword = 'Abcd1234';
        const isPasswordCorrect = await bcrypt.compare(testPassword, admin.password);
        console.log('Password verification:', isPasswordCorrect ? '✅ Success' : '❌ Failed');

        // 4. Check JWT configuration
        console.log('\n4. Checking JWT configuration...');
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not set');
        }
        console.log('✅ JWT_SECRET is configured');

        console.log('\n✨ Debug complete!');
        console.log('\nIf you see any ❌ marks above, those are the issues to fix.');
        console.log('Otherwise, the login system appears to be working correctly.');

    } catch (error) {
        console.error('\n❌ Error during debug:', error.message);
        console.log('\nStack trace:', error.stack);
        
        if (error.message.includes('MongoDB')) {
            console.log('\nTo fix MongoDB connection:');
            console.log('1. Check your MONGODB_URI in .env file');
            console.log('2. Make sure MongoDB is running');
            console.log('3. Verify your network connection');
        }
        
        if (error.message.includes('Admin account')) {
            console.log('\nTo fix admin account:');
            console.log('1. Run node verifyAdmin.js to create the admin account');
        }
        
        if (error.message.includes('JWT')) {
            console.log('\nTo fix JWT configuration:');
            console.log('1. Add JWT_SECRET to your .env file');
            console.log('2. Make sure it\'s a secure random string');
        }
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

debugLogin(); 