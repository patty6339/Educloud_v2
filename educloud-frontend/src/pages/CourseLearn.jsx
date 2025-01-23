import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Button,
  IconButton,
} from '@mui/material';
import {
  PlayCircleOutline as VideoIcon,
  Description as ReadingIcon,
  Assignment as QuizIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as IncompleteIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const dummyContent = {
  title: "Introduction to the Course",
  description: "Welcome to this comprehensive course. Let's begin our learning journey!",
  modules: [
    {
      title: "Module 1: Getting Started",
      items: [
        { type: "video", title: "Welcome Video", duration: "5:30", completed: true },
        { type: "reading", title: "Course Overview", duration: "10 min", completed: true },
        { type: "quiz", title: "Knowledge Check", duration: "15 min", completed: false }
      ]
    },
    {
      title: "Module 2: Core Concepts",
      items: [
        { type: "video", title: "Understanding Basics", duration: "15:45", completed: false },
        { type: "reading", title: "Key Principles", duration: "20 min", completed: false },
        { type: "quiz", title: "Module Assessment", duration: "30 min", completed: false }
      ]
    }
  ]
};

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    // Simulate content loading
    setSelectedContent(dummyContent.modules[0].items[0]);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getIcon = (type, completed) => {
    switch (type) {
      case 'video':
        return <VideoIcon color={completed ? 'success' : 'primary'} />;
      case 'reading':
        return <ReadingIcon color={completed ? 'success' : 'primary'} />;
      case 'quiz':
        return <QuizIcon color={completed ? 'success' : 'primary'} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ backgroundColor: 'grey.50', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'primary.main' }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {dummyContent.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Sidebar - Course Content */}
          <Paper sx={{ width: 320, flexShrink: 0, height: 'fit-content' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Content" />
              <Tab label="Resources" />
            </Tabs>
            
            <List sx={{ p: 0 }}>
              {dummyContent.modules.map((module, moduleIndex) => (
                <Box key={moduleIndex}>
                  <ListItem sx={{ bgcolor: 'grey.100' }}>
                    <ListItemText 
                      primary={module.title}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                  </ListItem>
                  {module.items.map((item, itemIndex) => (
                    <ListItem
                      key={itemIndex}
                      button
                      selected={selectedContent === item}
                      onClick={() => setSelectedContent(item)}
                      sx={{
                        pl: 4,
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          }
                        }
                      }}
                    >
                      <ListItemIcon>
                        {getIcon(item.type, item.completed)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.title}
                        secondary={item.duration}
                      />
                      {item.completed ? 
                        <CompletedIcon color="success" sx={{ ml: 1 }} /> : 
                        <IncompleteIcon color="disabled" sx={{ ml: 1 }} />
                      }
                    </ListItem>
                  ))}
                </Box>
              ))}
            </List>
          </Paper>

          {/* Main Content Area */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              {selectedContent ? (
                <>
                  <Typography variant="h5" gutterBottom>
                    {selectedContent.title}
                  </Typography>
                  <Box sx={{ 
                    height: 400, 
                    bgcolor: 'grey.200', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    mb: 3
                  }}>
                    {getIcon(selectedContent.type)}
                    <Typography sx={{ ml: 1 }}>
                      {selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1)} Content
                    </Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<CheckCircle />}
                    sx={{ mt: 2 }}
                  >
                    Mark as Complete
                  </Button>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  Select a lesson to begin
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CourseLearn;
