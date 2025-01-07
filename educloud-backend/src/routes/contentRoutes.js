const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const contentController = require('../controllers/contentController');

// Get course content
router.get('/course/:courseId', authenticate, contentController.getCourseContent);

// Get specific lesson content
router.get('/lesson/:lessonId', authenticate, contentController.getLessonContent);

// Submit assignment
router.post('/assignment/:assignmentId/submit', authenticate, contentController.submitAssignment);

// Get quiz questions
router.get('/quiz/:quizId', authenticate, contentController.getQuizQuestions);

// Submit quiz answers
router.post('/quiz/:quizId/submit', authenticate, contentController.submitQuizAnswers);

// Get learning resources
router.get('/resources/:courseId', authenticate, contentController.getLearningResources);

module.exports = router;
