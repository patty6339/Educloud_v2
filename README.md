# EduCloud Learning Platform

## Overview
EduCloud is a modern e-learning platform that connects instructors and students through an interactive learning experience. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it provides a robust and scalable solution for online education.

## Features
- 🔐 User Authentication (JWT)
- 👥 Role-based Access (Student/Instructor)
- 📚 Course Management
- 📝 Interactive Lessons
- 📊 Student Progress Tracking
- 💻 Live Virtual Classrooms
- 📱 Responsive Design
- 📈 Analytics Dashboard

## Tech Stack
### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- WebSocket (Socket.io)

### Frontend
- React
- Material-UI
- React Query
- React Router
- Axios

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/educloud.git
cd educloud
```

2. Install Backend Dependencies
```bash
cd educloud-backend
npm install
```

3. Install Frontend Dependencies
```bash
cd ../educloud-frontend
npm install
```

4. Configure Environment Variables
Create .env files in both backend and frontend directories:

Backend (.env):
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/educloud
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

Frontend (.env):
```env
VITE_API_URL=http://localhost:3000/api
```

5. Start Development Servers

Backend:
```bash
cd educloud-backend
npm run dev
```

Frontend:
```bash
cd educloud-frontend
npm run dev
```

## Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application:
```bash
npm install --production
```
3. Start the server:
```bash
npm start
```

### Frontend Deployment
1. Set production environment variables
2. Build the application:
```bash
npm run build
```
3. Deploy the contents of the dist directory to your static hosting service

## API Documentation
API documentation is available at `/api-docs` when running the server.

### Main Endpoints
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/courses - List all courses
- POST /api/courses - Create a new course (Instructor only)
- GET /api/dashboard - Get user dashboard stats

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security
- CORS protection
- Rate limiting
- XSS protection
- NoSQL injection prevention
- Parameter pollution prevention
- Security headers (Helmet)

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support, email support@educloud.com or create an issue in the repository.