import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Container, 
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  People as PeopleIcon, 
  School as SchoolIcon, 
  AssignmentTurnedIn as AssignmentIcon,
  TrendingUp as ProgressIcon
} from '@mui/icons-material';
import { coursesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ icon, title, value, color }) => (
  <Card 
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      background: `linear-gradient(135deg, ${color}80, ${color}20)`,
      transition: 'transform 0.3s',
      '&:hover': {
        transform: 'scale(1.05)'
      }
    }}
    elevation={4}
  >
    <CardContent sx={{ textAlign: 'center' }}>
      {icon}
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 2 }}>
        {value}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const CoursePerformanceChart = ({ performance = [] }) => (
  <Card sx={{ height: '100%' }} elevation={4}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Course Performance
      </Typography>
      {performance.map((course, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="subtitle1">{course.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={course.completionRate || 0} 
                color={
                  (course.completionRate > 70) ? 'success' : 
                  (course.completionRate > 40) ? 'warning' : 'error'
                }
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                {`${Math.round(course.completionRate || 0)}%`}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
    </CardContent>
  </Card>
);

const RecentActivitiesTable = ({ activities = [] }) => (
  <Card sx={{ height: '100%' }} elevation={4}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Recent Activities
      </Typography>
      {activities.length === 0 ? (
        <Typography variant="body2" color="textSecondary" align="center">
          No recent activities
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>{activity.studentName || 'N/A'}</TableCell>
                  <TableCell>{activity.courseName || 'N/A'}</TableCell>
                  <TableCell>{activity.status || 'N/A'}</TableCell>
                  <TableCell>
                    {activity.createdAt 
                      ? new Date(activity.createdAt).toLocaleDateString() 
                      : 'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </CardContent>
  </Card>
);

const StudentCourseProgressChart = ({ courses = [] }) => {
  if (!courses || courses.length === 0) {
    return (
      <Card sx={{ height: '100%' }} elevation={4}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Course Progress
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            No courses in progress
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }} elevation={4}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Course Progress
        </Typography>
        {courses.map((course, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">{course.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={course.completionRate || 0} 
                  color={
                    (course.completionRate > 70) ? 'success' : 
                    (course.completionRate > 40) ? 'warning' : 'error'
                  }
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${Math.round(course.completionRate || 0)}%`}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

const RecentLearningActivitiesTable = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <Card sx={{ height: '100%' }} elevation={4}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Learning Activities
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            No recent learning activities
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }} elevation={4}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Learning Activities
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Activity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>{activity.courseName || 'N/A'}</TableCell>
                  <TableCell>{activity.activityName || 'N/A'}</TableCell>
                  <TableCell>{activity.status || 'N/A'}</TableCell>
                  <TableCell>
                    {activity.createdAt 
                      ? new Date(activity.createdAt).toLocaleDateString() 
                      : 'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      // First, check local storage for dashboard stats
      const storedStats = localStorage.getItem('dashboardStats');
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        setDashboardData(parsedStats);
        // Remove the stored stats to prevent reusing stale data
        localStorage.removeItem('dashboardStats');
        setLoading(false);
        return;
      }

      // If no stored stats, fetch from API
      const response = await coursesAPI.getDashboardStats();
      console.log('Dashboard response:', response.data);
      setDashboardData(response.data || {});
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading) {
    return (
      <Container sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Separate dashboards for different roles
  if (user?.role === 'instructor') {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name || 'Instructor'}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StatCard 
              icon={<PeopleIcon sx={{ fontSize: 60, color: '#1976d2' }} />} 
              title="Total Students" 
              value={dashboardData.totalStudents || 0} 
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard 
              icon={<SchoolIcon sx={{ fontSize: 60, color: '#dc004e' }} />} 
              title="Total Courses" 
              value={dashboardData.totalCourses || 0} 
              color="#dc004e"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard 
              icon={<AssignmentIcon sx={{ fontSize: 60, color: '#4caf50' }} />} 
              title="Total Enrollments" 
              value={dashboardData.totalEnrollments || 0} 
              color="#4caf50"
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <CoursePerformanceChart 
              performance={dashboardData.coursePerformance || []} 
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <RecentActivitiesTable 
              activities={dashboardData.recentActivities || []} 
            />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Student Dashboard
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || 'Student'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard 
            icon={<SchoolIcon sx={{ fontSize: 60, color: '#1976d2' }} />} 
            title="Enrolled Courses" 
            value={dashboardData.enrolledCourses || 0} 
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard 
            icon={<AssignmentIcon sx={{ fontSize: 60, color: '#dc004e' }} />} 
            title="Completed Courses" 
            value={dashboardData.completedCourses || 0} 
            color="#dc004e"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard 
            icon={<ProgressIcon sx={{ fontSize: 60, color: '#4caf50' }} />} 
            title="Average Progress" 
            value={`${dashboardData.averageProgress || 0}%`} 
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12} md={7}>
          <StudentCourseProgressChart 
            courses={dashboardData.studentCourses || []} 
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <RecentLearningActivitiesTable 
            activities={dashboardData.recentLearningActivities || []} 
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
