require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB!');
        console.log('Connection Details:');
        console.log('Database:', mongoose.connection.name);
        console.log('Host:', mongoose.connection.host);
        console.log('Port:', mongoose.connection.port);
        
        // Test creating a collection
        await mongoose.connection.db.createCollection('test_collection');
        console.log('Successfully created test collection!');
        
        // Clean up
        await mongoose.connection.db.dropCollection('test_collection');
        console.log('Successfully cleaned up test collection!');
        
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
    }
}

testConnection();
