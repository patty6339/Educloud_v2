const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');

exports.getCourseContent = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const content = await Course.findById(courseId)
            .populate('lessons')
            .populate('assignments')
            .populate('quizzes');
        
        if (!content) {
            return res.status(404).json({ message: 'Course content not found' });
        }

        res.json(content);
    } catch (error) {
        next(error);
    }
};

exports.getLessonContent = async (req, res, next) => {
    try {
        const lessonId = req.params.lessonId;
        const lesson = await Lesson.findById(lessonId);
        
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        res.json(lesson);
    } catch (error) {
        next(error);
    }
};

exports.submitAssignment = async (req, res, next) => {
    try {
        const { assignmentId } = req.params;
        const { submission } = req.body;

        const assignmentSubmission = await AssignmentSubmission.create({
            userId: req.user.id,
            assignmentId,
            submission,
            submissionDate: new Date()
        });

        res.status(201).json(assignmentSubmission);
    } catch (error) {
        next(error);
    }
};

exports.getQuizQuestions = async (req, res, next) => {
    try {
        const quizId = req.params.quizId;
        const quiz = await Quiz.findById(quizId).select('questions timeLimit');
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (error) {
        next(error);
    }
};

exports.submitQuizAnswers = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body;

        const quiz = await Quiz.findById(quizId);
        const score = calculateQuizScore(quiz.questions, answers);

        const submission = await QuizSubmission.create({
            userId: req.user.id,
            quizId,
            answers,
            score,
            submissionDate: new Date()
        });

        res.json({ score, submission });
    } catch (error) {
        next(error);
    }
};

exports.getLearningResources = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const resources = await Resource.find({ courseId })
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        next(error);
    }
};

function calculateQuizScore(questions, answers) {
    let score = 0;
    questions.forEach((question, index) => {
        if (question.correctAnswer === answers[index]) {
            score += question.points || 1;
        }
    });
    return score;
}
