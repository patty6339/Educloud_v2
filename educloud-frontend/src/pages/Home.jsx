import { Box, Button, Container, Typography, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      minHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
      color: 'white'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4 }}>
              <Typography variant="h2" component="h1" gutterBottom>
                Welcome to EduCloud
              </Typography>
              <Typography variant="h5" paragraph>
                Your gateway to interactive online learning. Join our community and start your educational journey today.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  onClick={() => navigate('/register')}
                  sx={{ mr: 2 }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                Features
              </Typography>
              <Grid container spacing={2}>
                {[
                  'Interactive Online Courses',
                  'Expert Instructors',
                  'Self-Paced Learning',
                  'Course Certificates',
                  'Community Support',
                  'Live Sessions'
                ].map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="h6" color="text.primary">
                        {feature}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;
