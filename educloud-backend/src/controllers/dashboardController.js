const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const mongoose = require('mongoose');

exports.getStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        console.log('Dashboard Stats Request:', {
            userId: userId.toString(),
            userRole
        });

        if (userRole === 'instructor') {
            // Get instructor's courses with enrollment counts using aggregation
            const courseStats = await Course.aggregate([
                {
                    $match: {
                        instructor: new mongoose.Types.ObjectId(userId)
                    }
                },
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
                        activeEnrollments: {
                            $size: {
                                $filter: {
                                    input: '$enrollments',
                                    as: 'enrollment',
                                    cond: { $eq: ['$$enrollment.status', 'active'] }
                                }
                            }
                        },
                        totalEnrollments: { $size: '$enrollments' },
                        uniqueStudents: {
                            $size: {
                                $setUnion: {
                                    $map: {
                                        input: '$enrollments',
                                        as: 'enrollment',
                                        in: '$$enrollment.userId'
                                    }
                                }
                            }
                        }
                    }
                }
            ]);

            console.log('Course Stats:', courseStats);

            // Calculate total statistics
            const totalCourses = courseStats.length;
            const totalStudents = courseStats.reduce((sum, course) => sum + course.uniqueStudents, 0);
            const activeEnrollments = courseStats.reduce((sum, course) => sum + course.activeEnrollments, 0);

            // Get recent courses
            const recentCourses = await Course.aggregate([
                {
                    $match: {
                        instructor: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $limit: 5
                },
                {
                    $lookup: {
                        from: 'enrollments',
                        localField: '_id',
                        foreignField: 'courseId',
                        as: 'enrollments'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        description: 1,
                        thumbnail: 1,
                        enrollmentCount: {
                            $size: {
                                $filter: {
                                    input: '$enrollments',
                                    as: 'enrollment',
                                    cond: { $in: ['$$enrollment.status', ['active', 'completed']] }
                                }
                            }
                        }
                    }
                }
            ]);

            const response = {
                totalCourses,
                totalStudents,
                activeEnrollments,
                recentCourses: recentCourses.map(course => ({
                    id: course._id,
                    title: course.title,
                    description: course.description,
                    thumbnail: course.thumbnail,
                    enrollmentCount: course.enrollmentCount
                }))
            };

            console.log('Final Response:', response);
            return res.json(response);
        } else {
            // Get student's enrollments with course details
            const enrollments = await Enrollment.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId)
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

            const activeCount = enrollments.filter(e => e.status === 'active').length;
            const completedCount = enrollments.filter(e => e.status === 'completed').length;

            return res.json({
                totalEnrolled: enrollments.length,
                completedCourses: completedCount,
                activeCourses: activeCount,
                recentCourses: enrollments.slice(0, 5).map(e => ({
                    id: e.course._id,
                    title: e.course.title,
                    description: e.course.description,
                    thumbnail: e.course.thumbnail,
                    progress: e.progress?.percentageCompleted || 0,
                    status: e.status
                }))
            });
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
