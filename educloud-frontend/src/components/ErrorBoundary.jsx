import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log the error to your error reporting service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        padding: 3,
                        textAlign: 'center'
                    }}
                >
                    <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Oops! Something went wrong
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.location.reload()}
                        sx={{ mt: 2 }}
                    >
                        Refresh Page
                    </Button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <Box sx={{ mt: 4, textAlign: 'left' }}>
                            <Typography variant="h6" color="error" gutterBottom>
                                Error Details:
                            </Typography>
                            <pre style={{ 
                                overflow: 'auto', 
                                padding: '1rem',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px'
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </Box>
                    )}
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
