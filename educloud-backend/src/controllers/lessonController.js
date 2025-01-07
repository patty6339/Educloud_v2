const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { handleAsync } = require('../utils/errorHandler');

// Get all lessons for a course
exports.getLessons = handleAsync(async (req, res) => {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ course: courseId })
        .select('-__v')
        .sort('order');
    res.json({ lessons });
});

// Get lesson by ID
exports.getLessonById = handleAsync(async (req, res) => {
    const { courseId, lessonId } = req.params;
    const lesson = await Lesson.findOne({
        _id: lessonId,
        course: courseId
    }).select('-__v');

    if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json({ lesson });
});

// Create new lesson
exports.createLesson = handleAsync(async (req, res) => {
    const { courseId } = req.params;
    const { title, description, content, duration } = req.body;

    // Check if course exists and user is authorized
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
    }

    // Get the highest order number
    const lastLesson = await Lesson.findOne({ course: courseId }).sort('-order');
    const order = lastLesson ? lastLesson.order + 1 : 1;

    // Create the lesson
    const lesson = await Lesson.create({
        title,
        description,
        content,
        duration,
        course: courseId,
        order,
        attachments: req.files ? req.files.map(file => ({
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype
        })) : []
    });

    // Add lesson to course
    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json({ lesson });
});

// Update lesson
exports.updateLesson = handleAsync(async (req, res) => {
    const { courseId, lessonId } = req.params;

    // Check if lesson exists
    const lesson = await Lesson.findOne({
        _id: lessonId,
        course: courseId
    });

    if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check authorization
    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }

    // Update the lesson
    Object.assign(lesson, req.body);
    if (req.files) {
        lesson.attachments = req.files.map(file => ({
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype
        }));
    }

    await lesson.save();
    res.json({ lesson });
});

// Delete lesson
exports.deleteLesson = handleAsync(async (req, res) => {
    const { courseId, lessonId } = req.params;

    // Check if lesson exists
    const lesson = await Lesson.findOne({
        _id: lessonId,
        course: courseId
    });

    if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check authorization
    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    // Remove lesson from course
    course.lessons = course.lessons.filter(id => id.toString() !== lessonId);
    await course.save();

    // Delete the lesson
    await lesson.remove();
    res.json({ message: 'Lesson deleted successfully' });
});
