const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
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
    dueDate: {
        type: Date,
        required: true
    },
    points: {
        type: Number,
        required: true,
        min: 0
    },
    instructions: {
        type: String,
        required: true
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    submissionType: {
        type: String,
        enum: ['file', 'text', 'link'],
        required: true
    },
    allowedFileTypes: [{
        type: String
    }],
    maxFileSize: {
        type: Number // in bytes
    },
    rubric: [{
        criterion: String,
        points: Number,
        description: String
    }]
}, {
    timestamps: true
});

const submissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submission: {
        content: String,
        fileUrl: String,
        link: String
    },
    submissionDate: {
        type: Date,
        default: Date.now
    },
    grade: {
        score: Number,
        feedback: String,
        gradedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        gradedAt: Date
    },
    status: {
        type: String,
        enum: ['submitted', 'graded', 'late'],
        default: 'submitted'
    }
}, {
    timestamps: true
});

exports.Assignment = mongoose.model('Assignment', assignmentSchema);
exports.AssignmentSubmission = mongoose.model('AssignmentSubmission', submissionSchema);
