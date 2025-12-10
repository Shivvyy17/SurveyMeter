# 📊 SurveyMeter
## Prerequisites
- Node.js (v16 or higher) Download from: https://nodejs.org/
- npm or yarn
- MongoDB Atlas account (free tier)
- Git

## Environment Setup

### Backend Setup
1. Navigate to backend folder:
```bash
   cd backend
```

2. Install dependencies:
```bash
   npm install
```

3. Create `.env` file in backend folder with:
```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
```

4. Start backend server:
```bash
   npm start
```

### Frontend Setup
1. Navigate to frontend folder:
```bash
   cd frontend
```

2. Install dependencies:
```bash
   npm install
```

3. Create `.env` file in frontend folder with:
```
   VITE_API_URL=http://localhost:5000
```

4. Start development server:
```bash
   npm run dev
```

## MongoDB Setup Instructions

## Running the Application
- Backend will run on: http://localhost:5000
- Frontend will run on: http://localhost:5173 (or displayed port)

# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and create an account
3. Choose the FREE tier (M0 Sandbox)

## Step 2: Create a Cluster
1. After login, click "Build a Database"
2. Choose "FREE" shared cluster
3. Select a cloud provider and region (closest to you)
4. Click "Create Cluster"

## Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `surveymeter_admin` (or any name)
5. Password: Create a strong password (SAVE THIS!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

## Step 4: Whitelist IP Address
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access From Anywhere" (0.0.0.0/0)
   - For production, use specific IPs only
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `surveymeter` (or your preferred name)

Example:
```
mongodb+srv://surveymeter_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/surveymeter?retryWrites=true&w=majority
```

## Step 6: Add to Backend .env File
```
MONGODB_URI=mongodb+srv://surveymeter_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/surveymeter?retryWrites=true&w=majority
PORT=5000
```

## Troubleshooting
- If connection fails, check Network Access allows your IP
- Verify username and password are correct
- Ensure database name is specified in connection string

# Deployment Guide

## Frontend Deployment (Vercel)
1. Push code to GitHub
2. Go to vercel.com
3. Import your repository
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variable: `VITE_API_URL` with your backend URL

## Backend Deployment (Render/Railway)
1. Create account on Render.com or Railway.app
2. Create new Web Service
3. Connect your GitHub repo
4. Add environment variables:
   - MONGODB_URI
   - PORT
5. Deploy