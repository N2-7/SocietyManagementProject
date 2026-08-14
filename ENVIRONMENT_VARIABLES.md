# Render Environment Variables - Complete Table

Add these environment variables to your Render backend service in the exact format shown below.

## 🔐 Generated Secure Keys

**JWT_SECRET**: `SocietyManagement_JWT_Secret_2024_Secure_Key_78492`
**REFRESH_TOKEN_SECRET**: `SocietyManagement_Refresh_Token_Secret_2024_58374`

## 📋 Complete Environment Variables Table

| Variable Name | Value | Description | Required |
|--------------|-------|-------------|----------|
| **NODE_ENV** | `production` | Environment mode | ✅ Yes |
| **PORT** | `5000` | Server port | ✅ Yes |
| **MONGODB_URI** | `mongodb+srv://patelnilay22cse_db_user:DrEoEOsGW1ErFCh4@societymanage.8q0c7bk.mongodb.net/?retryWrites=true&w=majority` | MongoDB connection string | ✅ Yes |
| **JWT_SECRET** | `SocietyManagement_JWT_Secret_2024_Secure_Key_78492` | Secret key for JWT tokens | ✅ Yes |
| **JWT_EXPIRE** | `7d` | JWT token expiration time | ✅ Yes |
| **REFRESH_TOKEN_SECRET** | `SocietyManagement_Refresh_Token_Secret_2024_58374` | Secret key for refresh tokens | ✅ Yes |
| **REFRESH_TOKEN_EXPIRE** | `30d` | Refresh token expiration time | ✅ Yes |
| **CLIENT_URL** | `https://society-management-project-os1y.vercel.app` | Your Vercel frontend URL | ✅ Yes |
| **CLOUDINARY_CLOUD_NAME** | `YOUR_CLOUD_NAME_HERE` | Cloudinary cloud name | ⚠️ Optional* |
| **CLOUDINARY_API_KEY** | `YOUR_API_KEY_HERE` | Cloudinary API key | ⚠️ Optional* |
| **CLOUDINARY_API_SECRET** | `YOUR_API_SECRET_HERE` | Cloudinary API secret | ⚠️ Optional* |
| **RAZORPAY_KEY_ID** | `rzp_test_SmrsBQpTanwC13` | Razorpay key ID | ⚠️ Optional* |
| **RAZORPAY_KEY_SECRET** | `Ul4tO73xXscStle8PNmFIpIT` | Razorpay key secret | ⚠️ Optional* |
| **EMAIL_HOST** | `smtp.gmail.com` | Email host (optional) | ❌ No |
| **EMAIL_PORT** | `587` | Email port (optional) | ❌ No |
| **EMAIL_USER** | `your_email@gmail.com` | Email user (optional) | ❌ No |
| **EMAIL_PASSWORD** | `your_app_password` | Email password (optional) | ❌ No |

## 🎯 How to Add These to Render

### Step 1: Go to Render Dashboard
1. Visit [dashboard.render.com](https://dashboard.render.com)
2. Find your backend service
3. Click on it

### Step 2: Add Environment Variables
1. Go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add each variable from the table above
4. Use **EXACT** keys and values as shown
5. Click **"Save Changes"** after adding all

### Step 3: Deploy
1. Render will automatically redeploy
2. Wait for deployment to complete
3. Test your backend: `https://your-backend.onrender.com/api/health`

## ❓ About Cloudinary

**What is Cloudinary?**
Cloudinary is a cloud-based image and video management service. It's used for:
- Uploading and storing images
- Image optimization
- Image transformations
- CDN delivery

**Do you need it?**
- **Required for**: Image upload features (profile pictures, complaint images, etc.)
- **Optional for**: Basic functionality without image uploads
- **Free tier available**: 25GB storage/month

**How to get Cloudinary (if you want image uploads):**
1. Go to [cloudinary.com](https://cloudinary.com/users/register/free)
2. Sign up for free account
3. Get credentials from Dashboard → Settings

**What if you don't add Cloudinary?**
- Image upload features won't work
- Everything else will work fine
- You can add it later if needed

## 💡 Important Notes

### Required Variables (Must Add):
These are essential for your app to work:
- NODE_ENV, PORT, MONGODB_URI
- JWT_SECRET, JWT_EXPIRE
- REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRE
- CLIENT_URL

### Optional Variables (Can Add Later):
These add extra functionality:
- Cloudinary: For image uploads
- Razorpay: For payment integration
- Email: For email notifications

### Security Notes:
- **JWT_SECRET** and **REFRESH_TOKEN_SECRET** are pre-generated for you
- **Never share these secrets** with anyone
- **Keep them secure** - they protect your authentication system
- **Store them safely** in case you need to migrate servers

## 🔧 After Adding Variables

### Update Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL (e.g., `https://your-backend.onrender.com`)

### Test Everything:
1. Backend health: `https://your-backend.onrender.com/api/health`
2. Frontend: `https://society-management-project-os1y.vercel.app`
3. Try to login (you may need to create admin user first)

## 🚀 Quick Copy-Paste Values

### MongoDB URI (Your working connection):
```
mongodb+srv://patelnilay22cse_db_user:DrEoEOsGW1ErFCh4@societymanage.8q0c7bk.mongodb.net/?retryWrites=true&w=majority
```

### JWT Secrets (Pre-generated):
```
JWT_SECRET=SocietyManagement_JWT_Secret_2024_Secure_Key_78492
REFRESH_TOKEN_SECRET=SocietyManagement_Refresh_Token_Secret_2024_58374
```

### Frontend URL:
```
CLIENT_URL=https://society-management-project-os1y.vercel.app
```

### Razorpay (Your keys):
```
RAZORPAY_KEY_ID=rzp_test_SmrsBQpTanwC13
RAZORPAY_KEY_SECRET=Ul4tO73xXscStle8PNmFIpIT
```

### Cloudinary (Skip for now or add later):
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## ✅ Deployment Checklist

- [ ] Add all required environment variables to Render
- [ ] Add Razorpay keys (if you have them)
- [ ] Skip Cloudinary for now (can add later)
- [ ] Update Vercel with Render backend URL
- [ ] Test backend health endpoint
- [ ] Test frontend login
- [ ] Create first admin user (if needed)

Your deployment is almost complete! Just add these variables and you'll be live! 🎉