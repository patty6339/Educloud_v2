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
            
            // Get student's enrollments with optimized query
            const [enrollments, counts] = await Promise.all([
                // Get recent enrollments with essential data
                Enrollment.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(userId),
                            status: { $in: ['active', 'completed'] }
                        }
                    },
                    { $sort: { createdAt: -1 } },
                    { $limit: 10 }, // Limit to 10 most recent enrollments
                    {
                        $lookup: {
                            from: 'courses',
                            let: { courseId: '$courseId' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$_id', '$$courseId'] } } },
                                { $project: { 
                                    title: 1, 
                                    description: 1, 
                                    thumbnail: 1 
                                }}
                            ],
                            as: 'course'
                        }
                    },
                    { $unwind: '$course' },
                    {
                        $project: {
                            courseId: '$course._id',
                            title: '$course.title',
                            description: '$course.description',
                            thumbnail: '$course.thumbnail',
                            status: 1,
                            progress: 1,
                            enrollmentDate: '$createdAt'
                        }
                    }
                ]),
                
                // Get enrollment counts in a single aggregation
                Enrollment.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(userId),
                            status: { $in: ['active', 'completed'] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalEnrolled: { $sum: 1 },
                            completedCourses: {
                                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                            },
                            activeCourses: {
                                $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                            }
                        }
                    }
                ])
            ]);

            const countData = counts[0] || { totalEnrolled: 0, completedCourses: 0, activeCourses: 0 };

            const response = {
                ...countData,
                recentCourses: enrollments.map(e => ({
                    id: e.courseId,
                    title: e.title,
                    description: e.description,
                    thumbnail: e.thumbnail,
                    progress: e.progress?.percentageCompleted || 0,
                    status: e.status,
                    enrollmentDate: e.enrollmentDate
                }))
            };

            console.log('Sending optimized student dashboard response:', {
                totalEnrolled: response.totalEnrolled,
                completedCourses: response.completedCourses,
                activeCourses: response.activeCourses,
                recentCoursesCount: response.recentCourses.length
            });
            
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
