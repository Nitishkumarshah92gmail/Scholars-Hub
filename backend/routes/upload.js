const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const supabase = require('../config/supabase');

const router = express.Router();

const SUPABASE_BUCKET = 'uploads';
const supabaseUrl = (process.env.SUPABASE_URL || '').trim();

// Configure multer (memory storage — files stay in buffer)
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
 * Upload file to Supabase Storage and return public URL
 */
async function uploadToSupabase(buffer, originalName, mimetype, subfolder) {
    const ALLOWED_SUBFOLDERS = ['posts', 'avatars', 'pdfs', 'images'];
    if (!ALLOWED_SUBFOLDERS.includes(subfolder)) subfolder = 'posts';

    const ext = path.extname(originalName).replace(/[^a-zA-Z0-9.]/g, '');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = `${subfolder}/${uniqueName}`;

    const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(filePath, buffer, {
            contentType: mimetype,
            upsert: false,
        });

    if (error) {
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    return {
        fileId: uniqueName,
        fileName: originalName,
        fileUrl: publicUrl,
        viewLink: publicUrl,
        downloadLink: publicUrl,
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
            const result = await uploadToSupabase(file.buffer, file.originalname, file.mimetype, subfolder);
            results.push(result);
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

        const result = await uploadToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype, 'avatars');
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
        const fileId = path.basename(req.params.fileId);
        // Try deleting from each subfolder in Supabase Storage
        for (const sub of ['posts', 'avatars', 'pdfs', 'images']) {
            const { error } = await supabase.storage
                .from(SUPABASE_BUCKET)
                .remove([`${sub}/${fileId}`]);
            if (!error) break;
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
