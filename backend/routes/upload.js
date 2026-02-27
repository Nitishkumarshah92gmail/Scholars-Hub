const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

// Check if Google Drive is configured
let driveAvailable = false;
let uploadToDrive, deleteFromDrive;
try {
    const gd = require('../config/googleDrive');
    uploadToDrive = gd.uploadFile;
    deleteFromDrive = gd.deleteFile;
    // Quick check: if service-account.json exists
    if (fs.existsSync(path.join(__dirname, '..', 'service-account.json'))) {
        driveAvailable = true;
        console.log('Google Drive: configured ✓');
    } else {
        console.log('Google Drive: no service-account.json, using local storage');
    }
} catch (e) {
    console.log('Google Drive: not configured, using local storage');
}

// Use /tmp on serverless (Vercel) or local uploads dir
const IS_SERVERLESS = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const UPLOADS_DIR = IS_SERVERLESS ? path.join('/tmp', 'uploads') : path.join(__dirname, '..', 'uploads');
try {
    ['posts', 'avatars', 'pdfs', 'images'].forEach(sub => {
        const dir = path.join(UPLOADS_DIR, sub);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
} catch (e) {
    console.warn('Could not create local upload directories:', e.message);
}

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024, files: 5 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'video/mp4', 'video/webm', 'video/quicktime',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type not allowed: ${file.mimetype}`), false);
        }
    },
});

/**
 * Save file locally and return URL
 */
async function saveFileLocally(buffer, originalName, subfolder) {
    const ALLOWED_SUBFOLDERS = ['posts', 'avatars', 'pdfs', 'images'];
    if (!ALLOWED_SUBFOLDERS.includes(subfolder)) subfolder = 'posts';
    const ext = path.extname(originalName).replace(/[^a-zA-Z0-9.]/g, '');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, subfolder, uniqueName);
    await fs.promises.writeFile(filePath, buffer);
    const fileUrl = `/uploads/${subfolder}/${uniqueName}`;
    return {
        fileId: uniqueName,
        fileName: originalName,
        fileUrl,
        viewLink: fileUrl,
        downloadLink: fileUrl,
    };
}

/**
 * POST /api/upload/files
 */
router.post('/files', auth, upload.array('files', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files provided.' });
        }

        const ALLOWED_SUBFOLDERS = ['posts', 'avatars', 'pdfs', 'images'];
        const subfolder = ALLOWED_SUBFOLDERS.includes(req.body.subfolder) ? req.body.subfolder : 'posts';
        const results = [];

        for (const file of req.files) {
            if (driveAvailable) {
                try {
                    const result = await uploadToDrive(file.buffer, file.originalname, file.mimetype, subfolder);
                    results.push(result);
                } catch (driveErr) {
                    console.log('Drive upload failed, falling back to local:', driveErr.message);
                    results.push(await saveFileLocally(file.buffer, file.originalname, subfolder));
                }
            } else {
                results.push(await saveFileLocally(file.buffer, file.originalname, subfolder));
            }
        }

        res.json({ urls: results });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message || 'Failed to upload files.' });
    }
});

/**
 * POST /api/upload/avatar
 */
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No avatar file provided.' });
        }

        let result;
        if (driveAvailable) {
            try {
                result = await uploadToDrive(req.file.buffer, req.file.originalname, req.file.mimetype, 'avatars');
            } catch (driveErr) {
                console.log('Drive avatar upload failed, falling back to local:', driveErr.message);
                result = await saveFileLocally(req.file.buffer, req.file.originalname, 'avatars');
            }
        } else {
            result = await saveFileLocally(req.file.buffer, req.file.originalname, 'avatars');
        }

        res.json(result);
    } catch (err) {
        console.error('Avatar upload error:', err);
        res.status(500).json({ error: err.message || 'Failed to upload avatar.' });
    }
});

/**
 * DELETE /api/upload/:fileId
 */
router.delete('/:fileId', auth, async (req, res) => {
    try {
        if (driveAvailable) {
            await deleteFromDrive(req.params.fileId);
        }
        // Also try to delete locally — sanitize fileId to prevent path traversal
        const fileId = path.basename(req.params.fileId);
        for (const sub of ['posts', 'avatars', 'pdfs', 'images']) {
            const localPath = path.join(UPLOADS_DIR, sub, fileId);
            // Verify resolved path is still inside UPLOADS_DIR
            if (!localPath.startsWith(UPLOADS_DIR)) continue;
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
                break;
            }
        }
        res.json({ message: 'File deleted successfully.' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete file.' });
    }
});

// Error handling for multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Max size is 50MB.' });
        if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ error: 'Too many files. Max is 5.' });
        return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
    next();
});

module.exports = router;
