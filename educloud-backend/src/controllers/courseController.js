const Course = require('../models/Course');
const { handleAsync } = require('../utils/errorHandler');

// Get all courses
exports.getAllCourses = handleAsync(async (req, res) => {
    const courses = await Course.find()
        .populate('instructor', 'name email')
        .select('-__v');
    res.json({ courses });
});

// Get course by ID
exports.getCourseById = handleAsync(async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('instructor', 'name email')
        .populate('lessons', 'title description duration')
        .select('-__v');

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
});

// Create new course
exports.createCourse = handleAsync(async (req, res) => {
    const courseData = {
        ...req.body,
        instructor: req.user._id,
        thumbnail: req.file ? req.file.path : undefined
    };

    // Create course
    const course = await Course.create(courseData);
    await course.populate('instructor', 'name email');

    res.status(201).json({ course });
});

// Update course
exports.updateCourse = handleAsync(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is instructor of the course or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    // Update fields
    Object.assign(course, req.body);
    if (req.file) {
        course.thumbnail = req.file.path;
    }

    const updatedCourse = await course.save();
    await updatedCourse.populate('instructor', 'name email');
    res.json({ course: updatedCourse });
});

// Delete course
exports.deleteCourse = handleAsync(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is instructor of the course or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
});
