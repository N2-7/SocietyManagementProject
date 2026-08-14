# Vercel Deployment Guide - Frontend

Follow these steps to deploy your React frontend to Vercel.

## Prerequisites

- GitHub repository with your code (already done: https://github.com/N2-7/SocietyManagementProject)
- Backend deployed on Render (do this first!)
- MongoDB Atlas set up (do this first!)
- Vercel account (free)

## Step 1: Create Vercel Account

1. Go to [Vercel.com](https://vercel.com/signup)
2. Click **"Sign Up"**
3. Sign up using:
   - GitHub account (recommended)
   - GitLab account
   - Bitbucket account
   - Email address
4. Authorize Vercel to access your GitHub account

## Step 2: Import Your Project

1. After logging in, you'll see the Vercel dashboard
2. Click **"Add New..."** → **"Project"**
3. You'll see your GitHub repositories
4. Find and click **"SocietyManagementProject"**
5. Click **"Import"**

## Step 3: Configure Project Settings

### Framework Preset:
- Vercel will automatically detect **Vite** as the framework
- If not detected, select **"Vite"** manually

### Root Directory:
- Click **"Edit"** next to Root Directory
- Select **"frontend"** folder
- Click **"Save"**

### Build & Development Settings:
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

## Step 4: Add Environment Variables

1. Scroll down to **"Environment Variables"** section
2. Click **"Add New"**
3. Add the following variable:

### VITE_API_URL:
- **Key**: `VITE_API_URL`
- **Value**: Your Render backend URL
  - Example: `https://smart-society-backend.onrender.com`
  - **Note**: You'll get this after deploying the backend to Render

4. Click **"Add"**
5. Click **"Save"**

## Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for deployment to complete (2-3 minutes)
3. You'll see deployment progress:
   - Cloning repository
   - Installing dependencies
   - Building project
   - Uploading to Vercel CDN

## Step 6: Get Your Deployment URL

After successful deployment:
1. You'll see a **Congratulations!** message
2. Copy your deployment URL:
   - Format: `https://your-project-name.vercel.app`
   - Example: `https://society-management.vercel.app`

## Step 7: Test Your Deployment

1. Visit your Vercel URL
2. You should see the login page
3. Try to login (you may need to create an admin user first)
4. Test various features to ensure everything works

## Step 8: Update Backend CORS

After getting your Vercel URL, update your Render backend:

1. Go to your Render dashboard
2. Find your backend service
3. Go to **"Environment"** tab
4. Update `CLIENT_URL` environment variable:
   - **Value**: Your Vercel URL
   - Example: `https://society-management.vercel.app`
5. Click **"Save Changes"**
6. Render will automatically redeploy with new settings

## Vercel Dashboard Features

### View Deployments:
- Go to your project dashboard
- See all deployment history
- View deployment logs
- Rollback to previous versions if needed

### Custom Domains (Optional):
1. Go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Configure DNS settings
4. Vercel provides SSL certificates automatically

### Environment Variables Management:
- Go to **"Settings"** → **"Environment Variables"**
- Add, edit, or delete variables
- Variables are automatically updated on next deployment

## Automatic Deployments

Vercel automatically deploys when you:
- Push to your `main` branch
- Open a pull request
- Merge a pull request

### Preview Deployments:
- Every pull request gets a preview URL
- Test changes before merging to main
- Share preview URLs with team members

## Important Notes:

### Environment Variables:
- **VITE_API_URL** must start with `VITE_` prefix for Vite to recognize it
- Don't include `/api` in the URL - it's added in the code
- Update this variable if your backend URL changes

### Build Errors:
- Check deployment logs for specific errors
- Ensure all dependencies are in package.json
- Verify build command is correct
- Check for TypeScript/ESLint errors

### Performance:
- Vercel automatically optimizes your React app
- Assets are served from CDN
- Automatic code splitting
- Image optimization

## Troubleshooting:

### Build Fails:
1. Check deployment logs
2. Ensure `package.json` has correct scripts
3. Verify all dependencies are installable
4. Check for syntax errors in your code

### API Errors:
1. Verify `VITE_API_URL` is correct
2. Check if backend is deployed and running
3. Ensure CORS is configured correctly on backend
4. Check browser console for specific errors

### Blank Page:
1. Check if build completed successfully
2. Verify routing is configured correctly
3. Check browser console for JavaScript errors
4. Ensure environment variables are set

### White Screen of Death:
1. Check if React is mounting correctly
2. Verify all imports are correct
3. Check for circular dependencies
4. Review deployment logs

## Advanced Configuration:

### Custom vercel.json:
Your project already has `vercel.json` with:
- Build configuration
- API proxy settings
- Rewrite rules for SPA routing

### Environment-Specific Variables:
You can add different variables for:
- Production
- Preview deployments
- Development branches

## Monitoring and Analytics:

Vercel provides:
- **Analytics**: Page views, visitors, bandwidth
- **Logs**: Real-time log streaming
- **Performance**: Core Web Vitals
- **Uptime**: Site availability monitoring

## Cost:

- **Free Tier**: Generous limits for personal projects
- **Hobby**: $20/month for additional features
- **Pro**: $40/month for teams

## Security:

- **HTTPS**: Automatic SSL certificates
- **Environment Variables**: Encrypted at rest
- **DDoS Protection**: Built-in protection
- **Web Application Firewall**: Available on paid plans

## Next Steps:

After deploying to Vercel:
1. Test all features thoroughly
2. Set up custom domain (optional)
3. Configure analytics and monitoring
4. Set up automatic deployments from GitHub
5. Share your live application URL!

Your React frontend is now live on Vercel! 🚀