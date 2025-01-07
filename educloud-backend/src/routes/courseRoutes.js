const express = require('express');
const courseController = require('../controllers/courseController');
const lessonController = require('../controllers/lessonController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { uploadCourseThumbnail } = require('../middlewares/upload');

const router = express.Router();

// Course routes
router.get('/', protect, courseController.getAllCourses);
router.post('/', protect, authorize(['instructor', 'admin']), (req, res, next) => {
    // Make file upload optional
    if (!req.files && !req.file) {
        return next();
    }
    uploadCourseThumbnail(req, res, next);
}, courseController.createCourse);
router.get('/:id', protect, courseController.getCourseById);
router.put('/:id', protect, authorize(['instructor', 'admin']), courseController.updateCourse);
router.delete('/:id', protect, authorize(['instructor', 'admin']), courseController.deleteCourse);

// Lesson routes
router.get('/:courseId/lessons', protect, lessonController.getLessons);
router.post('/:courseId/lessons', protect, authorize(['instructor', 'admin']), lessonController.createLesson);
router.get('/:courseId/lessons/:lessonId', protect, lessonController.getLessonById);
router.put('/:courseId/lessons/:lessonId', protect, authorize(['instructor', 'admin']), lessonController.updateLesson);
router.delete('/:courseId/lessons/:lessonId', protect, authorize(['instructor', 'admin']), lessonController.deleteLesson);

module.exports = router;
