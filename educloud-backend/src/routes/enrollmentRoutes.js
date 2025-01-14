const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const enrollmentController = require('../controllers/enrollmentController');

// All routes require authentication
router.use(protect);

// Student enrollment routes (available to all authenticated users)
router.post('/', enrollmentController.enrollInCourse);
router.delete('/:courseId', enrollmentController.unenrollFromCourse);
router.get('/', enrollmentController.getUserEnrollments);
router.get('/:courseId', enrollmentController.getEnrollmentDetails);

// Progress tracking (available to all authenticated users)
router.put('/:courseId/progress', enrollmentController.updateProgress);
router.get('/:courseId/progress', enrollmentController.getProgress);
router.post('/:courseId/complete-lesson/:lessonId', enrollmentController.completeLesson);

module.exports = router;
