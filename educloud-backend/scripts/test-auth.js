require('dotenv').config();
const axios = require('axios');

const baseURL = `http://localhost:${process.env.PORT || 3000}/api`;

const testUsers = [
    {
        role: 'admin',
        email: 'admin@educloud.com',
        password: 'Admin@123'
    },
    {
        role: 'instructor',
        email: 'instructor@educloud.com',
        password: 'Instructor@123'
    },
    {
        role: 'student',
        email: 'student@educloud.com',
        password: 'Student@123'
    }
];

async function testLogin(user) {
    try {
        console.log(`\nTesting login for ${user.role}...`);
        console.log('Request URL:', `${baseURL}/auth/login`);
        console.log('Request body:', { email: user.email, password: user.password });

        const response = await axios.post(`${baseURL}/auth/login`, {
            email: user.email,
            password: user.password
        });

        console.log('Login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data.token;
    } catch (error) {
        console.error('Login failed!');
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
        return null;
    }
}

async function testProtectedRoute(token) {
    if (!token) {
        console.log('Skipping protected route test - no token available');
        return;
    }

    try {
        console.log('\nTesting protected route...');
        console.log('Request URL:', `${baseURL}/users/profile`);
        
        const response = await axios.get(`${baseURL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Protected route access successful!');
        console.log('Profile data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Failed to access protected route!');
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

async function runTests() {
    console.log('Starting authentication tests...');
    console.log('Server URL:', baseURL);
    console.log('-'.repeat(50));
    
    for (const user of testUsers) {
        const token = await testLogin(user);
        await testProtectedRoute(token);
        console.log('-'.repeat(50));
    }
}

runTests().catch(error => {
    console.error('Test script failed:', error);
    process.exit(1);
});
