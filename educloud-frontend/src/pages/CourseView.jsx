import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  PlayCircleOutline as VideoIcon,
  Description as DocumentIcon,
  Quiz as QuizIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as IncompleteIcon,
} from '@mui/icons-material';
import { coursesAPI } from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CourseView = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Dummy course content for demonstration
  const [content] = useState({
    modules: [
      {
        id: 1,
        title: 'Introduction',
        lessons: [
          {
            id: 1,
            title: 'Welcome to the Course',
            type: 'video',
            duration: '5:00',
            completed: true
          },
          {
            id: 2,
            title: 'Course Overview',
            type: 'document',
            duration: '10 mins read',
            completed: false
          }
        ]
      },
      {
        id: 2,
        title: 'Getting Started',
        lessons: [
          {
            id: 3,
            title: 'Basic Concepts',
            type: 'video',
            duration: '15:00',
            completed: false
          },
          {
            id: 4,
            title: 'Practice Quiz',
            type: 'quiz',
            duration: '20 mins',
            completed: false
          }
        ]
      }
    ]
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await coursesAPI.getCourseById(id);
        setCourse(response.data);
      } catch (err) {
        setError('Failed to load course content');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <VideoIcon />;
      case 'document':
        return <DocumentIcon />;
      case 'quiz':
        return <QuizIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {course && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {course.description}
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            {/* Course Content */}
            <Grid item xs={12} md={8}>
              <Paper>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="course tabs">
                  <Tab label="Content" />
                  <Tab label="Overview" />
                  <Tab label="Discussion" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                  {content.modules.map((module) => (
                    <Box key={module.id} sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {module.title}
                      </Typography>
                      <List>
                        {module.lessons.map((lesson) => (
                          <React.Fragment key={lesson.id}>
                            <ListItem disablePadding>
                              <ListItemButton>
                                <ListItemIcon>
                                  {getLessonIcon(lesson.type)}
                                </ListItemIcon>
                                <ListItemText 
                                  primary={lesson.title}
                                  secondary={lesson.duration}
                                />
                                {lesson.completed ? 
                                  <CompletedIcon color="success" /> : 
                                  <IncompleteIcon color="disabled" />
                                }
                              </ListItemButton>
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                      </List>
                    </Box>
                  ))}
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Course Overview
                  </Typography>
                  <Typography paragraph>
                    This course is designed to provide you with a comprehensive understanding
                    of the subject matter. Through a combination of video lectures, reading
                    materials, and interactive quizzes, you'll gain both theoretical knowledge
                    and practical skills.
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    What You'll Learn
                  </Typography>
                  <ul>
                    <li>Fundamental concepts and principles</li>
                    <li>Practical applications and real-world examples</li>
                    <li>Best practices and industry standards</li>
                    <li>Problem-solving techniques</li>
                  </ul>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Discussion Forum Coming Soon
                    </Typography>
                    <Typography color="text.secondary">
                      This feature will be available in a future update.
                    </Typography>
                  </Box>
                </TabPanel>
              </Paper>
            </Grid>

            {/* Progress and Navigation */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                    <CircularProgress variant="determinate" value={25} />
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
                      <Typography variant="caption" component="div" color="text.secondary">
                        25%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    1 of 4 lessons completed
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Continue Learning
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                >
                  Download Materials
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default CourseView;
