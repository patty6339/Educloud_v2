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
    console.log('Creating course with data:', req.body);
    console.log('File uploaded:', req.file);
    
    const courseData = { ...req.body };
    
    // Add thumbnail path if file was uploaded
    if (req.file) {
        courseData.thumbnail = `/uploads/courses/${req.file.filename}`;
        console.log('Thumbnail path:', courseData.thumbnail);
    }
    
    // Add instructor
    courseData.instructor = req.user._id;
    
    console.log('Final course data:', courseData);
    
    const course = await Course.create(courseData);
    console.log('Course created:', course);
    
    res.status(201).json({
        status: 'success',
        data: course
    });
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
        course.thumbnail = `/uploads/courses/${req.file.filename}`;
    }

    const updatedCourse = await course.save();
    res.json({
        status: 'success',
        data: updatedCourse
    });
});

// Update course thumbnail
exports.updateCourseThumbnail = handleAsync(async (req, res) => {
    if (!req.file) {
        throw new APIError('No file uploaded', 400);
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
        throw new APIError('Course not found', 404);
    }

    // Update thumbnail path
    course.thumbnail = `/uploads/courses/${req.file.filename}`;
    await course.save();

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

    // Check if user is instructor of the course or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
});
