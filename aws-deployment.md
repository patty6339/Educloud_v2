# AWS Deployment Guide for EduCloud

## Prerequisites
1. AWS Account (Free Tier)
2. AWS CLI installed
3. MongoDB Atlas account
4. Domain name (optional)

## Step 1: EC2 Setup (Backend)

1. Launch EC2 Instance:
   - Sign in to AWS Console
   - Go to EC2 Dashboard
   - Click "Launch Instance"
   - Choose "Amazon Linux 2023"
   - Select t2.micro (Free Tier eligible)
   - Create new key pair (save the .pem file)
   - Configure Security Group:
     - Allow SSH (Port 22)
     - Allow HTTP (Port 80)
     - Allow HTTPS (Port 443)
     - Allow Custom TCP (Port 3002)

2. Connect to EC2:
   ```bash
   chmod 400 your-key-pair.pem
   ssh -i your-key-pair.pem ec2-user@your-ec2-public-dns
   ```

3. Install Dependencies:
   ```bash
   sudo yum update -y
   sudo yum install -y nodejs npm git
   ```

4. Clone and Setup Backend:
   ```bash
   git clone your-repo-url
   cd Educloud_v2/educloud-backend
   npm install
   ```

5. Setup PM2:
   ```bash
   sudo npm install -g pm2
   pm2 start src/server.js
   pm2 startup
   ```

## Step 2: S3 Setup (Frontend)

1. Create S3 Bucket:
   - Go to S3 Dashboard
   - Click "Create bucket"
   - Name: your-app-name-frontend
   - Uncheck "Block all public access"
   - Enable static website hosting

2. Bucket Policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

3. Build and Deploy Frontend:
   ```bash
   cd educloud-frontend
   npm run build
   aws s3 sync dist/ s3://your-bucket-name
   ```

## Step 3: Environment Setup

1. Backend (.env):
   ```
   NODE_ENV=production
   PORT=3002
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-secret
   AWS_BUCKET_NAME=your-bucket-name
   AWS_REGION=your-region
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

2. Frontend (.env.production):
   ```
   VITE_API_URL=http://your-ec2-public-dns:3002
   VITE_AWS_S3_BUCKET=your-bucket-name
   ```

## Step 4: MongoDB Atlas Setup

1. Create Cluster (M0 Free Tier)
2. Configure Network Access:
   - Add EC2 instance IP
   - Add your local IP
3. Create Database User
4. Get Connection String

## Step 5: AWS IAM Setup

1. Create IAM User:
   - Go to IAM Dashboard
   - Create new user
   - Attach policies:
     - AmazonS3FullAccess
     - AWSCloudFrontFullAccess (if using CDN)

2. Save Access Keys:
   - Download .csv file
   - Update backend .env file

## Step 6: (Optional) Domain & SSL Setup

1. Route 53:
   - Register domain or transfer existing
   - Create hosted zone
   - Create A records for frontend and backend

2. Certificate Manager:
   - Request certificate
   - Validate domain ownership
   - Associate with CloudFront/ALB

## Deployment Commands

1. Backend Deployment:
   ```bash
   # On EC2 instance
   cd ~/Educloud_v2/educloud-backend
   git pull
   npm install
   pm2 restart server
   ```

2. Frontend Deployment:
   ```bash
   # Local machine
   cd educloud-frontend
   npm run build
   aws s3 sync dist/ s3://your-bucket-name
   ```

## Monitoring

1. EC2 Monitoring:
   ```bash
   pm2 monit
   pm2 logs
   ```

2. Check System Resources:
   ```bash
   htop
   df -h
   ```

## Backup

1. Database:
   - MongoDB Atlas automatic backups
   - Manual mongodump

2. EC2:
   - Create AMI
   - Regular snapshots

## Security Best Practices

1. Keep EC2 security group restricted
2. Use IAM roles with minimum permissions
3. Enable bucket encryption
4. Regular security updates
5. Monitor AWS CloudWatch logs
6. Use AWS WAF for additional security
