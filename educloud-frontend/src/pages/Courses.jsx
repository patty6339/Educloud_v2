import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { coursesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Default course image
const DEFAULT_COURSE_IMAGE = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollingCourse, setEnrollingCourse] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAllCourses();
      const coursesArray = Array.isArray(response.data) ? response.data : 
                         Array.isArray(response.data.courses) ? response.data.courses : [];
      setCourses(coursesArray);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async (course) => {
    try {
      setEnrollmentLoading(true);
      await coursesAPI.enrollCourse(course._id);
      await fetchCourses();
      setEnrollingCourse(null);
    } catch (err) {
      setError('Failed to enroll in course');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Available Courses
          </Typography>
          <Typography color="textSecondary">
            Explore our wide range of courses and start learning today
          </Typography>
        </div>
        {isInstructor && (
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/courses/create"
            startIcon={<AddIcon />}
          >
            Create Course
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={course.thumbnail || DEFAULT_COURSE_IMAGE}
                alt={course.title}
                sx={{
                  objectFit: 'cover',
                  backgroundColor: 'grey.100'
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {course.title}
                </Typography>
                <Typography color="textSecondary" paragraph>
                  {course.description}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={course.category || 'General'} 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Chip 
                    label={course.level || 'All Levels'} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => setEnrollingCourse(course)}
                  disabled={course.enrolled}
                >
                  {course.enrolled ? 'Enrolled' : 'Enroll Now'}
                </Button>
                <Button size="small" color="primary">
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!enrollingCourse} onClose={() => setEnrollingCourse(null)}>
        <DialogTitle>
          Enroll in Course
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to enroll in "{enrollingCourse?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEnrollingCourse(null)} 
            disabled={enrollmentLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleEnrollment(enrollingCourse)}
            variant="contained" 
            color="primary"
            disabled={enrollmentLoading}
          >
            {enrollmentLoading ? 'Enrolling...' : 'Confirm Enrollment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Courses;
