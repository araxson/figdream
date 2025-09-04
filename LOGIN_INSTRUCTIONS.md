# 🔐 Login Instructions for FigDream

## Super Admin Login

### ✅ Correct Login Process:

1. **Go to the main login page:**
   ```
   http://localhost:3000/login
   ```
   
2. **Enter your credentials:**
   - Email: `ivatlou@gmail.com`
   - Password: `Admin123!`

3. **Click "Sign In"**
   - You will be automatically redirected to `/super-admin` dashboard based on your role

### ❌ Common Mistakes to Avoid:

- **DON'T** go directly to `/login/super-admin` - this is not the login page
- **DON'T** go directly to `/super-admin` without logging in first - you'll get a 403 error
- **DON'T** use role-specific login URLs - there's only ONE login page for all users

### 📍 Correct URLs:

| Purpose | URL | Description |
|---------|-----|-------------|
| **Login (All Users)** | `http://localhost:3000/login` | Single login page for everyone |
| **Register** | `http://localhost:3000/register` | New account signup |
| **Super Admin Dashboard** | `http://localhost:3000/super-admin` | After login only |

### 🚀 After Successful Login:

Based on your role, you'll be automatically redirected to:
- **Super Admin** → `/super-admin`
- **Salon Owner** → `/salon-owner`
- **Staff** → `/staff`
- **Customer** → `/customer`
- **Location Manager** → `/location-manager`

### 🔧 Troubleshooting:

If you get a 403 error:
1. You're not logged in - go to `/login` first
2. Clear your browser cookies and try again
3. Make sure you're using the correct credentials

### 📝 Your Credentials:
```
Email: ivatlou@gmail.com
Password: Admin123!
Role: super_admin
```

### 💡 Important Notes:

- The system uses **role-based routing** - you can't manually navigate to role URLs
- Authentication is checked on every protected route
- Sessions expire after a period of inactivity
- Always use the main `/login` page to sign in

## Quick Test:

1. Open: http://localhost:3000/login
2. Enter email and password
3. Click "Sign In"
4. You should see the Super Admin dashboard

If this doesn't work, there may be an issue with the authentication setup.