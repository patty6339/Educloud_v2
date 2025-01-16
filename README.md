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

# Educloud_v2

---

# **Project Documentation**

## **1. Project Title**  
**Educloud V2**  

---

## **2. Description**  
Educloud V2 is a cutting-edge web application designed for educational purposes. It offers a robust platform for user authentication, course management, and a collaborative learning environment. Built with **Node.js** and **MongoDB**, it leverages modern web technologies to provide a seamless and intuitive user experience.

---

## **3. Table of Contents**
1. [Installation](#4-installation)  
2. [Usage](#5-usage)  
3. [API Endpoints](#6-api-endpoints)  
4. [Authentication](#7-authentication)  
5. [Deployment](#8-deployment)  
6. [Contributing](#9-contributing)  
7. [License](#10-license)  

---

## **4. Installation**  
To set up the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/educloud_v2.git
   cd educloud_v2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory and add the necessary environment variables:
   ```plaintext
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_jwt_secret
   ```

4. **Start the application:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3002`.

---

## **5. Usage**  
Once the application is running, access it through your web browser. The platform provides the following functionalities:  
- **Users** can sign up and log in.  
- **Role-based features** allow access to specific functionalities, such as managing courses or viewing content.

---

## **6. API Endpoints**  

### **User Authentication**
- `POST /api/users/signup` – Create a new user.  
- `POST /api/users/login` – Log in an existing user.  

### **Course Management**
- `GET /api/courses` – Retrieve a list of courses.  
- `POST /api/courses` – Create a new course.  
- `PUT /api/courses/:id` – Update an existing course.  
- `DELETE /api/courses/:id` – Delete a course.  

---

## **7. Authentication**  
Educloud V2 uses **JWT (JSON Web Tokens)** for secure authentication. Users must include a valid token in the `Authorization` header for accessing protected routes.

#### **Example Login Request:**
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "exampleUser",
  "password": "examplePassword"
}
```

---

## **8. Deployment**  
To deploy the application, follow these steps:

1. **Dockerize the Application:**  
   Build the Docker image using the provided `Dockerfile`.

2. **Push to Amazon ECR:**  
   Upload the Docker image to **Amazon Elastic Container Registry (ECR)**.

3. **Deploy on Amazon ECS:**  
   Use **Amazon Elastic Container Service (ECS)** to deploy the Docker image.

Refer to the **Dockerization and AWS Deployment** section in the repository for detailed instructions.

---

## **9. Contributing**  
Contributions to Educloud V2 are welcome! To contribute:  
1. Fork the repository.  
2. Create a new branch for your feature or bug fix.  
3. Implement your changes and commit them with descriptive messages.  
4. Push your branch to GitHub.  
5. Create a pull request for review.

---

## **10. License**  
This project is licensed under the **MIT License**. Refer to the `LICENSE` file in the repository for more details.

---

## **Summary**  
This documentation provides a complete guide to installing, using, and contributing to Educloud V2. If you need further assistance or additional sections, feel free to reach out or suggest improvements.


