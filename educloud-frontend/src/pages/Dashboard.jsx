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
  Divider
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
    totalStudents: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    recentCourses: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const InstructorDashboard = () => (
    <>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Instructor Dashboard</Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/courses/create"
          startIcon={<AddIcon />}
        >
          Create New Course
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="div" gutterBottom>
              {stats.totalCourses}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Total Courses
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="div" gutterBottom>
              {stats.totalStudents}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Enrolled Students
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="div" gutterBottom>
              {stats.activeEnrollments}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Active Enrollments
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Courses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Courses
            </Typography>
            <List>
              {stats.recentCourses.map((course, index) => (
                <React.Fragment key={course._id}>
                  <ListItem>
                    <ListItemText
                      primary={course.title}
                      secondary={`${course.enrollmentCount} students enrolled`}
                    />
                    <Button
                      component={Link}
                      to={`/courses/${course._id}`}
                      size="small"
                      color="primary"
                    >
                      View
                    </Button>
                  </ListItem>
                  {index < stats.recentCourses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/courses/create"
                  startIcon={<AddIcon />}
                >
                  Create New Course
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/courses"
                  startIcon={<SchoolIcon />}
                >
                  Manage Courses
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                >
                  View Analytics
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  const StudentDashboard = () => (
    <>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Student dashboard content */}
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
