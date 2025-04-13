const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/Admin');

async function updateAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // New admin credentials
        const adminData = {
            email: 'workwithrc@gmail.com',  // New email
            password: 'Abcd1234'  // New password
        };

        // Hash the new password
        const hashedPassword = await bcrypt.hash(adminData.password, 12);

        // Update or create admin
        const result = await Admin.findOneAndUpdate(
            { email: adminData.email },
            { 
                email: adminData.email,
                password: hashedPassword
            },
            { 
                upsert: true,  // Create if doesn't exist
                new: true      // Return the updated document
            }
        );

        console.log('Admin updated successfully');
        console.log('New Email:', adminData.email);
        console.log('New Password:', adminData.password);

    } catch (error) {
        console.error('Error updating admin:', error);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run the function
updateAdminUser(); 