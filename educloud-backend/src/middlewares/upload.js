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
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime']
    
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

// Create upload middleware for course thumbnails
const courseThumbnailStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/courses'));
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'course-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for course thumbnails
const courseThumbnailFileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create upload middleware for course thumbnails
const courseThumbnailUpload = multer({
  storage: courseThumbnailStorage,
  fileFilter: courseThumbnailFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Export middleware functions
exports.uploadProfileImage = upload.single('profileImage');
exports.uploadCourseThumbnail = courseThumbnailUpload.single('thumbnail');
exports.uploadLessonMaterial = upload.array('lessonMaterial', 5);
exports.uploadAssignment = upload.single('assignment');
exports.handleUploadError = handleUploadError;
