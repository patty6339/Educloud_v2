const Course = require('../models/Course');
const { handleAsync } = require('../utils/errorHandler');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { deleteFromS3 } = require('../config/aws');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/courses');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('thumbnail');

// Get all courses
exports.getAllCourses = handleAsync(async (req, res) => {
    const courses = await Course.find()
        .populate('instructor', 'firstName lastName email')
        .select('-__v');
    res.json({ courses });
});

// Get course by ID
exports.getCourseById = handleAsync(async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('instructor', 'firstName lastName email')
        .populate('lessons', 'title description duration')
        .select('-__v');

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
});

// Create new course
exports.createCourse = handleAsync(async (req, res) => {
    try {
        console.log('Create course endpoint hit');
        console.log('Request body:', req.body);
        console.log('Request file URL:', req.fileUrl);
        console.log('Request user:', req.user);
        
        // Parse numeric fields
        const courseData = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            level: req.body.level,
            price: Number(req.body.price),
            duration: Number(req.body.duration),
            status: req.body.status || 'draft',
            instructor: req.user._id
        };

        console.log('Parsed course data:', courseData);

        // Validate required fields
        const requiredFields = ['title', 'description', 'category', 'level', 'price', 'duration'];
        const missingFields = requiredFields.filter(field => {
            const value = courseData[field];
            const isEmpty = value === undefined || value === null || value === '';
            if (isEmpty) {
                console.log(`Missing field ${field}:`, value);
            }
            return isEmpty;
        });
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Parse arrays if they exist
        if (req.body.prerequisites) {
            try {
                courseData.prerequisites = JSON.parse(req.body.prerequisites);
                console.log('Parsed prerequisites:', courseData.prerequisites);
            } catch (e) {
                console.error('Error parsing prerequisites:', e);
                return res.status(400).json({ message: 'Invalid prerequisites format' });
            }
        }

        if (req.body.objectives) {
            try {
                courseData.objectives = JSON.parse(req.body.objectives);
                console.log('Parsed objectives:', courseData.objectives);
            } catch (e) {
                console.error('Error parsing objectives:', e);
                return res.status(400).json({ message: 'Invalid objectives format' });
            }
        }

        // Add thumbnail URL if file was uploaded
        if (req.fileUrl) {
            courseData.thumbnail = req.fileUrl;
            console.log('Added thumbnail URL:', courseData.thumbnail);
        }

        console.log('Final course data before creation:', courseData);
        const course = await Course.create(courseData);
        console.log('Course created successfully:', course);

        res.status(201).json({
            status: 'success',
            data: course
        });
    } catch (error) {
        console.error('Error in course creation:', error);
        console.error('Error stack:', error.stack);
        
        // If there was an error and we have a file URL, try to delete it from S3
        if (req.fileUrl) {
            try {
                await deleteFromS3(req.fileUrl);
            } catch (deleteError) {
                console.error('Error deleting file from S3:', deleteError);
            }
        }

        res.status(400).json({ 
            message: error.message || 'Failed to create course',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update course
exports.updateCourse = handleAsync(async (req, res) => {
    const course = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
        status: 'success',
        data: course
    });
});

// Delete course
exports.deleteCourse = handleAsync(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    // Delete thumbnail from S3 if it exists and is not the default
    if (course.thumbnail && !course.thumbnail.includes('default-course')) {
        try {
            await deleteFromS3(course.thumbnail);
        } catch (error) {
            console.error('Error deleting thumbnail from S3:', error);
        }
    }

    await course.remove();

    res.json({
        status: 'success',
        message: 'Course deleted successfully'
    });
});

// Update course thumbnail
exports.updateCourseThumbnail = handleAsync(async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'File upload error: ' + err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const course = await Course.findById(req.params.id);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            // Delete old thumbnail if it exists and is not the default
            if (course.thumbnail && course.thumbnail !== '/uploads/courses/default-course.svg') {
                const oldThumbnailPath = path.join(__dirname, '../..', course.thumbnail);
                fs.unlink(oldThumbnailPath, (err) => {
                    if (err) console.error('Error deleting old thumbnail:', err);
                });
            }

            // Update thumbnail path
            if (req.file) {
                course.thumbnail = `/uploads/courses/${req.file.filename}`;
                await course.save();
            }

            res.json({
                status: 'success',
                data: course
            });
        } catch (error) {
            // If there was an error and a file was uploaded, delete it
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            throw error;
        }
    });
});
