const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        
        // Determine upload directory based on file type
        if (file.fieldname === 'profileImage') {
            uploadPath += 'profiles/';
        } else if (file.fieldname === 'courseThumbnail') {
            uploadPath += 'courses/';
        } else if (file.fieldname === 'lessonMaterial') {
            uploadPath += 'lessons/';
        } else if (file.fieldname === 'assignment') {
            uploadPath += 'assignments/';
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

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
        cb(new Error('Unknown file type!'), false);
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

// Error handler for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File is too large'
            });
        }
        return res.status(400).json({
            message: error.message
        });
    }
    
    if (error) {
        return res.status(400).json({
            message: error.message
        });
    }
    
    next();
};

// Export middleware functions
exports.uploadProfileImage = upload.single('profileImage');
exports.uploadCourseThumbnail = upload.single('courseThumbnail');
exports.uploadLessonMaterial = upload.array('lessonMaterial', 5);
exports.uploadAssignment = upload.single('assignment');
exports.handleUploadError = handleUploadError;
