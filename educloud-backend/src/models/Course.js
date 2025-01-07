const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    thumbnail: {
        type: String
    },
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    assignments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
    }],
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    duration: {
        type: Number, // in minutes
        required: true
    },
    requirements: [{
        type: String
    }],
    objectives: [{
        type: String
    }],
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    enrollmentCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search functionality
courseSchema.index({ 
    title: 'text', 
    description: 'text', 
    category: 'text' 
});

module.exports = mongoose.model('Course', courseSchema);
