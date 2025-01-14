const multer = require('multer');
const path = require('path');
const { uploadToS3 } = require('../config/aws');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    // Define allowed file types based on upload type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
    
    if (file.fieldname === 'profileImage' || file.fieldname === 'courseThumbnail') {
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    } else if (file.fieldname === 'lessonMaterial' || file.fieldname === 'assignment') {
        if ([...allowedDocTypes, ...allowedVideoTypes].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type!'), false);
        }
    } else {
        cb(new Error('Unknown field name!'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB default
    }
});

// Middleware to handle file upload and S3 storage
const handleFileUpload = (fieldName) => async (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            if (req.file) {
                // Upload to S3 and get URL
                const s3Url = await uploadToS3(req.file, fieldName);
                req.fileUrl = s3Url;
            }
            next();
        } catch (error) {
            console.error('File processing error:', error);
            res.status(500).json({ message: 'Error processing file upload' });
        }
    });
};

// Export middleware functions
module.exports = {
    uploadProfileImage: handleFileUpload('profileImage'),
    uploadCourseThumbnail: handleFileUpload('courseThumbnail'),
    uploadLessonMaterial: handleFileUpload('lessonMaterial'),
    uploadAssignment: handleFileUpload('assignment')
};
