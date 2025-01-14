const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Course description is required']
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Course instructor is required']
    },
    category: {
        type: String,
        required: [true, 'Course category is required'],
        enum: [
            'Programming',
            'Web Development',
            'Data Science',
            'Machine Learning',
            'Mobile Development',
            'DevOps',
            'Database',
            'Cloud Computing',
            'Cybersecurity',
            'Other'
        ]
    },
    level: {
        type: String,
        required: [true, 'Course level is required'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    price: {
        type: Number,
        required: [true, 'Course price is required'],
        min: 0
    },
    duration: {
        type: Number,
        required: [true, 'Course duration is required'],
        min: 0
    },
    thumbnail: {
        type: String,
        default: '/uploads/courses/default-course.svg'
    },
    prerequisites: [{
        type: String,
        trim: true
    }],
    objectives: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    enrollmentCount: {
        type: Number,
        default: 0
    },
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
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for total duration
courseSchema.virtual('totalDuration').get(function() {
    return this.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
});

// Index for searching
courseSchema.index({ title: 'text', description: 'text', category: 'text' });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
