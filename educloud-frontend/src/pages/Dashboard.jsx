import React, { useState, useCallback, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { getThumbnailUrl } from '../services/api';

const StatCard = ({ icon, title, value, color }) => (
  <Card 
    elevation={3}
    sx={{ 
      height: '100%',
      backgroundColor: 'white',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
      }
    }}
  >
    <CardContent sx={{ 
      textAlign: 'center',
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2
    }}>
      {React.cloneElement(icon, { 
        sx: { 
          fontSize: 48, 
          color: color,
          mb: 1
        } 
      })}
      <Typography variant="h4" component="div" sx={{ 
        fontWeight: 'bold',
        color: 'text.primary'
      }}>
        {value}
      </Typography>
      <Typography variant="subtitle1" sx={{ 
        color: 'text.secondary',
        fontWeight: 500
      }}>
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const CourseCard = ({ course, onContinue }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status, progress) => {
    if (status === 'completed') return 'success';
    if (progress > 75) return 'success';
    if (progress > 50) return 'primary';
    if (progress > 25) return 'warning';
    return 'error';
  };

  const handleContinue = () => {
    navigate(`/courses/${course.id}/learn`);
  };

  return (
    <Card 
      elevation={2}
      sx={{
        mb: 2,
        backgroundColor: 'white',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          '& .continue-btn': {
            opacity: 1,
            transform: 'translateX(0)'
          }
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 3,
          alignItems: 'flex-start'
        }}>
          {/* Course Thumbnail */}
          <Box
            component="img"
            src={getThumbnailUrl(course.thumbnail)}
            alt={course.title}
            sx={{
              width: 120,
              height: 80,
              borderRadius: 1,
              objectFit: 'cover',
              flexShrink: 0,
              backgroundColor: 'grey.100'
            }}
          />
          
          {/* Course Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              mb: 1
            }}>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 0.5,
                    color: 'text.primary'
                  }}
                >
                  {course.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {course.description || 'No description available'}
                </Typography>
              </Box>
              
              <Tooltip title="Continue Learning">
                <IconButton 
                  className="continue-btn"
                  color="primary"
                  onClick={handleContinue}
                  sx={{ 
                    backgroundColor: 'primary.light',
                    opacity: { xs: 1, sm: 0 },
                    transform: { xs: 'none', sm: 'translateX(20px)' },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      '& .MuiSvgIcon-root': {
                        color: 'white'
                      }
                    }
                  }}
                >
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Progress Section */}
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1
              }}>
                <Chip 
                  label={course.status === 'completed' ? 'Completed' : `${course.progress}% Complete`}
                  color={getStatusColor(course.status, course.progress)}
                  size="small"
                  sx={{ 
                    fontWeight: 500,
                    '& .MuiChip-label': {
                      px: 2
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  Last accessed: {new Date(course.lastAccessed || course.enrollmentDate).toLocaleDateString()}
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={course.progress} 
                sx={{ 
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.100',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    backgroundColor: course.status === 'completed' ? 'success.main' : 'primary.main'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchDashboardStats = useCallback(async (force = false) => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    // If we have data and it's less than 1 minute old, don't fetch again unless forced
    if (!force && dashboardData && lastFetchTime && (Date.now() - lastFetchTime) < 60000) {
      console.log('Using cached dashboard data');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard stats...');
      const response = await coursesAPI.getDashboardStats();
      
      if (response.data) {
        console.log('Dashboard stats fetched:', response.data);
        setDashboardData(response.data);
        setLastFetchTime(Date.now());
        setRetryCount(0); // Reset retry count on successful fetch
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard data');
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const retryDelay = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying in ${retryDelay}ms...`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchDashboardStats(true);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, dashboardData, lastFetchTime, retryCount, navigate]);

  const handleContinueLearning = (course) => {
    navigate(`/courses/${course.id}/learn`);
  };

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardStats();
    }

    // Auto-refresh every 5 minutes if authenticated
    let refreshInterval;
    if (isAuthenticated) {
      refreshInterval = setInterval(() => {
        fetchDashboardStats(true);
      }, 300000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [fetchDashboardStats, authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'grey.50'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert 
          severity="error"
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          Please log in to view your dashboard
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'grey.50'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert 
          severity="error"
          variant="filled"
          sx={{ borderRadius: 2, mb: 2 }}
        >
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => fetchDashboardStats(true)}
          startIcon={<RefreshIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'grey.50',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              color: 'text.primary'
            }}
          >
            Welcome back, {user?.name || 'Student'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => fetchDashboardStats(true)}
            startIcon={<RefreshIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Refresh
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard 
              icon={<SchoolIcon />}
              title="Enrolled Courses" 
              value={dashboardData.totalEnrolled || 0} 
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard 
              icon={<CheckCircleIcon />}
              title="Completed Courses" 
              value={dashboardData.completedCourses || 0} 
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard 
              icon={<TimelineIcon />}
              title="Overall Progress" 
              value={`${Math.round((dashboardData.completedCourses / dashboardData.totalEnrolled) * 100) || 0}%`} 
              color="#ed6c02"
            />
          </Grid>
        </Grid>

        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 4,
            borderRadius: 2,
            backgroundColor: 'white'
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 3
            }}
          >
            Your Courses
          </Typography>
          {dashboardData.recentCourses?.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}
              onContinue={handleContinueLearning}
            />
          ))}
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
