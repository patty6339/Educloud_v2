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
import { coursesAPI, getImageUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Default course image
const DEFAULT_COURSE_IMAGE = '/uploads/courses/default-course.svg';

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
      setError('');
      const response = await coursesAPI.getAllCourses();
      
      console.log('Full courses response:', response);
      
      // Robust course data extraction
      const coursesArray = response.data?.courses || 
                           (Array.isArray(response.data) ? response.data : 
                           (Array.isArray(response) ? response : []));
      
      console.log('Extracted courses:', coursesArray);
      
      if (coursesArray.length === 0) {
        setError('No courses available');
      }
      
      setCourses(coursesArray);
    } catch (err) {
      console.error('Detailed courses fetch error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setError(
        err.response?.data?.message || 
        'Failed to load courses. Please check your network connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async (course) => {
    try {
      setEnrollingCourse(course.id);
      setEnrollmentLoading(true);
      
      // Enroll in the course
      const response = await coursesAPI.enrollCourse(course.id);
      console.log('Enrollment successful:', response);
      
      // Refresh courses list
      await fetchCourses();
      
      // Create and dispatch the enrollment event
      const enrollmentEvent = new CustomEvent('courseEnrolled', {
        bubbles: true,
        detail: {
          courseId: course.id,
          courseName: course.title,
          enrollmentDate: new Date().toISOString(),
          status: response.data?.status || 'active'
        }
      });
      
      // Dispatch the event
      window.dispatchEvent(enrollmentEvent);
      console.log('Dispatched enrollment event:', enrollmentEvent);
      
      // Show success message
      setError({ type: 'success', message: 'Successfully enrolled in course!' });
    } catch (error) {
      console.error('Enrollment error:', error);
      setError({
        type: 'error',
        message: error.response?.data?.message || 'Failed to enroll in course'
      });
    } finally {
      setEnrollingCourse(null);
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
        <Alert severity={error.type || 'error'} sx={{ mb: 4 }}>
          {error.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={getImageUrl(course.thumbnail) || getImageUrl(DEFAULT_COURSE_IMAGE)}
                alt={course.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getImageUrl(DEFAULT_COURSE_IMAGE);
                }}
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
