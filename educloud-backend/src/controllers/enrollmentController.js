const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { handleAsync, APIError } = require('../utils/errorHandler');

// Enroll in a course
exports.enrollInCourse = handleAsync(async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new APIError('Course not found', 404);
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
        userId,
        courseId
    });

    if (existingEnrollment) {
        throw new APIError('Already enrolled in this course', 400);
    }

    // Create enrollment
    const enrollment = new Enrollment({
        userId,
        courseId,
        status: 'active',
        progress: {
            completedLessons: [],
            lastAccessed: new Date(),
            percentageCompleted: 0
        }
    });

    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    res.status(201).json({
        status: 'success',
        message: 'Successfully enrolled in course',
        data: {
            courseId: enrollment.courseId,
            status: enrollment.status,
            enrollmentDate: enrollment.createdAt
        }
    });
});

// Unenroll from a course
exports.unenrollFromCourse = handleAsync(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOneAndDelete({
        userId: userId,
        courseId: courseId
    });

    if (!enrollment) {
        throw new APIError('Enrollment not found', 404);
    }

    res.json({
        status: 'success',
        message: 'Successfully unenrolled from course'
    });
});

// Get user's enrollments
exports.getUserEnrollments = handleAsync(async (req, res) => {
    const enrollments = await Enrollment.find({ userId: req.user._id })
        .populate('course', 'title description instructor')
        .populate('completedLessons', 'title');
    res.json({
        status: 'success',
        data: enrollments
    });
});

// Get enrollment details
exports.getEnrollmentDetails = handleAsync(async (req, res) => {
    const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: req.params.courseId
    })
    .populate('course', 'title description instructor')
    .populate('completedLessons', 'title');

    if (!enrollment) {
        throw new APIError('Enrollment not found', 404);
    }

    res.json({
        status: 'success',
        data: enrollment
    });
});

// Update progress
exports.updateProgress = handleAsync(async (req, res) => {
    const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: req.params.courseId
    });

    if (!enrollment) {
        throw new APIError('Enrollment not found', 404);
    }

    enrollment.progress = req.body.progress;
    enrollment.lastAccessedAt = Date.now();
    await enrollment.save();

    res.json({
        status: 'success',
        data: enrollment
    });
});

// Get progress
exports.getProgress = handleAsync(async (req, res) => {
    const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: req.params.courseId
    })
    .populate('completedLessons', 'title');

    if (!enrollment) {
        throw new APIError('Enrollment not found', 404);
    }

    res.json({
        status: 'success',
        data: {
            progress: enrollment.progress,
            completedLessons: enrollment.completedLessons
        }
    });
});

// Complete a lesson
exports.completeLesson = handleAsync(async (req, res) => {
    const { courseId, lessonId } = req.params;

    const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: courseId
    });

    if (!enrollment) {
        throw new APIError('Enrollment not found', 404);
    }

    // Add lesson to completed lessons if not already completed
    if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
        enrollment.lastAccessedAt = Date.now();
        await enrollment.save();
    }

    res.json({
        status: 'success',
        message: 'Lesson marked as complete'
    });
});

// Get course students (instructor only)
exports.getCourseStudents = handleAsync(async (req, res) => {
    const { courseId } = req.params;

    // Verify instructor owns the course
    const course = await Course.findOne({
        _id: courseId,
        instructor: req.user._id
    });

    if (!course && req.user.role !== 'admin') {
        throw new APIError('Not authorized to view this course\'s students', 403);
    }

    const enrollments = await Enrollment.find({ courseId: courseId })
        .populate('userId', 'name email')
        .populate('completedLessons', 'title');

    res.json({
        status: 'success',
        data: enrollments
    });
});

// Get course progress (instructor only)
exports.getCourseProgress = handleAsync(async (req, res) => {
    const { courseId } = req.params;

    // Verify instructor owns the course
    const course = await Course.findOne({
        _id: courseId,
        instructor: req.user._id
    });

    if (!course && req.user.role !== 'admin') {
        throw new APIError('Not authorized to view this course\'s progress', 403);
    }

    const enrollments = await Enrollment.find({ courseId: courseId })
        .populate('userId', 'name email')
        .populate('completedLessons', 'title');

    res.json({
        status: 'success',
        data: enrollments
    });
});

// Update student progress (instructor only)
exports.updateStudentProgress = handleAsync(async (req, res) => {
    const { courseId, userId } = req.params;
    const { progress } = req.body;

    // Verify instructor owns the course
    const course = await Course.findOne({
        _id: courseId,
        instructor: req.user._id
    });

    if (!course && req.user.role !== 'admin') {
        throw new APIError('Not authorized to update this course\'s progress', 403);
    }

    const enrollment = await Enrollment.findOneAndUpdate(
        { courseId: courseId, userId: userId },
        { progress },
        { new: true }
    );

    if (!enrollment) {
        throw new APIError('Enrollment not found', 404);
    }

    res.json({
        status: 'success',
        data: enrollment
    });
});
