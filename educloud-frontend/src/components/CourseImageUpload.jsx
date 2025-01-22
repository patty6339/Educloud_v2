import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { coursesAPI } from '../services/api';

const CourseImageUpload = ({ courseId, onSuccess, currentThumbnail }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentThumbnail);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpg', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, JPEG, SVG, or WebP)');
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

  const handleDelete = async () => {
    try {
      setLoading(true);
      await coursesAPI.deleteThumbnail(courseId);
      setPreview(null);
      
      // Notify parent component
      if (onSuccess) {
        onSuccess({ thumbnail: null });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete thumbnail');
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
        <Box sx={{ mb: 2, position: 'relative' }}>
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

      <Stack direction="row" spacing={2}>
        <Button
          component="label"
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={loading}
          sx={{ flexGrow: 1 }}
        >
          {loading ? 'Uploading...' : 'Upload Thumbnail'}
          <input
            type="file"
            hidden
            accept=".jpg,.jpeg,.svg,.webp,image/jpg,image/jpeg,image/svg+xml,image/webp"
            onChange={handleFileSelect}
          />
        </Button>
        
        {preview && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
        )}
      </Stack>
      
      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
        Supported formats: JPG, JPEG, SVG, WebP (max 5MB)
      </Typography>
    </Box>
  );
};

export default CourseImageUpload;
