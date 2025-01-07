const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { handleAsync, APIError } = require('../utils/errorHandler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Register new user
exports.register = handleAsync(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
        throw new APIError('User already exists', 400);
    }

    // Create user
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'student'
    });

    // Generate token
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.status(201).json({
        status: 'success',
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

// Login user
exports.login = handleAsync(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
        throw new APIError('Invalid email or password', 401);
    }

    // Generate token
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        status: 'success',
        token,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

// Forgot password
exports.forgotPassword = handleAsync(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new APIError('No user found with this email', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // In a real application, send email with reset token
    res.json({
        status: 'success',
        message: 'Password reset token sent to email'
    });
});

// Reset password
exports.resetPassword = handleAsync(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new APIError('Invalid or expired reset token', 400);
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
        status: 'success',
        message: 'Password reset successful'
    });
});

// Get user profile
exports.getProfile = handleAsync(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
        status: 'success',
        data: user
    });
});

// Update user profile
exports.updateProfile = handleAsync(async (req, res) => {
    const user = await User.findById(req.user._id);

    // Update fields
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    if (req.file) {
        user.profileImage = req.file.path;
    }

    const updatedUser = await user.save();
    res.json({
        status: 'success',
        data: updatedUser
    });
});

// Change password
exports.changePassword = handleAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
        throw new APIError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
        status: 'success',
        message: 'Password updated successfully'
    });
});

// Get enrolled courses
exports.getEnrolledCourses = handleAsync(async (req, res) => {
    const enrollments = await Enrollment.find({ userId: req.user._id })
        .populate('courseId', 'title description instructor')
        .sort('-createdAt');

    res.json({
        status: 'success',
        data: enrollments
    });
});

// Get course progress
exports.getCourseProgress = handleAsync(async (req, res) => {
    const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: req.params.courseId
    }).populate('completedLessons');

    if (!enrollment) {
        throw new APIError('Enrollment not found', 404);
    }

    res.json({
        status: 'success',
        data: {
            progress: enrollment.progress,
            status: enrollment.status
        }
    });
});

// Update user settings
exports.updateSettings = handleAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.settings = { ...user.settings, ...req.body };
    await user.save();
    res.json({
        status: 'success',
        data: user.settings
    });
});

// Enroll in a course
exports.enrollInCourse = handleAsync(async (req, res) => {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new APIError('Course not found', 404);
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
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

// Admin: Get all users
exports.getAllUsers = handleAsync(async (req, res) => {
    const users = await User.find().select('-password');
    res.json({
        status: 'success',
        data: users
    });
});

// Admin: Get user by ID
exports.getUserById = handleAsync(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        throw new APIError('User not found', 404);
    }
    res.json({
        status: 'success',
        data: user
    });
});

// Admin: Update user
exports.updateUser = handleAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new APIError('User not found', 404);
    }

    // Update fields
    Object.assign(user, req.body);
    const updatedUser = await user.save();
    res.json({
        status: 'success',
        data: updatedUser
    });
});

// Admin: Delete user
exports.deleteUser = handleAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new APIError('User not found', 404);
    }

    await user.remove();
    res.json({
        status: 'success',
        message: 'User deleted successfully'
    });
});
