const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';
let courseId = '';
let lessonId = '';

// Test user credentials
const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test123!',
    role: 'student'
};

const testInstructor = {
    name: 'Test Instructor',
    email: `instructor${Date.now()}@example.com`,
    password: 'Instructor123!',
    role: 'instructor'
};

const testCourse = {
    title: 'Test Course',
    description: 'This is a test course',
    category: 'Programming',
    level: 'beginner',
    duration: 3360, // 8 weeks in minutes (8 * 7 * 60)
    price: 99.99,
    status: 'published',
    requirements: ['Basic programming knowledge'],
    objectives: ['Learn to code']
};

const testLesson = {
    title: 'Test Lesson',
    description: 'This is a test lesson',
    content: 'Lesson content goes here',
    duration: 60 // minutes
};

// Helper function to make API calls
const api = axios.create({
    baseURL: API_URL,
    validateStatus: () => true // Don't throw on error status
});

// Set auth token for subsequent requests
const setAuthToken = (token) => {
    authToken = token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Test functions
async function testUserRegistration() {
    try {
        console.log('\n--- Testing User Registration ---');
        
        // Test student registration
        console.log('Attempting student registration...');
        const studentRes = await api.post('/users/register', testUser);
        console.log('Student Registration Response:', {
            status: studentRes.status,
            data: studentRes.data
        });
        
        // Test instructor registration
        console.log('\nAttempting instructor registration...');
        const instructorRes = await api.post('/users/register', testInstructor);
        console.log('Instructor Registration Response:', {
            status: instructorRes.status,
            data: instructorRes.data
        });

        return studentRes.status === 201 && instructorRes.status === 201;
    } catch (error) {
        console.error('Registration Error:', {
            message: error.message,
            response: error.response?.data
        });
        return false;
    }
}

async function testUserLogin() {
    try {
        console.log('\n--- Testing User Login ---');
        
        // Login as instructor
        console.log('Attempting instructor login...');
        const res = await api.post('/users/login', {
            email: testInstructor.email,
            password: testInstructor.password
        });
        console.log('Login Response:', {
            status: res.status,
            data: res.data
        });
        
        if (res.data.token) {
            setAuthToken(res.data.token);
            console.log('Auth token set successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login Error:', {
            message: error.message,
            response: error.response?.data
        });
        return false;
    }
}

async function testCourseCreation() {
    try {
        console.log('\n--- Testing Course Creation ---');
        
        console.log('Course Data:', testCourse);
        console.log('Attempting to create course...');
        const res = await api.post('/courses', testCourse);
        console.log('Create Course Response:', {
            status: res.status,
            data: res.data,
            error: res.data.error ? {
                message: res.data.error.message,
                errors: res.data.error.errors
            } : undefined
        });
        
        if (res.data.course) {
            courseId = res.data.course._id;
            console.log('Course ID set:', courseId);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Course Creation Error:', {
            message: error.message,
            response: error.response?.data
        });
        return false;
    }
}

async function testLessonCreation() {
    try {
        console.log('\n--- Testing Lesson Creation ---');
        
        if (!courseId) {
            console.log('No course ID available');
            return false;
        }
        
        console.log('Lesson Data:', testLesson);
        console.log('Attempting to create lesson...');
        const res = await api.post(`/courses/${courseId}/lessons`, testLesson);
        console.log('Create Lesson Response:', {
            status: res.status,
            data: res.data,
            error: res.data.error ? {
                message: res.data.error.message,
                errors: res.data.error.errors
            } : undefined
        });
        
        if (res.data.lesson) {
            lessonId = res.data.lesson._id;
            console.log('Lesson ID set:', lessonId);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Lesson Creation Error:', {
            message: error.message,
            response: error.response?.data
        });
        return false;
    }
}

async function testEnrollment() {
    try {
        console.log('\n--- Testing Course Enrollment ---');
        
        // Login as student
        console.log('Logging in as student...');
        const loginRes = await api.post('/users/login', {
            email: testUser.email,
            password: testUser.password
        });
        setAuthToken(loginRes.data.token);
        
        // Enroll in course
        console.log('Enrollment Data:', { courseId });
        console.log('Attempting to enroll in course...');
        const enrollRes = await api.post('/enrollments', { courseId });
        console.log('Enroll in Course Response:', {
            status: enrollRes.status,
            data: enrollRes.data,
            error: enrollRes.data.error ? {
                message: enrollRes.data.error.message,
                errors: enrollRes.data.error.errors
            } : undefined
        });
        
        // Get enrollment details
        console.log('Getting enrollment details...');
        const detailsRes = await api.get(`/enrollments/${courseId}`);
        console.log('Enrollment Details Response:', {
            status: detailsRes.status,
            data: detailsRes.data
        });

        return enrollRes.status === 201 && detailsRes.status === 200;
    } catch (error) {
        console.error('Enrollment Error:', {
            message: error.message,
            response: error.response?.data
        });
        return false;
    }
}

async function testProgress() {
    try {
        console.log('\n--- Testing Progress Tracking ---');
        
        // Complete a lesson
        console.log('Completion Data:', { courseId, lessonId });
        console.log('Attempting to complete lesson...');
        const completeRes = await api.post(`/enrollments/${courseId}/complete-lesson/${lessonId}`);
        console.log('Complete Lesson Response:', {
            status: completeRes.status,
            data: completeRes.data,
            error: completeRes.data.error ? {
                message: completeRes.data.error.message,
                errors: completeRes.data.error.errors
            } : undefined
        });
        
        // Get progress
        console.log('Getting progress...');
        const progressRes = await api.get(`/enrollments/${courseId}/progress`);
        console.log('Get Progress Response:', {
            status: progressRes.status,
            data: progressRes.data
        });

        return completeRes.status === 200 && progressRes.status === 200;
    } catch (error) {
        console.error('Progress Error:', {
            message: error.message,
            response: error.response?.data
        });
        return false;
    }
}

// Run all tests
async function runTests() {
    try {
        console.log('Starting API tests...');
        console.log('API URL:', API_URL);
        
        // Run tests and collect results
        const results = {
            registration: await testUserRegistration(),
            login: await testUserLogin(),
            courseCreation: await testCourseCreation(),
            lessonCreation: await testLessonCreation(),
            enrollment: await testEnrollment(),
            progress: await testProgress()
        };
        
        // Print test summary
        console.log('\n=== Test Summary ===');
        Object.entries(results).forEach(([test, passed]) => {
            console.log(`${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
        });
        
        const allPassed = Object.values(results).every(result => result);
        console.log(`\nOverall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    } catch (error) {
        console.error('\nTest suite failed:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
        });
    }
}

// Run tests
runTests();
