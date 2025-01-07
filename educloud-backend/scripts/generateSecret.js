const crypto = require('crypto');

// Generate a secure random string of 64 bytes and convert it to base64
const secret = crypto.randomBytes(64).toString('base64');
console.log('Generated JWT Secret:', secret);
