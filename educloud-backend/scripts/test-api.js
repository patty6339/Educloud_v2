require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const baseURL = `http://localhost:${process.env.PORT || 3001}/api`;
let adminToken, instructorToken, studentToken;

// Test user credentials
const users = {
    admin: {
        email: 'admin@educloud.com',
        password: 'Admin@123'
    },
    instructor: {
        email: 'instructor@educloud.com',
        password: 'Instructor@123'
    },
    student: {
        email: 'student@educloud.com',
        password: 'Student@123'
    }
};

// Test data
const testCourse = {
    title: 'Test Course',
    description: 'A test course for API testing',
    category: 'Programming',
    level: 'Beginner',
    price: 49.99
};

const testLesson = {
    title: 'Test Lesson',
    description: 'A test lesson for API testing',
    content: 'This is the lesson content',
    duration: 60
};

// Helper function to log responses
const logResponse = (title, response) => {
    console.log(`\n=== ${title} ===`);
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
};

// Helper function to handle errors
const handleError = (error, operation) => {
    console.error(`\nError during ${operation}:`);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
    } else if (error.request) {
        console.error('No response received:', error.message);
    } else {
        console.error('Error:', error.message);
    }
};

// Authentication tests
async function testAuth() {
    console.log('\n=== Testing Authentication ===');
    try {
        // Login as admin
        const adminResponse = await axios.post(`${baseURL}/auth/login`, users.admin);
        adminToken = adminResponse.data.token;
        logResponse('Admin Login', adminResponse);

        // Login as instructor
        const instructorResponse = await axios.post(`${baseURL}/auth/login`, users.instructor);
        instructorToken = instructorResponse.data.token;
        logResponse('Instructor Login', instructorResponse);

        // Login as student
        const studentResponse = await axios.post(`${baseURL}/auth/login`, users.student);
        studentToken = studentResponse.data.token;
        logResponse('Student Login', studentResponse);

    } catch (error) {
        handleError(error, 'authentication');
    }
}

// Course management tests
async function testCourseManagement() {
    console.log('\n=== Testing Course Management ===');
    let createdCourseId;

    try {
        // Create course (instructor)
        const createResponse = await axios.post(
            `${baseURL}/courses`,
            testCourse,
            { headers: { Authorization: `Bearer ${instructorToken}` } }
        );
        createdCourseId = createResponse.data.course._id;
        logResponse('Create Course', createResponse);

        // Get course details
        const getResponse = await axios.get(
            `${baseURL}/courses/${createdCourseId}`,
            { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        logResponse('Get Course Details', getResponse);

        // Update course (instructor)
        const updateResponse = await axios.put(
            `${baseURL}/courses/${createdCourseId}`,
            { ...testCourse, title: 'Updated Test Course' },
            { headers: { Authorization: `Bearer ${instructorToken}` } }
        );
        logResponse('Update Course', updateResponse);

        // List all courses
        const listResponse = await axios.get(
            `${baseURL}/courses`,
            { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        logResponse('List Courses', listResponse);

        return createdCourseId;
    } catch (error) {
        handleError(error, 'course management');
    }
}

// Lesson management tests
async function testLessonManagement(courseId) {
    console.log('\n=== Testing Lesson Management ===');
    let createdLessonId;

    try {
        // Create lesson
        const createResponse = await axios.post(
            `${baseURL}/courses/${courseId}/lessons`,
            testLesson,
            { headers: { Authorization: `Bearer ${instructorToken}` } }
        );
        createdLessonId = createResponse.data.lesson._id;
        logResponse('Create Lesson', createResponse);

        // Get lesson details
        const getResponse = await axios.get(
            `${baseURL}/courses/${courseId}/lessons/${createdLessonId}`,
            { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        logResponse('Get Lesson Details', getResponse);

        // Update lesson
        const updateResponse = await axios.put(
            `${baseURL}/courses/${courseId}/lessons/${createdLessonId}`,
            { ...testLesson, title: 'Updated Test Lesson' },
            { headers: { Authorization: `Bearer ${instructorToken}` } }
        );
        logResponse('Update Lesson', updateResponse);

        return createdLessonId;
    } catch (error) {
        handleError(error, 'lesson management');
    }
}

// Enrollment tests
async function testEnrollment(courseId) {
    console.log('\n=== Testing Enrollment ===');
    
    try {
        // Enroll in course
        const enrollResponse = await axios.post(
            `${baseURL}/enrollments`,
            { courseId },
            { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        logResponse('Enroll in Course', enrollResponse);

        // Get student's enrollments
        const listResponse = await axios.get(
            `${baseURL}/enrollments`,
            { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        logResponse('List Enrollments', listResponse);

        // Get course progress
        const progressResponse = await axios.get(
            `${baseURL}/enrollments/${courseId}/progress`,
            { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        logResponse('Get Course Progress', progressResponse);

    } catch (error) {
        handleError(error, 'enrollment');
    }
}

// User management tests
async function testUserManagement() {
    console.log('\n=== Testing User Management ===');
    
    try {
        // Get user profile
        const profileResponse = await axios.get(
            `${baseURL}/users/profile`,
            { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        logResponse('Get User Profile', profileResponse);

        // Update user profile
        const updateResponse = await axios.put(
            `${baseURL}/users/profile`,
            { bio: 'Updated bio for testing' },
            { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        logResponse('Update User Profile', updateResponse);

        // Admin: List all users
        const listResponse = await axios.get(
            `${baseURL}/users`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        logResponse('List All Users (Admin)', listResponse);

    } catch (error) {
        handleError(error, 'user management');
    }
}

// Run all tests
async function runTests() {
    try {
        console.log('Starting API tests...');
        console.log('Server URL:', baseURL);
        
        // Run authentication tests
        await testAuth();
        
        if (!adminToken || !instructorToken || !studentToken) {
            throw new Error('Authentication failed. Cannot proceed with other tests.');
        }

        // Run course management tests
        const courseId = await testCourseManagement();
        
        if (courseId) {
            // Run lesson management tests
            const lessonId = await testLessonManagement(courseId);
            
            // Run enrollment tests
            await testEnrollment(courseId);
        }

        // Run user management tests
        await testUserManagement();

        console.log('\nAPI tests completed!');
    } catch (error) {
        console.error('\nTest suite failed:', error.message);
    }
}

// Run the test suite
runTests();
