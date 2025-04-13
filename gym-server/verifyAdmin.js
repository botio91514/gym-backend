require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function verifyAndResetAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // New admin credentials
        const adminData = {
            email: 'workwithrc@gmail.com',
            password: 'Abcd1234'
        };

        // Delete existing admin (clean slate)
        await Admin.deleteMany({});
        console.log('Cleared existing admin accounts');

        // Hash the password
        const hashedPassword = await bcrypt.hash(adminData.password, 12);

        // Create new admin
        const newAdmin = await Admin.create({
            email: adminData.email,
            password: hashedPassword
        });

        console.log('\nAdmin account created successfully:');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        console.log('\nYou can now log in with these credentials.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

verifyAndResetAdmin(); 