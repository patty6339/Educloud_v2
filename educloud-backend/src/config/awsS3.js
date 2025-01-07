const AWS = require('aws-sdk');

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// File upload function
const uploadFile = async (fileBuffer, bucketName, fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
  };

  return s3.upload(params).promise();
};

// File retrieval function
const getFileUrl = (bucketName, fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Expires: 60 * 60, // URL valid for 1 hour
  };

  return s3.getSignedUrlPromise('getObject', params);
};

module.exports = { s3, uploadFile, getFileUrl };
