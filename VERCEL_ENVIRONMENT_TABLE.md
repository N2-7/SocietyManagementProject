# Vercel Environment Variables & Configuration Table

Complete environment variables and configuration details for your Vercel frontend deployment.

## 📋 Vercel Environment Variables Table

| Variable Name | Value | Description | Required | Scope |
|--------------|-------|-------------|----------|-------|
| **VITE_API_URL** | `https://your-backend.onrender.com` | Your Render backend API URL | ✅ Yes | Production, Preview, Development |

## 🔧 Vercel Configuration Details

### Project Settings
| Setting | Value | Description |
|---------|-------|-------------|
| **Framework Preset** | Vite | Build framework detected automatically |
| **Root Directory** | `frontend` | Directory containing your React app |
| **Build Command** | `npm run build` | Command to build your project |
| **Output Directory** | `dist` | Directory containing built files |
| **Install Command** | `npm install` | Command to install dependencies |
| **Dev Command** | `npm run dev` | Command for local development |

### Deployment Settings
| Setting | Value | Description |
|---------|-------|-------------|
| **Branch** | `main` | Git branch to deploy |
| **Build Cache** | Enabled | Speeds up builds by caching dependencies |
| **Node.js Version** | Latest (or specified) | Node.js runtime version |

## 🌐 Current Configuration

### Your Existing Vercel Deployment
| Property | Value |
|----------|-------|
| **Vercel URL** | `https://society-management-project-psi.vercel.app` |
| **Project Name** | `society-management-project-psi` |
| **Framework** | Vite + React |
| **Status** | Active |

### Your Backend Details (for reference)
| Property | Value |
|----------|-------|
| **Expected Backend URL** | `https://societymanagementproject.onrender.com` |
| **MongoDB URI** | `mongodb+srv://societymanage:society12@cluster0.qdhnug5.mongodb.net/societymanage?appName=Cluster0` |
| **Frontend URL (for CORS)** | `https://society-management-project-psi.vercel.app` |

## 🚀 How to Configure Vercel Environment Variables

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your project: `society-management-project-psi`
3. Click on the project

### Step 2: Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Add the following variable:

#### VITE_API_URL Configuration
| Field | Value |
|-------|-------|
| **Key** | `VITE_API_URL` |
| **Value** | `https://societymanagementproject.onrender.com` |
| **Environments** | Production, Preview, Development |
| **Scope** | All |

4. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Select **Redeploy**

## 📝 vercel.json Configuration

Your current `frontend/vercel.json` configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:match*",
      "destination": "https://societymanagementproject.onrender.com/api/:match*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Configuration Breakdown
| Setting | Current Value | Purpose |
|---------|---------------|---------|
| **buildCommand** | `npm run build` | Builds the React app for production |
| **outputDirectory** | `dist` | Where Vercel looks for built files |
| **devCommand** | `npm run dev` | Local development command |
| **installCommand** | `npm install` | Installs dependencies |
| **framework** | `vite` | Build framework to use |
| **rewrites[0]** | API proxy | Routes `/api/*` to backend |
| **rewrites[1]** | SPA routing | All other routes to `index.html` |

## 🔗 Important URL Mappings

### Development vs Production URLs
| Environment | API URL | Frontend URL |
|-------------|---------|--------------|
| **Local Development** | `http://localhost:5000` | `http://localhost:5173` |
| **Production** | `https://societymanagementproject.onrender.com` | `https://society-management-project-psi.vercel.app` |

### URL Endpoints Reference
| Endpoint | Local | Production |
|----------|-------|------------|
| **Health Check** | `http://localhost:5000/api/health` | `https://societymanagementproject.onrender.com/api/health` |
| **Auth Login** | `http://localhost:5000/api/auth/login` | `https://societymanagementproject.onrender.com/api/auth/login` |
| **Admin Routes** | `http://localhost:5000/api/admin/*` | `https://societymanagementproject.onrender.com/api/admin/*` |
| **Resident Routes** | `http://localhost:5000/api/resident/*` | `https://societymanagementproject.onrender.com/api/resident/*` |

## ✅ Configuration Checklist

### Before Deploying to Vercel:
- [ ] Backend is deployed on Render
- [ ] Backend URL is known and accessible
- [ ] MongoDB connection is working
- [ ] Backend environment variables are set
- [ ] Backend `/api/health` endpoint is accessible

### Vercel Environment Variables:
- [ ] `VITE_API_URL` is set to your Render backend URL
- [ ] Variable is scoped to Production, Preview, and Development
- [ ] No typos in the URL
- [ ] URL includes `https://` protocol

### Backend CORS Configuration:
- [ ] `CLIENT_URL` on Render is set to your Vercel URL
- [ ] Backend has been redeployed after CORS update
- [ ] CORS allows your Vercel domain

### Testing:
- [ ] Visit Vercel URL and see the login page
- [ ] Try to login with test credentials
- [ ] Check browser console for API errors
- [ ] Test multiple features (admin/resident/guard portals)

## 🛠️ Troubleshooting Vercel Configuration

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **API calls failing** | Wrong `VITE_API_URL` | Update with correct Render backend URL |
| **CORS errors** | Backend doesn't allow Vercel domain | Update `CLIENT_URL` on Render |
| **Blank page** | Build errors or routing issues | Check deployment logs, verify vercel.json |
| **Environment variables not working** | Missing `VITE_` prefix | Ensure variable starts with `VITE_` |
| **API proxy not working** | Outdated backend URL in vercel.json | Update `destination` in rewrites |

### How to Debug

1. **Check Deployment Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - View "Build Logs" and "Function Logs"

2. **Verify Environment Variables**
   - Settings → Environment Variables
   - Ensure variables are visible in the correct scope

3. **Test API Connection**
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should return: `{"success":true,"message":"Server is running"}`

4. **Check Browser Console**
   - Open DevTools (F12)
   - Look for network errors or CORS issues
   - Verify API calls are going to correct URL

## 🔄 Updating Configuration

### When to Update Vercel Configuration:

| Scenario | What to Update |
|----------|----------------|
| **Backend URL changes** | Update `VITE_API_URL` in Vercel |
| **New Vercel domain** | Update `CLIENT_URL` on Render |
| **New environment variables needed** | Add to Vercel Environment Variables |
| **Build configuration changes** | Update `vercel.json` or package.json scripts |

### Update Process:
1. Make changes locally
2. Commit to GitHub
3. Vercel auto-deploys from main branch
4. For environment variables, update in Vercel Dashboard
5. Redeploy if needed

## 📊 Performance Optimization

### Vercel Automatic Optimizations:
| Feature | Description |
|---------|-------------|
| **Automatic Code Splitting** | Splits code into smaller chunks |
| **Image Optimization** | Optimizes images automatically |
| **CDN Delivery** | Serves assets from edge locations |
| **HTTP/2** | Faster page loads |
| **Automatic HTTPS** | SSL certificates included |

### Manual Optimizations:
- Use lazy loading for images
- Implement code splitting for large components
- Optimize bundle size
- Use Vercel Analytics for performance insights

## 🔒 Security Considerations

### Security Best Practices:
| Practice | Implementation |
|----------|----------------|
| **HTTPS** | Automatic on Vercel |
| **Environment Variables** | Encrypted at rest |
| **API Keys** | Never commit to git, use environment variables |
| **CORS** | Configure on backend to allow only trusted domains |
| **Rate Limiting** | Already implemented on backend |

## 📱 Deployment Environments

### Environment-Specific Variables:
You can set different values for different environments:

| Environment | Purpose | VITE_API_URL Example |
|-------------|---------|---------------------|
| **Production** | Live site | `https://societymanagementproject.onrender.com` |
| **Preview** | Pull request previews | `https://societymanagementproject.onrender.com` |
| **Development** | Local development | `http://localhost:5000` |

## 🎯 Quick Reference

### Your Current Setup:
```
Frontend: https://society-management-project-psi.vercel.app
Backend:  https://societymanagementproject.onrender.com (to be deployed)
MongoDB:  societymanage.8q0c7bk.mongodb.net
```

### Required Environment Variable:
```
VITE_API_URL = https://societymanagementproject.onrender.com
```

### vercel.json API Proxy:
```
/api/* → https://societymanagementproject.onrender.com/api/*
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Environment Variables Guide](https://vercel.com/docs/projects/environment-variables)
- [Framework Documentation](https://vercel.com/docs/frameworks/vite)
- [Deployment Guide](https://vercel.com/docs/deployments/overview)

Your Vercel configuration is ready! Just update the `VITE_API_URL` with your Render backend URL after deploying the backend. 🚀
