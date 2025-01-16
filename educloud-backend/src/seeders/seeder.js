require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { Assignment } = require('../models/Assignment');

// Import seed data
const users = require('./data/users');
const courses = require('./data/courses');
const lessons = require('./data/lessons');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected for seeding...'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Function to clean the database
const cleanDB = async () => {
    try {
        await Promise.all([
            User.deleteMany({}),
            Course.deleteMany({}),
            Lesson.deleteMany({}),
            Assignment.deleteMany({})
        ]);
        console.log('Database cleaned successfully');
    } catch (error) {
        console.error('Error cleaning database:', error);
        process.exit(1);
    }
};

// Main seeding function
const seedDB = async () => {
    try {
        // Clean the database first
        await cleanDB();

        // Hash passwords for users
        const hashedUsers = await Promise.all(
            users.map(async user => ({
                ...user,
                password: await bcrypt.hash(user.password, 10)
            }))
        );

        // Create users first
        const createdUsers = await User.insertMany(hashedUsers);
        console.log('Users seeded successfully');

        // Add user references to courses
        const instructorUser = createdUsers.find(user => user.role === 'instructor');
        const coursesWithInstructor = courses.map(course => ({
            ...course,
            instructor: instructorUser._id
        }));

        // Create courses
        const createdCourses = await Course.insertMany(coursesWithInstructor);
        console.log('Courses seeded successfully');

        // Add course references to lessons
        const lessonsWithCourses = lessons.map((lesson, index) => ({
            ...lesson,
            courseId: createdCourses[Math.floor(index / 3)]._id // Distribute lessons among courses
        }));

        // Create lessons
        await Lesson.insertMany(lessonsWithCourses);
        console.log('Lessons seeded successfully');

        console.log('All data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeder
seedDB();
