const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'dropped'],
        default: 'active'
    },
    progress: {
        completedLessons: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        }],
        lastAccessed: {
            type: Date,
            default: Date.now
        },
        percentageCompleted: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Add indexes
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
