const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledStartTime: {
      type: Date,
      required: true,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    actualStartTime: {
      type: Date,
    },
    actualEndTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'ended', 'cancelled'],
      default: 'scheduled',
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      leftAt: {
        type: Date,
      },
    }],
    recording: {
      url: String,
      duration: Number,
      size: Number,
      createdAt: Date,
    },
    settings: {
      enableChat: {
        type: Boolean,
        default: true,
      },
      enableVideo: {
        type: Boolean,
        default: true,
      },
      enableAudio: {
        type: Boolean,
        default: true,
      },
      allowScreenSharing: {
        type: Boolean,
        default: true,
      },
      maxParticipants: {
        type: Number,
        default: 100,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
liveClassSchema.index({ course: 1, scheduledStartTime: 1 });
liveClassSchema.index({ instructor: 1, status: 1 });
liveClassSchema.index({ status: 1, scheduledStartTime: 1 });

// Methods
liveClassSchema.methods.start = function() {
  this.status = 'active';
  this.actualStartTime = new Date();
  return this.save();
};

liveClassSchema.methods.end = function() {
  this.status = 'ended';
  this.actualEndTime = new Date();
  return this.save();
};

liveClassSchema.methods.addParticipant = function(userId) {
  if (!this.participants.some(p => p.user.toString() === userId.toString())) {
    this.participants.push({ user: userId });
  }
  return this.save();
};

liveClassSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString() && !p.leftAt
  );
  if (participant) {
    participant.leftAt = new Date();
  }
  return this.save();
};

// Statics
liveClassSchema.statics.getUpcoming = function(courseId) {
  return this.find({
    course: courseId,
    status: 'scheduled',
    scheduledStartTime: { $gt: new Date() },
  })
    .sort('scheduledStartTime')
    .populate('instructor', 'name email avatar');
};

liveClassSchema.statics.getActive = function() {
  return this.find({
    status: 'active',
  })
    .populate('instructor', 'name email avatar')
    .populate('course', 'title');
};

const LiveClass = mongoose.model('LiveClass', liveClassSchema);
module.exports = LiveClass;
