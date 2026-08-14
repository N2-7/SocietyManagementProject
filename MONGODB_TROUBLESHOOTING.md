# MongoDB Authentication Fix

The "bad auth : authentication failed" error means the username/password combination is incorrect or the user doesn't have proper permissions.

## 🔧 Step-by-Step Fix

### Step 1: Go to MongoDB Atlas

1. Visit [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Log in with your account
3. Navigate to your cluster

### Step 2: Check Database Users

1. Click **"Database Access"** in the left sidebar
2. Look for user named `Society`
3. If user doesn't exist, create a new one
4. If user exists, verify or reset the password

### Step 3: Create/Update Database User

#### If user doesn't exist:

1. Click **"Add New Database User"**
2. Fill in:
   - **Username**: `Society`
   - **Password**: `Society123` (or any secure password you prefer)
   - **Database User Privileges**: Select **"Read and write to any database"**
3. Click **"Create User"**

#### If user exists:

1. Click **"Edit"** next to the `Society` user
2. Click **"Edit Password"**
3. Set a new password: `Society123` (or your preferred password)
4. Ensure **"Read and write to any database"** is selected
5. Click **"Update"**

### Step 4: Update Connection String

After setting/resetting the password, use this connection string format:

```
mongodb+srv://Society:Society123@society.k1prnoc.mongodb.net/?retryWrites=true&w=majority
```

**Replace `Society123` with your actual password if you chose a different one.**

### Step 5: Update Render Environment Variable

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your backend service
3. Go to **"Environment"** tab
4. Find `MONGODB_URI` variable
5. Update it with the new connection string:
   ```
   mongodb+srv://Society:Society123@society.k1prnoc.mongodb.net/?retryWrites=true&w=majority
   ```
6. Click **"Save Changes"**

### Step 6: Trigger Redeploy

Render will automatically redeploy after saving the environment variable.

## 🔍 Alternative Solution: Create New User

If the above doesn't work, create a completely new user:

### Step 1: Create New User in MongoDB Atlas

1. Go to **Database Access**
2. Click **"Add New Database User"**
3. Use:
   - **Username**: `smart-society-admin`
   - **Password**: `SmartSociety2024!` (or your secure password)
   - **Database User Privileges**: **"Read and write to any database"**
4. Click **"Create User"**

### Step 2: Update Connection String

Use this new connection string:
```
mongodb+srv://smart-society-admin:SmartSociety2024!@society.k1prnoc.mongodb.net/?retryWrites=true&w=majority
```

### Step 3: Update Render

Update the `MONGODB_URI` in Render with the new connection string.

## ✅ Verification

After updating, check the Render logs. You should see:
```
MongoDB Connected: society.k1prnoc.mongodb.net
Server running in production mode on port 5000
```

## 🎯 Quick Fix Summary

**Option 1: Reset existing user password**
- Go to MongoDB Atlas → Database Access
- Reset password for user `Society`
- Update Render with new password

**Option 2: Create new user**
- Create new user with known credentials
- Update connection string with new user credentials
- Update Render environment variable

**Option 3: Use MongoDB Compass to test**
- Download MongoDB Compass
- Test connection locally first
- Once working, use those credentials in Render

## 🚨 Common Issues

1. **Wrong password**: The most common issue - double-check the password
2. **User doesn't exist**: The user might have been deleted
3. **Wrong database permissions**: User needs "Read and write to any database"
4. **IP whitelisting**: Ensure "Allow Access from Anywhere" (0.0.0.0/0) is set
5. **Cluster paused**: Ensure cluster is active, not paused

## 💡 Recommended Approach

**Use Option 2 (Create new user)** - it's the most reliable because:
- You know the exact credentials
- Fresh user with proper permissions
- No confusion about existing passwords

**Connection string to use after creating new user:**
```
mongodb+srv://smart-society-admin:SmartSociety2024!@society.k1prnoc.mongodb.net/?retryWrites=true&w=majority
```

Try this approach and your MongoDB authentication should work!