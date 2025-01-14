const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Create S3 instance
const s3 = new AWS.S3();

// Upload file to S3
const uploadToS3 = async (file, folder = 'general') => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Error uploading file to S3');
  }
};

// Delete file from S3
const deleteFromS3 = async (fileUrl) => {
  const key = fileUrl.split('.com/')[1];
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Error deleting file from S3');
  }
};

module.exports = {
  s3,
  uploadToS3,
  deleteFromS3
};
