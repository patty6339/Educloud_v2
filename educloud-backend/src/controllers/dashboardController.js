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

            // Aggregate stats
            const totalStudents = await Enrollment.distinct('userId', { 
                courseId: { $in: courseIds },
                status: { $in: ['active', 'completed'] }
            }).countDocuments();

            const totalCourses = courses.length;
            const totalEnrollments = await Enrollment.countDocuments({
                courseId: { $in: courseIds },
                status: { $in: ['active', 'completed'] }
            });

            // Course Performance
            const coursePerformance = await Course.aggregate([
                { $match: { instructor: userId } },
                {
                    $lookup: {
                        from: 'enrollments',
                        localField: '_id',
                        foreignField: 'courseId',
                        as: 'enrollments'
                    }
                },
                {
                    $addFields: {
                        completedEnrollments: {
                            $filter: {
                                input: '$enrollments',
                                as: 'enrollment',
                                cond: { $eq: ['$$enrollment.status', 'completed'] }
                            }
                        }
                    }
                },
                {
                    $project: {
                        title: 1,
                        totalEnrollments: { $size: '$enrollments' },
                        completedEnrollments: { $size: '$completedEnrollments' },
                        completionRate: {
                            $cond: [
                                { $gt: [{ $size: '$enrollments' }, 0] },
                                { 
                                    $multiply: [
                                        { $divide: [{ $size: '$completedEnrollments' }, { $size: '$enrollments' }] }, 
                                        100 
                                    ] 
                                },
                                0
                            ]
                        }
                    }
                }
            ]);

            // Recent Activities
            const recentActivities = await Enrollment.aggregate([
                {
                    $match: {
                        courseId: { $in: courseIds }
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
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $limit: 10
                },
                {
                    $project: {
                        studentName: '$student.name',
                        courseName: '$course.title',
                        status: 1,
                        createdAt: 1
                    }
                }
            ]);

            res.json({
                totalStudents,
                totalCourses,
                totalEnrollments,
                coursePerformance,
                recentActivities
            });
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
