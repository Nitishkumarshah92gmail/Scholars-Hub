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

// Serve local uploads as static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'backend', 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Scholars Hub API is running' });
});

module.exports = app;
