const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const LiveClass = require('../../../src/models/LiveClass');
const Course = require('../../../src/models/Course');
const liveClassController = require('../../../src/controllers/liveClassController');
const ApiError = require('../../../src/utils/ApiError');

jest.mock('../../../src/models/LiveClass');
jest.mock('../../../src/models/Course');

describe('LiveClass Controller', () => {
  let mockReq;
  let mockRes;
  const mockUser = {
    id: new mongoose.Types.ObjectId(),
    role: 'teacher',
  };

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    mockReq.user = mockUser;
  });

  describe('createLiveClass', () => {
    beforeEach(() => {
      mockReq.params = { courseId: new mongoose.Types.ObjectId() };
      mockReq.body = {
        title: 'Test Live Class',
        description: 'Test Description',
        scheduledStartTime: '2025-01-03T10:00:00Z',
        scheduledEndTime: '2025-01-03T11:00:00Z',
      };
    });

    it('should create a live class successfully', async () => {
      const mockCourse = {
        _id: mockReq.params.courseId,
        instructor: mockUser.id,
      };
      
      Course.findById.mockResolvedValue(mockCourse);
      LiveClass.create.mockResolvedValue({ ...mockReq.body, _id: new mongoose.Types.ObjectId() });

      await liveClassController.createLiveClass(mockReq, mockRes);
      
      expect(mockRes.statusCode).toBe(201);
      expect(LiveClass.create).toHaveBeenCalledWith({
        ...mockReq.body,
        course: mockReq.params.courseId,
        instructor: mockUser.id,
      });
    });

    it('should throw error if course not found', async () => {
      Course.findById.mockResolvedValue(null);

      await expect(liveClassController.createLiveClass(mockReq, mockRes))
        .rejects
        .toThrow(new ApiError(404, 'Course not found'));
    });

    it('should throw error if user is not course instructor', async () => {
      const mockCourse = {
        _id: mockReq.params.courseId,
        instructor: new mongoose.Types.ObjectId(), // Different instructor
      };
      
      Course.findById.mockResolvedValue(mockCourse);

      await expect(liveClassController.createLiveClass(mockReq, mockRes))
        .rejects
        .toThrow(new ApiError(403, 'Only course instructor can create live classes'));
    });
  });

  describe('getLiveClasses', () => {
    it('should get live classes successfully', async () => {
      const mockClasses = [
        { _id: new mongoose.Types.ObjectId(), title: 'Class 1' },
        { _id: new mongoose.Types.ObjectId(), title: 'Class 2' },
      ];

      mockReq.params = { courseId: new mongoose.Types.ObjectId() };
      LiveClass.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockClasses),
        }),
      });

      await liveClassController.getLiveClasses(mockReq, mockRes);
      
      expect(mockRes.statusCode).toBe(200);
      expect(JSON.parse(mockRes._getData())).toEqual({
        status: 'success',
        data: mockClasses,
      });
    });
  });

  describe('startLiveClass', () => {
    let mockLiveClass;

    beforeEach(() => {
      mockLiveClass = {
        _id: new mongoose.Types.ObjectId(),
        instructor: mockUser.id,
        status: 'scheduled',
        start: jest.fn(),
      };
      mockReq.params = { id: mockLiveClass._id };
    });

    it('should start a live class successfully', async () => {
      LiveClass.findById.mockResolvedValue(mockLiveClass);
      mockLiveClass.start.mockResolvedValue(mockLiveClass);

      await liveClassController.startLiveClass(mockReq, mockRes);
      
      expect(mockRes.statusCode).toBe(200);
      expect(mockLiveClass.start).toHaveBeenCalled();
    });

    it('should throw error if class not found', async () => {
      LiveClass.findById.mockResolvedValue(null);

      await expect(liveClassController.startLiveClass(mockReq, mockRes))
        .rejects
        .toThrow(new ApiError(404, 'Live class not found'));
    });

    it('should throw error if user is not instructor', async () => {
      mockLiveClass.instructor = new mongoose.Types.ObjectId(); // Different instructor
      LiveClass.findById.mockResolvedValue(mockLiveClass);

      await expect(liveClassController.startLiveClass(mockReq, mockRes))
        .rejects
        .toThrow(new ApiError(403, 'Only instructor can start live class'));
    });
  });

  describe('joinLiveClass', () => {
    let mockLiveClass;

    beforeEach(() => {
      mockLiveClass = {
        _id: new mongoose.Types.ObjectId(),
        status: 'active',
        addParticipant: jest.fn(),
      };
      mockReq.params = { id: mockLiveClass._id };
    });

    it('should join a live class successfully', async () => {
      LiveClass.findById.mockResolvedValue(mockLiveClass);
      mockLiveClass.addParticipant.mockResolvedValue(mockLiveClass);

      await liveClassController.joinLiveClass(mockReq, mockRes);
      
      expect(mockRes.statusCode).toBe(200);
      expect(mockLiveClass.addParticipant).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw error if class is not active', async () => {
      mockLiveClass.status = 'scheduled';
      LiveClass.findById.mockResolvedValue(mockLiveClass);

      await expect(liveClassController.joinLiveClass(mockReq, mockRes))
        .rejects
        .toThrow(new ApiError(400, 'Live class is not active'));
    });
  });
});
