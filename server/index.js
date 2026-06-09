require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// connect to database
connectDB();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',

        'https://auth-app-omega-two.vercel.app',
    ],
    credentials: true,
}));

app.use(express.json());

// logger middleware

app.use((req, res, next) => {
    console.log('[${new Date().toISOString()}] ${req.method} ${req.url}');
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

//Health check route
app.get('/', ( req, res) => {
    res.json({ message: 'API is running!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});