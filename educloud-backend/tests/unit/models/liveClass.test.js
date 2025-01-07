const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const LiveClass = require('../../../src/models/LiveClass');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('LiveClass Model', () => {
  let mockLiveClass;
  const mockInstructor = new mongoose.Types.ObjectId();
  const mockCourse = new mongoose.Types.ObjectId();

  beforeEach(() => {
    mockLiveClass = {
      title: 'Test Live Class',
      description: 'Test Description',
      course: mockCourse,
      instructor: mockInstructor,
      scheduledStartTime: new Date('2025-01-03T10:00:00Z'),
      scheduledEndTime: new Date('2025-01-03T11:00:00Z'),
      status: 'scheduled',
      settings: {
        enableChat: true,
        enableVideo: true,
        enableAudio: true,
        allowScreenSharing: true,
        maxParticipants: 100,
      },
    };
  });

  it('should create a live class successfully', async () => {
    const validLiveClass = new LiveClass(mockLiveClass);
    const savedLiveClass = await validLiveClass.save();
    
    expect(savedLiveClass.title).toBe(mockLiveClass.title);
    expect(savedLiveClass.status).toBe('scheduled');
    expect(savedLiveClass.settings.enableChat).toBe(true);
  });

  it('should fail to create without required fields', async () => {
    const invalidLiveClass = new LiveClass({});
    let error;

    try {
      await invalidLiveClass.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.course).toBeDefined();
    expect(error.errors.instructor).toBeDefined();
  });

  it('should start a live class correctly', async () => {
    const liveClass = new LiveClass(mockLiveClass);
    await liveClass.save();
    
    await liveClass.start();
    
    expect(liveClass.status).toBe('active');
    expect(liveClass.actualStartTime).toBeDefined();
  });

  it('should end a live class correctly', async () => {
    const liveClass = new LiveClass(mockLiveClass);
    await liveClass.save();
    
    await liveClass.start();
    await liveClass.end();
    
    expect(liveClass.status).toBe('ended');
    expect(liveClass.actualEndTime).toBeDefined();
  });

  it('should add and remove participants correctly', async () => {
    const liveClass = new LiveClass(mockLiveClass);
    await liveClass.save();
    
    const participantId = new mongoose.Types.ObjectId();
    
    await liveClass.addParticipant(participantId);
    expect(liveClass.participants.length).toBe(1);
    expect(liveClass.participants[0].user.toString()).toBe(participantId.toString());
    
    await liveClass.removeParticipant(participantId);
    expect(liveClass.participants[0].leftAt).toBeDefined();
  });

  it('should get upcoming classes correctly', async () => {
    await LiveClass.deleteMany({});
    
    // Create multiple classes
    await LiveClass.create([
      mockLiveClass,
      {
        ...mockLiveClass,
        scheduledStartTime: new Date('2025-01-04T10:00:00Z'),
        scheduledEndTime: new Date('2025-01-04T11:00:00Z'),
      },
      {
        ...mockLiveClass,
        scheduledStartTime: new Date('2024-01-01T10:00:00Z'), // Past date
        scheduledEndTime: new Date('2024-01-01T11:00:00Z'),
      },
    ]);

    const upcomingClasses = await LiveClass.getUpcoming(mockCourse);
    expect(upcomingClasses.length).toBe(2);
    expect(upcomingClasses[0].scheduledStartTime).toBeBefore(upcomingClasses[1].scheduledStartTime);
  });

  it('should get active classes correctly', async () => {
    await LiveClass.deleteMany({});
    
    const liveClass = new LiveClass(mockLiveClass);
    await liveClass.save();
    await liveClass.start();

    const activeClasses = await LiveClass.getActive();
    expect(activeClasses.length).toBe(1);
    expect(activeClasses[0].status).toBe('active');
  });
});
