const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

exports.createLiveClass = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  if (course.instructor.toString() !== req.user.id) {
    throw new ApiError(403, 'Only course instructor can create live classes');
  }

  const liveClass = await LiveClass.create({
    ...req.body,
    course: courseId,
    instructor: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: liveClass,
  });
});

exports.getLiveClasses = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { status } = req.query;

  const filter = { course: courseId };
  if (status) {
    filter.status = status;
  }

  const liveClasses = await LiveClass.find(filter)
    .populate('instructor', 'name email avatar')
    .sort('-scheduledStartTime');

  res.json({
    status: 'success',
    data: liveClasses,
  });
});

exports.getLiveClass = catchAsync(async (req, res) => {
  const { id } = req.params;
  const liveClass = await LiveClass.findById(id)
    .populate('instructor', 'name email avatar')
    .populate('course', 'title description')
    .populate('participants.user', 'name email avatar');

  if (!liveClass) {
    throw new ApiError(404, 'Live class not found');
  }

  res.json({
    status: 'success',
    data: liveClass,
  });
});

exports.updateLiveClass = catchAsync(async (req, res) => {
  const { id } = req.params;
  const liveClass = await LiveClass.findById(id);

  if (!liveClass) {
    throw new ApiError(404, 'Live class not found');
  }

  if (liveClass.instructor.toString() !== req.user.id) {
    throw new ApiError(403, 'Only instructor can update live class');
  }

  // Don't allow updating certain fields after class has started
  if (liveClass.status !== 'scheduled') {
    const restrictedFields = ['scheduledStartTime', 'scheduledEndTime'];
    restrictedFields.forEach(field => {
      delete req.body[field];
    });
  }

  const updatedLiveClass = await LiveClass.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.json({
    status: 'success',
    data: updatedLiveClass,
  });
});

exports.deleteLiveClass = catchAsync(async (req, res) => {
  const { id } = req.params;
  const liveClass = await LiveClass.findById(id);

  if (!liveClass) {
    throw new ApiError(404, 'Live class not found');
  }

  if (liveClass.instructor.toString() !== req.user.id) {
    throw new ApiError(403, 'Only instructor can delete live class');
  }

  if (liveClass.status === 'active') {
    throw new ApiError(400, 'Cannot delete an active live class');
  }

  await liveClass.remove();

  res.json({
    status: 'success',
    data: null,
  });
});

exports.startLiveClass = catchAsync(async (req, res) => {
  const { id } = req.params;
  const liveClass = await LiveClass.findById(id);

  if (!liveClass) {
    throw new ApiError(404, 'Live class not found');
  }

  if (liveClass.instructor.toString() !== req.user.id) {
    throw new ApiError(403, 'Only instructor can start live class');
  }

  if (liveClass.status !== 'scheduled') {
    throw new ApiError(400, 'Live class can only be started from scheduled state');
  }

  await liveClass.start();

  // Notify connected users through WebSocket
  req.app.get('websocket').broadcastToRoom(
    liveClass.course.toString(),
    'live_class:started',
    { classId: liveClass.id }
  );

  res.json({
    status: 'success',
    data: liveClass,
  });
});

exports.endLiveClass = catchAsync(async (req, res) => {
  const { id } = req.params;
  const liveClass = await LiveClass.findById(id);

  if (!liveClass) {
    throw new ApiError(404, 'Live class not found');
  }

  if (liveClass.instructor.toString() !== req.user.id) {
    throw new ApiError(403, 'Only instructor can end live class');
  }

  if (liveClass.status !== 'active') {
    throw new ApiError(400, 'Only active live classes can be ended');
  }

  await liveClass.end();

  // Notify connected users through WebSocket
  req.app.get('websocket').broadcastToRoom(
    liveClass.course.toString(),
    'live_class:ended',
    { classId: liveClass.id }
  );

  res.json({
    status: 'success',
    data: liveClass,
  });
});

exports.joinLiveClass = catchAsync(async (req, res) => {
  const { id } = req.params;
  const liveClass = await LiveClass.findById(id);

  if (!liveClass) {
    throw new ApiError(404, 'Live class not found');
  }

  if (liveClass.status !== 'active') {
    throw new ApiError(400, 'Live class is not active');
  }

  await liveClass.addParticipant(req.user.id);

  // Notify connected users through WebSocket
  req.app.get('websocket').broadcastToRoom(
    liveClass.course.toString(),
    'live_class:participant_joined',
    {
      classId: liveClass.id,
      user: {
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar,
      },
    }
  );

  res.json({
    status: 'success',
    data: liveClass,
  });
});

exports.leaveLiveClass = catchAsync(async (req, res) => {
  const { id } = req.params;
  const liveClass = await LiveClass.findById(id);

  if (!liveClass) {
    throw new ApiError(404, 'Live class not found');
  }

  await liveClass.removeParticipant(req.user.id);

  // Notify connected users through WebSocket
  req.app.get('websocket').broadcastToRoom(
    liveClass.course.toString(),
    'live_class:participant_left',
    {
      classId: liveClass.id,
      userId: req.user.id,
    }
  );

  res.json({
    status: 'success',
    data: null,
  });
});
