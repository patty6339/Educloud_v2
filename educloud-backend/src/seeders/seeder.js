require('dotenv').config();
const mongoose = require('mongoose');
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

        // Seed users
        const createdUsers = await User.create(users);
        console.log('Users seeded successfully');

        // Get instructor ID
        const instructor = createdUsers.find(user => user.role === 'instructor');

        // Add instructor ID to courses
        const coursesWithInstructor = courses.map(course => ({
            ...course,
            instructor: instructor._id
        }));

        // Seed courses
        const createdCourses = await Course.create(coursesWithInstructor);
        console.log('Courses seeded successfully');

        // Add course IDs to lessons and seed them
        const lessonsWithCourses = [];
        createdCourses.forEach((course, index) => {
            // Add two lessons per course
            const courseStartIndex = index * 2;
            const courseLessons = lessons.slice(courseStartIndex, courseStartIndex + 2).map(lesson => ({
                ...lesson,
                courseId: course._id
            }));
            lessonsWithCourses.push(...courseLessons);
        });

        const createdLessons = await Lesson.create(lessonsWithCourses);
        console.log('Lessons seeded successfully');

        // Update courses with lesson IDs
        for (const course of createdCourses) {
            const courseLessons = createdLessons.filter(lesson => 
                lesson.courseId.toString() === course._id.toString()
            );
            course.lessons = courseLessons.map(lesson => lesson._id);
            await course.save();
        }
        console.log('Courses updated with lesson IDs');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeder
seedDB();
