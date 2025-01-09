import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { coursesAPI } from '../services/api';

const CourseImageUpload = ({ courseId, onSuccess, currentThumbnail }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentThumbnail);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
      setError('Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create form data
      const formData = new FormData();
      formData.append('thumbnail', file);

      // Upload the image
      const response = await coursesAPI.updateCourseThumbnail(courseId, formData);
      
      // Update preview
      setPreview(response.data.thumbnail);
      
      // Notify parent component
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {preview && (
        <Box sx={{ mb: 2 }}>
          <img 
            src={preview} 
            alt="Course thumbnail" 
            style={{ 
              width: '100%', 
              maxHeight: 200, 
              objectFit: 'cover', 
              borderRadius: 4 
            }} 
          />
        </Box>
      )}

      <Button
        component="label"
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? 'Uploading...' : 'Upload Thumbnail'}
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleFileSelect}
        />
      </Button>
      
      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
        Supported formats: JPG, PNG, GIF (max 5MB)
      </Typography>
    </Box>
  );
};

export default CourseImageUpload;
