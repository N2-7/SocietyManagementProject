# MongoDB Atlas Setup Guide

Follow these steps to set up a free MongoDB Atlas database for your Smart Society Management System.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Click **"Try Free"** or **"Register"**
3. Sign up using:
   - Google account
   - GitHub account
   - Email address
4. Verify your email if required

## Step 2: Create a New Cluster

1. After logging in, click **"Build a Database"**
2. Select **"M0"** (Free Tier) - **It's completely free!**
3. Choose **"AWS"** as cloud provider (recommended)
4. Select a region closest to you (e.g., Mumbai, Singapore, etc.)
5. Name your cluster: `smart-society-cluster` (or any name you prefer)
6. Click **"Create"**
7. Wait for cluster creation (2-3 minutes)

## Step 3: Create Database User

1. While cluster is creating, you'll see **"Database Access"** section
2. Click **"Create Database User"**
3. Fill in the details:
   - **Username**: `smart-society-admin` (or your preferred username)
   - **Password**: Create a strong password (save it securely!)
   - **Database User Privileges**: Select **"Read and write to any database"**
4. Click **"Create User"**

**⚠️ IMPORTANT**: Save your username and password securely - you'll need them for the connection string!

## Step 4: Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This allows your Render backend to connect from anywhere
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Select **Node.js** as driver
5. Select version **4.1 or later**
6. Copy the connection string

Your connection string will look like:
```
mongodb+srv://<username>:<password>@smart-society-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Step 6: Update Connection String

Replace the placeholders in your connection string:
- `<username>` → Your database username from Step 3
- `<password>` → Your database password from Step 3

Final connection string example:
```
mongodb+srv://smart-society-admin:YourSecurePassword123@smart-society-cluster.xxxxx.mongodb.net/smart-society?retryWrites=true&w=majority
```

## Step 7: Test Connection (Optional)

You can test your connection using MongoDB Compass:

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Install and open MongoDB Compass
3. Paste your connection string
4. Click **"Connect"**
5. If successful, you'll see your cluster databases

## Important Notes:

### Free Tier Limitations:
- **512 MB storage**
- **Shared RAM**
- **Cluster auto-pauses after 30 days of inactivity**
- **Good for development and small projects**

### Security Best Practices:
1. **Never commit your connection string to GitHub**
2. **Use strong passwords** for database users
3. **Regularly rotate passwords** in production
4. **Monitor cluster usage** in MongoDB Atlas dashboard

### Connection String Format for Environment Variable:
```
MONGODB_URI=mongodb+srv://smart-society-admin:YourSecurePassword123@smart-society-cluster.xxxxx.mongodb.net/smart-society?retryWrites=true&w=majority
```

## Troubleshooting:

### Connection Timeout:
- Check if your IP is whitelisted in Network Access
- Verify username and password are correct
- Ensure cluster is active (not paused)

### Authentication Failed:
- Double-check username and password
- Make sure you're using the correct database name
- Verify user has proper permissions

### Cluster Not Accessible:
- Check cluster status in MongoDB Atlas dashboard
- Ensure cluster hasn't auto-paused
- Verify your network connection

## Next Steps:

After setting up MongoDB Atlas:
1. Copy your final connection string
2. Use it in the Render deployment environment variables
3. Follow the Render deployment guide to deploy your backend

Your MongoDB Atlas database is now ready for production use!