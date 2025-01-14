import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completedCourses: 0,
    activeCourses: 0,
    recentCourses: [],
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalStudents: 0,
    activeStudents: 0,
    totalEnrollments: 0,
    completedEnrollments: 0,
    averageProgress: 0,
    courseMetrics: [],
    recentActivities: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching dashboard data for user:', user);
      const response = await coursesAPI.getDashboardStats();
      console.log('Dashboard response:', response.data);
      if (response.data) {
        setStats(response.data);
      } else {
        setError('No data received from server');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const InstructorDashboard = () => (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
          <Typography color="textSecondary" gutterBottom variant="h6">
            Total Courses
          </Typography>
          <Typography component="p" variant="h3">
            {stats.totalCourses}
          </Typography>
          <Box sx={{ display: 'flex', mt: 2 }}>
            <Typography color="textSecondary" variant="body2">
              Published: {stats.publishedCourses} | Draft: {stats.draftCourses}
            </Typography>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
          <Typography color="textSecondary" gutterBottom variant="h6">
            Total Students
          </Typography>
          <Typography component="p" variant="h3">
            {stats.totalStudents}
          </Typography>
          <Box sx={{ display: 'flex', mt: 2 }}>
            <Typography color="textSecondary" variant="body2">
              Active: {stats.activeStudents}
            </Typography>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
          <Typography color="textSecondary" gutterBottom variant="h6">
            Total Enrollments
          </Typography>
          <Typography component="p" variant="h3">
            {stats.totalEnrollments}
          </Typography>
          <Box sx={{ display: 'flex', mt: 2 }}>
            <Typography color="textSecondary" variant="body2">
              Completed: {stats.completedEnrollments}
            </Typography>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
          <Typography color="textSecondary" gutterBottom variant="h6">
            Average Progress
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={stats.averageProgress}
              size={80}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" component="div" color="text.secondary">
                {Math.round(stats.averageProgress)}%
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Course Performance */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Course Performance
          </Typography>
          <List>
            {stats.courseMetrics.map((course) => (
              <React.Fragment key={course.id}>
                <ListItem>
                  <ListItemText
                    primary={course.title}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Students: {course.totalStudents} (Active: {course.activeStudents} | Completed: {course.completedStudents})
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={course.averageProgress}
                              sx={{ height: 8, borderRadius: 5 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(course.averageProgress)}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Recent Activities */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activities
          </Typography>
          <List>
            {stats.recentActivities.map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={activity.studentName}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.action}
                        </Typography>
                        {" "}{activity.courseTitle}
                        <Typography component="div" variant="caption" color="text.secondary">
                          {new Date(activity.date).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  const StudentDashboard = () => (
    <>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="div" gutterBottom>
              {stats.totalEnrolled || 0}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Enrolled Courses
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="div" gutterBottom>
              {stats.completedCourses || 0}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Completed Courses
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="div" gutterBottom>
              {stats.activeCourses || 0}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Active Courses
            </Typography>
          </Paper>
        </Grid>

        {/* Enrolled Courses */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">My Courses</Typography>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/courses"
                startIcon={<AddIcon />}
              >
                Browse Courses
              </Button>
            </Box>
            
            {stats.recentCourses.length > 0 ? (
              <List>
                {stats.recentCourses.map((course) => (
                  <ListItem key={course.id}>
                    <ListItemText
                      primary={course.title}
                      secondary={`Enrolled: ${course.enrollmentDate ? new Date(course.enrollmentDate).toLocaleDateString() : 'Date not available'}`}
                    />
                    <Button
                      component={Link}
                      to={`/courses/${course.id}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    >
                      Continue Learning
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="textSecondary" gutterBottom>
                  You haven't enrolled in any courses yet
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/courses"
                  sx={{ mt: 2 }}
                >
                  Explore Courses
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {user?.role === 'instructor' ? <InstructorDashboard /> : <StudentDashboard />}
    </Container>
  );
};

export default Dashboard;
