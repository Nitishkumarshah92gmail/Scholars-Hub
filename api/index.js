require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('../backend/routes/auth');
const postRoutes = require('../backend/routes/posts');
const userRoutes = require('../backend/routes/users');
const notificationRoutes = require('../backend/routes/notifications');
const uploadRoutes = require('../backend/routes/upload');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

// Serve local uploads as static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'backend', 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Scholars Hub API is running' });
});

module.exports = app;
