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
  Paper
} from '@mui/material';
import { coursesAPI } from '../services/api';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    duration: '',
    thumbnail: null
  });

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await coursesAPI.createCourse(courseData);
      console.log('Course created:', response.data);
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
      console.error('Error creating course:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Course
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Course Title"
            name="title"
            value={courseData.title}
            onChange={handleInputChange}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            required
            multiline
            rows={4}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Category"
            name="category"
            value={courseData.category}
            onChange={handleInputChange}
            required
            margin="normal"
          />

          <TextField
            select
            fullWidth
            label="Level"
            name="level"
            value={courseData.level}
            onChange={handleInputChange}
            required
            margin="normal"
          >
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={courseData.price}
            onChange={handleInputChange}
            required
            margin="normal"
            InputProps={{
              inputProps: { min: 0 }
            }}
          />

          <TextField
            fullWidth
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={courseData.duration}
            onChange={handleInputChange}
            required
            margin="normal"
            InputProps={{
              inputProps: { min: 0 }
            }}
          />

          <Button
            component="label"
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload Thumbnail
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>

          {courseData.thumbnail && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Selected file: {courseData.thumbnail.name}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Creating Course...' : 'Create Course'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateCourse;
