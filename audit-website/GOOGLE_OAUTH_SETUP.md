# Google OAuth Setup Guide

## 🔐 Setting up Google OAuth for SiteScope

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "SiteScope Audit Tool"
4. Click "Create"

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "SiteScope"
   - Add your email as developer contact
   - Add scopes: `../auth/userinfo.email` and `../auth/userinfo.profile`

### Step 4: Configure OAuth Client

1. Application type: "Web application"
2. Name: "SiteScope Web Client"
3. Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
4. Authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)

### Step 5: Get Your Credentials

1. After creating, you'll see your:

   - **Client ID**: `123456789-abc123def456.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-your-secret-here`

2. Copy these to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### Step 6: Test OAuth Flow

1. Start your application: `npm start`
2. Go to `http://localhost:3000/auth/login`
3. Click "Sign in with Google"
4. You should see Google's consent screen
5. After accepting, you'll be redirected back to your dashboard

## 🛡️ Security Notes

### For Development:

- Use `http://localhost:3000` for local testing
- Keep your client secret secure
- Don't commit credentials to Git

### For Production:

- Use HTTPS only (`https://yourdomain.com`)
- Set proper CORS origins
- Use environment variables for credentials
- Enable additional security features in Google Cloud Console

## 🔧 Troubleshooting

### Common Issues:

**"redirect_uri_mismatch" error:**

- Make sure the redirect URI in Google Console exactly matches your callback URL
- Check for trailing slashes
- Ensure protocol (http/https) matches

**"invalid_client" error:**

- Verify your Client ID and Secret are correct
- Check that they're properly set in `.env` file
- Restart your application after changing environment variables

**"access_denied" error:**

- User denied permission
- Check OAuth consent screen configuration
- Ensure required scopes are requested

### Test Your Setup:

```bash
# Check if environment variables are loaded
node -e "console.log(process.env.GOOGLE_CLIENT_ID ? '✅ Client ID loaded' : '❌ Client ID missing')"

# Test database connection
npm start
# Look for "✅ Database initialized successfully" in logs
```

## 📱 User Experience

Once configured, users will see:

- Google OAuth button on login/register pages
- One-click authentication
- Automatic account creation for new users
- Seamless login for existing Google users

## 🎯 Next Steps

After Google OAuth is working:

1. Consider adding GitHub OAuth for developers
2. Add profile photo display in dashboard
3. Implement OAuth account linking
4. Add email verification bypass for OAuth users

## 📋 Verification Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs properly set
- [ ] Environment variables configured
- [ ] Application restarts successfully
- [ ] OAuth buttons appear on login/register pages
- [ ] Google authentication flow works
- [ ] User session is properly created
- [ ] Dashboard displays user information
