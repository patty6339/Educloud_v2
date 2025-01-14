const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        console.log('Dashboard Stats Request:', {
            userId: userId.toString(),
            userRole,
            timestamp: new Date().toISOString()
        });

        if (userRole === 'instructor') {
            // Get instructor's courses
            const courses = await Course.find({ instructor: userId });
            const courseIds = courses.map(course => course._id);

            // Get all enrollments for instructor's courses
            const enrollments = await Enrollment.aggregate([
                {
                    $match: {
                        courseId: { $in: courseIds },
                        status: { $in: ['active', 'completed'] }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'student'
                    }
                },
                {
                    $unwind: '$student'
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'courseId',
                        foreignField: '_id',
                        as: 'course'
                    }
                },
                {
                    $unwind: '$course'
                }
            ]);

            // Calculate metrics
            const totalStudents = new Set(enrollments.map(e => e.userId)).size;
            const activeStudents = new Set(enrollments.filter(e => e.status === 'active').map(e => e.userId)).size;
            const totalEnrollments = enrollments.length;
            const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;

            // Calculate average progress
            const averageProgress = enrollments.length > 0
                ? enrollments.reduce((sum, e) => sum + (e.progress?.percentageCompleted || 0), 0) / enrollments.length
                : 0;

            // Get course-specific metrics
            const courseMetrics = courses.map(course => {
                const courseEnrollments = enrollments.filter(e => e.courseId.toString() === course._id.toString());
                return {
                    id: course._id,
                    title: course.title,
                    totalStudents: courseEnrollments.length,
                    activeStudents: courseEnrollments.filter(e => e.status === 'active').length,
                    completedStudents: courseEnrollments.filter(e => e.status === 'completed').length,
                    averageProgress: courseEnrollments.length > 0
                        ? courseEnrollments.reduce((sum, e) => sum + (e.progress?.percentageCompleted || 0), 0) / courseEnrollments.length
                        : 0
                };
            });

            // Get recent activities
            const recentActivities = enrollments
                .sort((a, b) => b.lastAccessed - a.lastAccessed)
                .slice(0, 10)
                .map(e => ({
                    studentName: `${e.student.firstName} ${e.student.lastName}`,
                    courseTitle: e.course.title,
                    action: e.status === 'completed' ? 'completed' : 'enrolled in',
                    date: e.lastAccessed || e.enrollmentDate
                }));

            const response = {
                totalCourses: courses.length,
                publishedCourses: courses.filter(c => c.status === 'published').length,
                draftCourses: courses.filter(c => c.status === 'draft').length,
                totalStudents,
                activeStudents,
                totalEnrollments,
                completedEnrollments,
                averageProgress,
                courseMetrics: courseMetrics.sort((a, b) => b.totalStudents - a.totalStudents),
                recentActivities,
                topCourses: courseMetrics
                    .sort((a, b) => b.totalStudents - a.totalStudents)
                    .slice(0, 5)
            };

            console.log('Sending instructor dashboard response:', response);
            return res.json(response);
        } else {
            console.log('Fetching student dashboard stats');
            // Get student's enrollments with course details
            const enrollments = await Enrollment.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        status: { $in: ['active', 'completed'] }
                    }
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'courseId',
                        foreignField: '_id',
                        as: 'course'
                    }
                },
                {
                    $unwind: '$course'
                },
                {
                    $sort: { enrollmentDate: -1 }
                }
            ]);

            console.log('Found enrollments:', {
                count: enrollments.length,
                enrollments: enrollments.map(e => ({
                    courseId: e.courseId,
                    status: e.status,
                    title: e.course.title
                }))
            });

            const activeCount = enrollments.filter(e => e.status === 'active').length;
            const completedCount = enrollments.filter(e => e.status === 'completed').length;

            const response = {
                totalEnrolled: enrollments.length,
                completedCourses: completedCount,
                activeCourses: activeCount,
                recentCourses: enrollments.slice(0, 5).map(e => ({
                    id: e.course._id,
                    title: e.course.title,
                    description: e.course.description,
                    thumbnail: e.course.thumbnail,
                    progress: e.progress?.percentageCompleted || 0,
                    status: e.status,
                    enrollmentDate: e.enrollmentDate
                }))
            };

            console.log('Sending student dashboard response:', response);
            return res.json(response);
        }
    } catch (error) {
        console.error('Dashboard stats error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};
