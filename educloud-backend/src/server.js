const http = require('http');
const app = require('./app');
const WebSocketManager = require('./services/websocket');
const config = require('./config');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const webSocketManager = new WebSocketManager(server);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// Add error handling for the server
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using this port.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
