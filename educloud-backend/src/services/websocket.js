const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/userModel');

class WebSocketManager {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.rooms = new Map(); // roomId -> Set of socket ids
    this.users = new Map(); // userId -> socket id
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.name}`);
      this.users.set(socket.user.id, socket.id);

      // Chat Events
      socket.on('chat:join', (data) => this.handleChatJoin(socket, data));
      socket.on('chat:leave', (data) => this.handleChatLeave(socket, data));
      socket.on('chat:message', (data) => this.handleChatMessage(socket, data));

      // Live Class Events
      socket.on('live_class:join', (data) => this.handleLiveClassJoin(socket, data));
      socket.on('live_class:leave', (data) => this.handleLiveClassLeave(socket, data));
      socket.on('live_class:start', (data) => this.handleLiveClassStart(socket, data));
      socket.on('live_class:end', (data) => this.handleLiveClassEnd(socket, data));

      // WebRTC Events
      socket.on('webrtc:offer', (data) => this.handleWebRTCOffer(socket, data));
      socket.on('webrtc:answer', (data) => this.handleWebRTCAnswer(socket, data));
      socket.on('webrtc:ice_candidate', (data) => this.handleICECandidate(socket, data));

      // Presence Events
      socket.on('presence', (data) => this.handlePresenceUpdate(socket, data));
      
      // Disconnect
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  // Chat Handlers
  handleChatJoin(socket, { roomId }) {
    socket.join(roomId);
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(socket.id);
    
    this.io.to(roomId).emit('chat:user_joined', {
      user: {
        id: socket.user.id,
        name: socket.user.name,
        avatar: socket.user.avatar,
      },
    });
  }

  handleChatLeave(socket, { roomId }) {
    socket.leave(roomId);
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).delete(socket.id);
    }
    
    this.io.to(roomId).emit('chat:user_left', {
      user: {
        id: socket.user.id,
        name: socket.user.name,
      },
    });
  }

  handleChatMessage(socket, { roomId, message }) {
    this.io.to(roomId).emit('chat:message', {
      id: Date.now().toString(),
      content: message.content,
      type: message.type,
      sender: {
        id: socket.user.id,
        name: socket.user.name,
        avatar: socket.user.avatar,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Live Class Handlers
  handleLiveClassJoin(socket, { classId }) {
    socket.join(classId);
    if (!this.rooms.has(classId)) {
      this.rooms.set(classId, new Set());
    }
    this.rooms.get(classId).add(socket.id);
    
    this.io.to(classId).emit('live_class:joined', {
      user: {
        id: socket.user.id,
        name: socket.user.name,
        role: socket.user.role,
        avatar: socket.user.avatar,
      },
    });
  }

  handleLiveClassLeave(socket, { classId }) {
    socket.leave(classId);
    if (this.rooms.has(classId)) {
      this.rooms.get(classId).delete(socket.id);
    }
    
    this.io.to(classId).emit('live_class:left', {
      user: {
        id: socket.user.id,
        name: socket.user.name,
      },
    });
  }

  handleLiveClassStart(socket, { classId }) {
    if (socket.user.role !== 'teacher') {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    this.io.to(classId).emit('live_class:status', {
      classId,
      status: 'active',
    });
  }

  handleLiveClassEnd(socket, { classId }) {
    if (socket.user.role !== 'teacher') {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    this.io.to(classId).emit('live_class:status', {
      classId,
      status: 'ended',
    });
  }

  // WebRTC Handlers
  handleWebRTCOffer(socket, { offer, participantId }) {
    const participantSocketId = this.users.get(participantId);
    if (participantSocketId) {
      this.io.to(participantSocketId).emit('webrtc:offer', {
        offer,
        participantId: socket.user.id,
      });
    }
  }

  handleWebRTCAnswer(socket, { answer, participantId }) {
    const participantSocketId = this.users.get(participantId);
    if (participantSocketId) {
      this.io.to(participantSocketId).emit('webrtc:answer', {
        answer,
        participantId: socket.user.id,
      });
    }
  }

  handleICECandidate(socket, { candidate, participantId }) {
    const participantSocketId = this.users.get(participantId);
    if (participantSocketId) {
      this.io.to(participantSocketId).emit('webrtc:ice_candidate', {
        candidate,
        participantId: socket.user.id,
      });
    }
  }

  // Presence Handler
  handlePresenceUpdate(socket, { status }) {
    const rooms = this.getRoomsForUser(socket.id);
    rooms.forEach((roomId) => {
      this.io.to(roomId).emit('presence:update', {
        userId: socket.user.id,
        status,
      });
    });
  }

  // Disconnect Handler
  handleDisconnect(socket) {
    console.log(`User disconnected: ${socket.user.name}`);
    this.users.delete(socket.user.id);
    
    // Remove user from all rooms
    this.rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        this.io.to(roomId).emit('user:disconnected', {
          userId: socket.user.id,
        });
      }
    });
  }

  // Utility Methods
  getRoomsForUser(socketId) {
    const rooms = [];
    this.rooms.forEach((participants, roomId) => {
      if (participants.has(socketId)) {
        rooms.push(roomId);
      }
    });
    return rooms;
  }

  broadcastToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  sendToUser(userId, event, data) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }
}

module.exports = WebSocketManager;
