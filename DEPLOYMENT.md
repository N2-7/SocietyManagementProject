# Deployment Guide

This guide will help you deploy the Smart Society Management System to production using:
- **Vercel** for the frontend (React)
- **Render** for the backend (Node.js/Express)
- **MongoDB Atlas** for the database

## Prerequisites

1. **Accounts Required:**
   - [Vercel Account](https://vercel.com/signup) (Free)
   - [Render Account](https://render.com/register) (Free tier available)
   - [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas/register) (Free tier available)
   - [Cloudinary Account](https://cloudinary.com/users/register/free) (Free tier available)
   - [Razorpay Account](https://razorpay.com/signup) (Test mode free)

2. **Code Repository:**
   - Push your code to GitHub (both Vercel and Render integrate with GitHub)

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier)
3. Create a database user with username and password
4. Network Access: Whitelist `0.0.0.0/0` (allow all IP addresses) for simplicity
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
   ```

## Step 2: Setup Cloudinary (for file uploads)

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up and get your:
   - Cloud Name
   - API Key
   - API Secret

## Step 3: Setup Razorpay (for payments)

1. Go to [Razorpay](https://razorpay.com/signup)
2. Get your test mode keys:
   - Key ID
   - Key Secret

## Step 4: Deploy Backend to Render

### 4.1 Prepare Backend

1. Ensure your backend code is pushed to GitHub
2. Make sure `backend/.env.example` is updated with all required variables

### 4.2 Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `backend` folder (or root if it's a monorepo)
5. Configure:
   - **Name**: `smart-society-backend`
   - **Region**: Choose nearest region
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. **Environment Variables** (add these in the "Advanced" section):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart-society
   JWT_SECRET=<your_secret_key>
   JWT_EXPIRE=7d
   REFRESH_TOKEN_SECRET=<your_refresh_secret>
   REFRESH_TOKEN_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=<your_cloud_name>
   CLOUDINARY_API_KEY=<your_api_key>
   CLOUDINARY_API_SECRET=<your_api_secret>
   RAZORPAY_KEY_ID=<your_razorpay_key_id>
   RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```
7. Click "Deploy Web Service"
8. Wait for deployment and note your backend URL: `https://your-backend.onrender.com`

## Step 5: Deploy Frontend to Vercel

### 5.1 Prepare Frontend

1. Ensure your frontend code is pushed to GitHub
2. Update `frontend/.env.example` with your backend URL:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

### 5.2 Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
6. Click "Deploy"
7. Wait for deployment and note your frontend URL: `https://your-frontend.vercel.app`

### 5.3 Update Backend CORS

After getting your Vercel URL, update the Render environment variable:
```
CLIENT_URL=https://your-frontend.vercel.app
```

## Step 6: Post-Deployment Configuration

### 6.1 Test the Deployment

1. Visit your frontend URL
2. Try logging in (you may need to create an admin user first)
3. Test various features like complaints, maintenance, etc.

### 6.2 Create Admin User

Since you can't access the database directly, create a temporary API endpoint or use MongoDB Compass to create the first admin user:

```javascript
{
  "name": "Admin User",
  "email": "admin@society.com",
  "flatNo": "ADMIN",
  "password": "admin123", // This will be hashed automatically
  "phone": "1234567890",
  "role": "admin",
  "status": "active"
}
```

### 6.3 Monitor Logs

- **Render Logs**: Check Render dashboard for backend logs
- **Vercel Logs**: Check Vercel dashboard for frontend logs

## Environment Variables Reference

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your_random_secret_key` |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens | `your_refresh_secret_key` |
| `REFRESH_TOKEN_EXPIRE` | Refresh token expiration | `30d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |
| `RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | `your_secret` |
| `CLIENT_URL` | Frontend URL | `https://your-app.vercel.app` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.onrender.com` |

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `CLIENT_URL` in backend matches your Vercel URL
2. **Database Connection**: Check MongoDB Atlas whitelist and connection string
3. **Build Failures**: Check logs in Render/Vercel dashboards
4. **Environment Variables**: Ensure all required variables are set
5. **Socket.io Issues**: WebSockets may need additional configuration on Render

### Debugging Tips

- Check browser console for frontend errors
- Check Render logs for backend errors
- Test API endpoints directly using tools like Postman
- Verify environment variables are correctly set

## Cost Estimate

### Free Tier Usage (Monthly)

- **Render**: Free tier (limited hours, sleeps when inactive)
- **Vercel**: Free tier (generous limits)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Cloudinary**: Free tier (25GB storage/month)
- **Razorpay**: Test mode (free)

### Paid Tier (if needed)

- **Render**: $7/month for basic web service
- **MongoDB Atlas**: Starting at $9/month
- **Vercel**: $20/month for Pro plan

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong secrets** for JWT and other sensitive data
3. **Enable MongoDB authentication** and network restrictions
4. **Use HTTPS** for all connections (automatically on Vercel/Render)
5. **Regularly update dependencies** for security patches
6. **Monitor logs** for suspicious activity

## Maintenance

1. **Regular backups**: MongoDB Atlas provides automated backups
2. **Monitor usage**: Check Render/Vercel dashboards for resource usage
3. **Update dependencies**: Run `npm update` regularly
4. **Review logs**: Check for errors and performance issues
5. **Test payments**: Ensure Razorpay integration works in production

## Support

For issues with:
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Cloudinary**: https://cloudinary.com/documentation
- **Razorpay**: https://razorpay.com/docs