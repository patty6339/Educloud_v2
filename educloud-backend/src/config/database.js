const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/educloud';
        console.log('Attempting to connect to MongoDB...');
        
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            retryWrites: true
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle MongoDB connection errors
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during MongoDB shutdown:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.log('Please make sure MongoDB is running and accessible');
        process.exit(1);
    }
};

module.exports = connectDB;
