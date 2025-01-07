import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { coursesAPI } from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAllCourses();
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await coursesAPI.enrollCourse(courseId);
      // Refresh courses after enrollment
      fetchCourses();
    } catch (err) {
      setError('Failed to enroll in course');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Available Courses
        </Typography>
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card>
                {course.imageUrl && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={course.imageUrl}
                    alt={course.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography color="textSecondary" paragraph>
                    {course.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Instructor: {course.instructor}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEnroll(course._id)}
                    fullWidth
                  >
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Courses;
