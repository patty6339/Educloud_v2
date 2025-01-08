import { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Paper,
  Button
} from '@mui/material';
import { coursesAPI } from '../services/api';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await coursesAPI.getAllCourses();
        console.log('Full API Response:', response);
        console.log('Response data structure:', JSON.stringify(response.data, null, 2));
        
        // Ensure we're working with an array of courses
        const coursesArray = Array.isArray(response.data) ? response.data : 
                           Array.isArray(response.data.courses) ? response.data.courses : [];
        
        console.log('Processed courses array:', coursesArray);
        
        setCourses(coursesArray);
        
        // Update stats based on courses
        setStats({
          enrolledCourses: coursesArray.length,
          completedCourses: coursesArray.filter(course => course.completed).length || 0,
          inProgressCourses: coursesArray.filter(course => !course.completed).length || 0
        });
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, color = 'primary' }) => (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" color={color}>
        {value}
      </Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Container>
        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2 
        }}>
          <CircularProgress />
          <Typography>Loading your dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Your Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <StatCard 
              title="Enrolled Courses" 
              value={stats.enrolledCourses}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard 
              title="Completed" 
              value={stats.completedCourses}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard 
              title="In Progress" 
              value={stats.inProgressCourses}
              color="info.main"
            />
          </Grid>
        </Grid>

        {/* Recent Courses Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Your Recent Courses
          </Typography>
          {!Array.isArray(courses) || courses.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                You haven't enrolled in any courses yet.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                href="/courses"
                sx={{ mt: 2 }}
              >
                Browse Courses
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {courses.slice(0, 3).map((course, index) => (
                <Grid item xs={12} md={4} key={course._id || index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {course.title || 'Untitled Course'}
                      </Typography>
                      <Typography color="textSecondary" paragraph>
                        {course.description || 'No description available'}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Typography variant="body2" color="primary">
                          {course.completed ? 'Completed' : 'In Progress'}
                        </Typography>
                        <Button size="small" color="primary">
                          Continue
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
