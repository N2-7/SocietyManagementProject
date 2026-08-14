# Render Deployment Guide - Backend

Follow these steps to deploy your Node.js/Express backend to Render.

## Prerequisites

- GitHub repository with your code (already done: https://github.com/N2-7/SocietyManagementProject)
- MongoDB Atlas set up (do this first!)
- Render account (free tier available)
- Cloudinary account (for image uploads)
- Razorpay account (for payments)

## Step 1: Create Render Account

1. Go to [Render.com](https://render.com/register)
2. Click **"Sign Up"**
3. Sign up using:
   - GitHub account (recommended)
   - GitLab account
   - Email address
4. Authorize Render to access your GitHub account

## Step 2: Create New Web Service

1. After logging in, click **"New +"** button
2. Select **"Web Service"**
3. You'll see your GitHub repositories
4. Find and click **"SocietyManagementProject"**
5. Click **"Connect"**

## Step 3: Configure Service Settings

### Basic Settings:
- **Name**: `smart-society-backend` (or your preferred name)
- **Region**: Choose nearest region (e.g., Singapore, Mumbai)
- **Branch**: `main`
- **Runtime**: `Node`

### Build & Deploy Settings:
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### Instance Type:
- **Free**: Good for development (spins down when inactive)
- **Standard ($7/month)**: Always on, better performance
- **For now, select Free**

## Step 4: Add Environment Variables

This is the most important step! Add all these variables in the **"Environment"** section:

### Required Variables:

#### 1. NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`

#### 2. PORT
- **Key**: `PORT`
- **Value**: `5000`

#### 3. MONGODB_URI
- **Key**: `MONGODB_URI`
- **Value**: Your MongoDB Atlas connection string
- **Example**: `mongodb+srv://smart-society-admin:YourPassword123@cluster.xxxxx.mongodb.net/smart-society?retryWrites=true&w=majority`

#### 4. JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: Generate a secure random string
- **Example**: `your_super_secure_jwt_secret_key_12345`
- **Generate using**: https://www.random.org/strings/

#### 5. JWT_EXPIRE
- **Key**: `JWT_EXPIRE`
- **Value**: `7d`

#### 6. REFRESH_TOKEN_SECRET
- **Key**: `REFRESH_TOKEN_SECRET`
- **Value**: Generate another secure random string
- **Example**: `your_refresh_token_secret_key_67890`

#### 7. REFRESH_TOKEN_EXPIRE
- **Key**: `REFRESH_TOKEN_EXPIRE**
- **Value**: `30d`

### Cloudinary Variables (for image uploads):

#### 8. CLOUDINARY_CLOUD_NAME
- **Key**: `CLOUDINARY_CLOUD_NAME`
- **Value**: Your Cloudinary cloud name
- **Get from**: Cloudinary Dashboard → Settings → Cloud

#### 9. CLOUDINARY_API_KEY
- **Key**: `CLOUDINARY_API_KEY`
- **Value**: Your Cloudinary API key
- **Get from**: Cloudinary Dashboard → Settings → API Keys

#### 10. CLOUDINARY_API_SECRET
- **Key**: `CLOUDINARY_API_SECRET`
- **Value**: Your Cloudinary API secret
- **Get from**: Cloudinary Dashboard → Settings → API Keys

### Razorpay Variables (for payments):

#### 11. RAZORPAY_KEY_ID
- **Key**: `RAZORPAY_KEY_ID`
- **Value**: Your Razorpay test key ID
- **Example**: `rzp_test_xxxxxxxxxxxxx`
- **Get from**: Razorpay Dashboard → Settings → API Keys

#### 12. RAZORPAY_KEY_SECRET
- **Key**: `RAZORPAY_KEY_SECRET`
- **Value**: Your Razorpay test key secret
- **Get from**: Razorpay Dashboard → Settings → API Keys

### Frontend URL (for CORS):

#### 13. CLIENT_URL
- **Key**: `CLIENT_URL`
- **Value**: Your Vercel frontend URL (update after Vercel deployment)
- **Example**: `https://society-management.vercel.app`
- **For now, use**: `http://localhost:5173` (update later)

### Optional Email Variables:

#### 14. EMAIL_HOST
- **Key**: `EMAIL_HOST`
- **Value**: `smtp.gmail.com`

#### 15. EMAIL_PORT
- **Key**: `EMAIL_PORT`
- **Value**: `587`

#### 16. EMAIL_USER
- **Key**: `EMAIL_USER`
- **Value**: Your Gmail address

#### 17. EMAIL_PASSWORD
- **Key**: `EMAIL_PASSWORD`
- **Value**: Your Gmail app password (not regular password)

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. You'll see deployment progress:
   - Cloning repository
   - Installing dependencies
   - Starting server
   - Health checks

## Step 6: Get Your Deployment URL

After successful deployment:
1. You'll see your service dashboard
2. Copy your service URL:
   - Format: `https://your-service-name.onrender.com`
   - Example: `https://smart-society-backend.onrender.com`

## Step 7: Test Your Backend

1. Visit your backend URL + `/api/health`
   - Example: `https://smart-society-backend.onrender.com/api/health`
2. You should see: `{"success":true,"message":"Server is running"}`
3. Test other endpoints using tools like Postman

## Step 8: Update Frontend Configuration

After getting your Render URL:

1. Update your Vercel environment variable:
   - **VITE_API_URL**: Your Render backend URL

2. Update Render environment variable:
   - **CLIENT_URL**: Your Vercel frontend URL

## Render Dashboard Features

### View Logs:
- Go to **"Logs"** tab
- See real-time server logs
- Debug deployment issues
- Monitor application performance

### Manual Deploy:
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- Useful for testing specific commits
- Clear build cache if needed

### Events:
- View deployment history
- See all deployments and their status
- Rollback to previous deployments

### Metrics:
- CPU usage
- Memory usage
- Response times
- Error rates

## Important Notes:

### Free Tier Limitations:
- **Spins down after 15 minutes of inactivity**
- **Cold starts** (takes ~30 seconds to wake up)
- **512 MB RAM**
- **Limited bandwidth**
- **Good for development and testing**

### Environment Variables:
- **Never commit** environment variables to GitHub
- **Keep secrets secure** - don't share them
- **Update carefully** - changes require redeployment
- **Use different values** for production vs development

### Database Connection:
- Ensure MongoDB Atlas allows all IPs (0.0.0.0/0)
- Verify connection string is correct
- Check cluster is active (not paused)
- Test connection before deployment

### WebSockets (Socket.io):
- Render supports WebSockets
- Your Socket.io configuration should work
- May need additional configuration for some features

## Troubleshooting:

### Deployment Fails:
1. Check deployment logs for specific errors
2. Verify all environment variables are set
3. Ensure MongoDB connection string is correct
4. Check for syntax errors in code

### Server Won't Start:
1. Check logs for startup errors
2. Verify `server.js` exists in backend folder
3. Ensure all dependencies are installed
4. Check port conflicts

### Database Connection Failed:
1. Verify MongoDB Atlas credentials
2. Check if cluster is active
3. Ensure IP whitelisting is correct
4. Test connection string locally

### Environment Variables Not Working:
1. Ensure variable names match exactly
2. Check for typos in keys/values
3. Restart service after adding variables
4. Verify variables are saved

### CORS Errors:
1. Update `CLIENT_URL` with correct frontend URL
2. Ensure CORS is configured in backend
3. Check if frontend URL is accessible
4. Verify backend is running

### WebSockets Not Working:
1. Check if Socket.io is properly configured
2. Verify WebSocket port is accessible
3. Check firewall settings
4. Review Socket.io configuration

## Automatic Deployments:

Render automatically deploys when you:
- Push to your `main` branch
- Merge a pull request

### Branch Deployments:
- You can deploy different branches separately
- Useful for testing before merging
- Each branch gets its own URL

## Security Best Practices:

1. **Use strong secrets** for JWT and other sensitive data
2. **Rotate secrets** regularly in production
3. **Monitor logs** for suspicious activity
4. **Keep dependencies updated** for security patches
5. **Use HTTPS** (automatically provided by Render)
6. **Implement rate limiting** (already in your code)
7. **Validate all inputs** (already in your code)

## Monitoring and Scaling:

### Monitoring:
- Set up uptime monitoring
- Configure error tracking (e.g., Sentry)
- Monitor database performance
- Track API response times

### Scaling:
- Upgrade to Standard tier for always-on service
- Add more instances for high traffic
- Use load balancers for production
- Consider CDN for static assets

## Cost:

- **Free**: $0/month (with limitations)
- **Standard**: $7/month (always-on, better performance)
- **Pro**: $25/month (more resources, dedicated support)

## Backup and Recovery:

- **MongoDB Atlas**: Automatic backups included
- **Code**: Safe in GitHub
- **Environment Variables**: Save securely offline
- **Regular testing**: Test backup recovery process

## Next Steps:

After deploying to Render:
1. Test all API endpoints
2. Verify database connectivity
3. Test file uploads (Cloudinary)
4. Test payment integration (Razorpay)
5. Monitor logs for errors
6. Set up monitoring and alerts
7. Deploy frontend to Vercel

Your Node.js backend is now live on Render! 🚀