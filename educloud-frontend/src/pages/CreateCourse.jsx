import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  Paper,
  Grid,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { coursesAPI } from '../services/api';

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Mobile Development',
  'DevOps',
  'Database',
  'Cloud Computing',
  'Cybersecurity',
  'Other'
];

const CreateCourse = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    duration: '',
    thumbnail: null,
    prerequisites: [],
    objectives: [],
    status: 'draft'
  });
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const steps = ['Basic Information', 'Course Details', 'Content & Media'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData(prev => ({
        ...prev,
        thumbnail: file
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setCourseData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setCourseData(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const handleRemovePrerequisite = (index) => {
    setCourseData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveObjective = (index) => {
    setCourseData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        return courseData.title && courseData.description && courseData.category;
      case 1:
        return courseData.level && courseData.price && courseData.duration;
      case 2:
        return courseData.objectives.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!courseData.title || !courseData.description || !courseData.category || 
          !courseData.level || !courseData.price || !courseData.duration) {
        throw new Error('Please fill in all required fields');
      }

      // Create FormData object
      const formData = new FormData();
      
      // Append basic fields
      formData.append('title', courseData.title.trim());
      formData.append('description', courseData.description.trim());
      formData.append('category', courseData.category);
      formData.append('level', courseData.level);
      formData.append('price', Number(courseData.price));
      formData.append('duration', Number(courseData.duration));
      formData.append('status', courseData.status);
      
      // Append arrays as JSON strings
      if (courseData.prerequisites.length > 0) {
        formData.append('prerequisites', JSON.stringify(courseData.prerequisites));
      }
      if (courseData.objectives.length > 0) {
        formData.append('objectives', JSON.stringify(courseData.objectives));
      }
      
      // Append thumbnail if exists
      if (courseData.thumbnail instanceof File) {
        formData.append('courseThumbnail', courseData.thumbnail);
      }

      const response = await coursesAPI.createCourse(formData);
      console.log('Course created:', response.data);
      navigate('/courses');
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Title"
                name="title"
                value={courseData.title}
                onChange={handleInputChange}
                required
                helperText="Enter a descriptive title for your course"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={courseData.description}
                onChange={handleInputChange}
                required
                multiline
                rows={4}
                helperText="Provide a detailed description of your course"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={courseData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Level"
                name="level"
                value={courseData.level}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={courseData.price}
                onChange={handleInputChange}
                required
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={courseData.duration}
                onChange={handleInputChange}
                required
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Prerequisites
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                    placeholder="Add a prerequisite"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddPrerequisite}
                    disabled={!newPrerequisite.trim()}
                  >
                    Add
                  </Button>
                </Box>
                <List>
                  {courseData.prerequisites.map((prereq, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={prereq} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemovePrerequisite(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Learning Objectives
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Add a learning objective"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddObjective}
                    disabled={!newObjective.trim()}
                  >
                    Add
                  </Button>
                </Box>
                <List>
                  {courseData.objectives.map((objective, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={objective} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveObjective(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Course Thumbnail
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  fullWidth
                >
                  Upload Thumbnail
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                {previewUrl && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img
                      src={previewUrl}
                      alt="Thumbnail preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Course Status</InputLabel>
                <Select
                  name="status"
                  value={courseData.status}
                  onChange={handleInputChange}
                  label="Course Status"
                >
                  <MenuItem value="draft">Save as Draft</MenuItem>
                  <MenuItem value="published">Publish Immediately</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create New Course
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={handleSubmit}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading || !validateStep()}
                >
                  {loading ? 'Creating Course...' : 'Create Course'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!validateStep()}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateCourse;
