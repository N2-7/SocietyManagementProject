# 🔧 Fix Registration/Login Issues

The registration and login failures are because the frontend can't connect to the backend. Here's how to fix it:

## 🔍 Issue Diagnosis

The problem is likely that the `VITE_API_URL` environment variable is not set in Vercel, so the frontend is trying to use local API routes instead of your live backend.

## ✅ Step 1: Add Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `society-management-project-os1y`
3. Click on it
4. Go to **Settings** → **Environment Variables**
5. Click **"Add New"**
6. Add this variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://societymanagementproject.onrender.com`
   - **Environment**: Select **All** (Production, Preview, Development)
7. Click **"Save"**
8. Click **"Redeploy"** to apply changes

## ✅ Step 2: Verify Backend is Running

Test if your backend is accessible:

1. Visit: https://societymanagementproject.onrender.com/api/health
2. You should see: `{"success":true,"message":"Server is running"}`
3. If this works, your backend is fine

## ✅ Step 3: Test Backend Registration Endpoint

Test if the registration endpoint works:

1. Use a tool like Postman or curl
2. POST to: https://societymanagementproject.onrender.com/api/auth/register
3. Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "flatNo": "A-101",
  "password": "password123",
  "phone": "1234567890"
}
```

## ✅ Step 4: Check Browser Console

After updating Vercel environment variable:

1. Open your Vercel site: https://society-management-project-os1y.vercel.app
2. Open browser console (F12)
3. Try to register
4. Check console for API request logs
5. Look for connection errors

## 🔧 Alternative: Check Current Frontend Build

If the above doesn't work, the frontend might need to be rebuilt with the new environment variable:

1. In Vercel dashboard
2. Go to **Deployments**
3. Click **"Redeploy"** on the latest deployment
4. This will rebuild with the new environment variable

## 🎯 What Should Happen After Fix

Once `VITE_API_URL` is set correctly:
- Frontend will make requests to: `https://societymanagementproject.onrender.com/api/auth/register`
- Instead of trying to use local routes
- Registration and login should work

## 🚨 Common Issues

### CORS Errors
If you see CORS errors:
1. Check Render backend has `CLIENT_URL` set to your Vercel URL
2. Verify backend CORS configuration is correct

### Network Errors
If you see network errors:
1. Backend might be sleeping (Render free tier)
2. Wait 30 seconds for backend to wake up
3. Check if backend is actually running

### Environment Variable Not Working
If the variable doesn't seem to work:
1. Ensure it starts with `VITE_` prefix
2. Make sure you selected "All" environments
3. Redeploy after adding the variable

## 📋 Quick Checklist

- [ ] Added `VITE_API_URL=https://societymanagementproject.onrender.com` in Vercel
- [ ] Selected "All" environments for the variable
- [ ] Redeployed the frontend
- [ ] Tested backend health endpoint
- [ ] Checked browser console for errors
- [ ] Verified CORS is configured in backend

## 🔍 Debugging Steps

If still not working:

1. **Check Render logs** for backend errors
2. **Check Vercel logs** for frontend build errors
3. **Test API directly** with Postman/curl
4. **Verify environment variable** is actually set in the build
5. **Check browser network tab** for failed requests

The most likely fix is adding the `VITE_API_URL` environment variable in Vercel!