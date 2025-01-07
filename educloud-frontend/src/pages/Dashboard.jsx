import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { coursesAPI } from '../services/api';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('Fetching courses...');
        const response = await coursesAPI.getAllCourses();
        console.log('API Response:', response);
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.response?.data?.message || 'Failed to load courses. ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography>Loading courses...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography color="error">Error: {error}</Typography>
          <Typography variant="body2" color="textSecondary">
            Please make sure the backend server is running on port 3002
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Dashboard
        </Typography>
        {courses.length === 0 ? (
          <Typography>No courses found. Please enroll in some courses.</Typography>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{course.title}</Typography>
                    <Typography color="textSecondary">
                      {course.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
