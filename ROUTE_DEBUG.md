# 🔧 Debug "Route not found" Error

The "Route not found" error means the backend is receiving requests but the URL doesn't match expected routes.

## 🔍 Debug Steps

### Step 1: Test Backend Health First

Test if your backend is actually running:
```
https://societymanagementproject.onrender.com/api/health
```

**Expected response:**
```json
{"success":true,"message":"Server is running"}
```

If this fails, your backend might be sleeping (Render free tier) or not running.

### Step 2: Test Auth Endpoints Directly

Test the registration endpoint directly using browser or Postman:

**Registration:**
- **URL**: `https://societymanagementproject.onrender.com/api/auth/register`
- **Method**: POST
- **Body** (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "flatNo": "A-101",
  "password": "password123",
  "phone": "1234567890"
}
```

**Login:**
- **URL**: `https://societymanagementproject.onrender.com/api/auth/login`
- **Method**: POST
- **Body** (JSON):
```json
{
  "flatNo": "A-101",
  "password": "password123"
}
```

### Step 3: Check Frontend API Calls

Open browser console (F12) when trying to register/login and look for:
- What URL is being called
- What method is being used
- What error is shown

### Step 4: Check Vercel Environment Variable

Verify the environment variable is set correctly:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check `VITE_API_URL` is: `https://societymanagementproject.onrender.com`
3. Make sure it's set for "All" environments

## 🎯 Most Likely Issues

### Issue 1: Backend is Sleeping
Render free tier spins down after 15 minutes of inactivity.
- **Solution**: Wait 30 seconds for backend to wake up
- **Test**: Call the health endpoint first

### Issue 2: Wrong API URL in Frontend
Frontend might be calling wrong URL due to environment variable not being set.
- **Solution**: Verify VITE_API_URL is set in Vercel
- **Check**: Browser console logs for actual API calls

### Issue 3: Missing /api/ Prefix
Frontend might be calling without `/api/` prefix.
- **Expected**: `https://societymanagementproject.onrender.com/api/auth/register`
- **Wrong**: `https://societymanagementproject.onrender.com/auth/register`

### Issue 4: Environment Variable Not Working
Vite environment variables need to start with `VITE_` prefix.
- **Check**: Variable name is exactly `VITE_API_URL`
- **Redeploy**: Vercel after adding variable

## 🔧 Quick Fixes

### Fix 1: Wake Up Backend
1. Visit: `https://societymanagementproject.onrender.com/api/health`
2. Wait 30 seconds
3. Try registration again

### Fix 2: Verify Environment Variable
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Check `VITE_API_URL` exists and is correct
3. Redeploy if needed

### Fix 3: Check Browser Console
1. Open your Vercel site
2. Open browser console (F12)
3. Try to register
4. Look for the actual API call being made
5. Check if URL is correct

### Fix 4: Test with Correct Format
Backend expects these exact endpoints:
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me` (protected)

## 📋 What to Check First

1. **Backend health**: `https://societymanagementproject.onrender.com/api/health`
2. **Vercel environment variable**: `VITE_API_URL=https://societymanagementproject.onrender.com`
3. **Browser console**: What URL is actually being called
4. **Render logs**: Any backend errors

## 🚀 Solution

Most likely the issue is that the `VITE_API_URL` environment variable is not set correctly in Vercel, or the backend is sleeping.

**First try**: Call the health endpoint to wake up the backend, then try registration again.

**If that doesn't work**: Check Vercel environment variable and redeploy.