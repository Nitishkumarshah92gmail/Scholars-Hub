require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

let authRoutes, postRoutes, userRoutes, notificationRoutes, uploadRoutes;
try {
    authRoutes = require('../backend/routes/auth');
    postRoutes = require('../backend/routes/posts');
    userRoutes = require('../backend/routes/users');
    notificationRoutes = require('../backend/routes/notifications');
    uploadRoutes = require('../backend/routes/upload');
} catch (e) {
    console.error('Failed to load route modules:', e.message, e.stack);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
if (authRoutes) app.use('/api/auth', authRoutes);
if (postRoutes) app.use('/api/posts', postRoutes);
if (userRoutes) app.use('/api/users', userRoutes);
if (notificationRoutes) app.use('/api/notifications', notificationRoutes);
if (uploadRoutes) app.use('/api/upload', uploadRoutes);

// Serve uploaded files - use /tmp on Vercel, local dir otherwise
const IS_SERVERLESS = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const uploadsPath = IS_SERVERLESS
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, '..', 'backend', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Scholars Hub API is running' });
});

module.exports = app;
