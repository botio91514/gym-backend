require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Admin = require('./models/Admin');

const app = express();

// Basic middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Test endpoint
app.post('/api/test/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt with:', { email });

        // Find admin
        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            console.log('Admin not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordCorrect = await admin.correctPassword(password, admin.password);
        if (!isPasswordCorrect) {
            console.log('Password incorrect');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        console.log('Login successful');
        res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

async function startServer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Start server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log('\nTest the login endpoint with:');
            console.log('curl -X POST http://localhost:3000/api/test/login');
            console.log('-H "Content-Type: application/json"');
            console.log('-d \'{"email":"workwithrc@gmail.com","password":"Abcd1234"}\'');
        });
    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
}

startServer(); 