const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    timeLimit: {
        type: Number, // in minutes
        required: true
    },
    passingScore: {
        type: Number,
        required: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['multiple-choice', 'true-false', 'short-answer'],
            required: true
        },
        options: [{
            text: String,
            isCorrect: Boolean
        }],
        correctAnswer: String, // For short-answer questions
        points: {
            type: Number,
            default: 1
        },
        explanation: String
    }],
    shuffleQuestions: {
        type: Boolean,
        default: false
    },
    showResults: {
        type: Boolean,
        default: true
    },
    attemptsAllowed: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

const quizSubmissionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        answer: String,
        isCorrect: Boolean,
        points: Number
    }],
    score: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number // in minutes
    },
    submissionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['completed', 'passed', 'failed'],
        required: true
    },
    attemptNumber: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

exports.Quiz = mongoose.model('Quiz', quizSchema);
exports.QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);
