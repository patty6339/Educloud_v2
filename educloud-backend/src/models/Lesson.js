const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
}, { _id: false });

const lessonSchema = new mongoose.Schema({
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
    order: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    videoUrl: {
        type: String
    },
    attachments: [attachmentSchema],
    isPublished: {
        type: Boolean,
        default: false
    },
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
