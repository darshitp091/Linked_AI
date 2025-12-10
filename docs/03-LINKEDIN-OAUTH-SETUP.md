# LinkedIn OAuth Setup Guide

## 1. Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **Create app**
3. Fill in details:
   - **App name**: LinkedAI (or your app name)
   - **LinkedIn Page**: Your company page
   - **App logo**: Upload logo (1000x1000px recommended)
   - **Legal agreement**: Check box
4. Click **Create app**

## 2. Get OAuth Credentials

1. Go to **Auth** tab
2. Copy:
   - **Client ID** → `LINKEDIN_CLIENT_ID`
   - **Client Secret** → `LINKEDIN_CLIENT_SECRET`

## 3. Configure Redirect URLs

### Development
```
http://localhost:3000/api/auth/callback/linkedin
```

### Production
```
https://yourdomain.com/api/auth/callback/linkedin
```

**Add both URLs** in **Auth** → **Redirect URLs**

## 4. Request API Access

### Required Products

Go to **Products** tab and request access to:

1. **Sign In with LinkedIn using OpenID Connect** ✅ (Instant)
2. **Share on LinkedIn** ✅ (Instant)
3. **Advertising API** (Optional - requires review)
4. **Marketing Developer Platform** (Optional - for analytics)

### Required Scopes

In **Auth** → **OAuth 2.0 scopes**, enable:

**Core Scopes** (Available immediately):
- `openid` - Basic authentication
- `profile` - User profile data
- `email` - User email address
- `w_member_social` - Post on behalf of user

**Analytics Scopes** (May require approval):
- `r_organization_social` - Read organization analytics
- `rw_organization_admin` - Manage organization
- `r_basicprofile` - Read basic profile

## 5. Verify Setup

### Test OAuth Flow

1. Start your app: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click **Continue with LinkedIn**
4. You should be redirected to LinkedIn
5. Authorize the app
6. Should redirect back to `/dashboard`

### Check Environment Variables

```bash
# .env.local
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 6. Handle Multiple LinkedIn Accounts

Our app supports multiple LinkedIn accounts per user:

### Add New Account
1. Go to **Settings** → **LinkedIn Accounts**
2. Click **Connect LinkedIn Account**
3. Authorize new account
4. Account added to list

### Switch Accounts
- Use account selector in post creation
- Each post can be published to specific account

## 7. Token Management

### Access Token
- **Expires**: 60 days
- **Stored**: Encrypted in database
- **Auto-refresh**: Yes (when posting)

### Refresh Token
- **Stored**: Encrypted in `profiles` table
- **Used**: When access token expires

## 8. Common Issues

### Error: "redirect_uri_mismatch"
**Fix**:
- Check redirect URL matches exactly in LinkedIn app settings
- No trailing slashes
- Use correct protocol (http vs https)

### Error: "invalid_client"
**Fix**:
- Verify Client ID and Secret are correct
- No extra spaces in .env file
- Restart dev server after changing .env

### Error: "insufficient_permissions"
**Fix**:
- Request required products in LinkedIn app
- Wait for approval (usually instant for basic products)
- Check scopes are enabled

### Tokens Expired
**Fix**:
- Users will be prompted to reconnect
- Click "Reconnect" in Settings → LinkedIn Accounts

## 9. Production Checklist

Before going live:

- [ ] Update redirect URLs to production domain
- [ ] Request necessary LinkedIn products
- [ ] Test OAuth flow on production
- [ ] Verify token refresh works
- [ ] Set up error monitoring for OAuth failures

## 10. Rate Limits

LinkedIn API limits:
- **Read operations**: 500 requests/day (per user)
- **Write operations** (posts): 100 requests/day (per user)
- **Organization posts**: 25 requests/day

Our app handles this by:
- Caching user data
- Rate limiting post creation
- Queueing scheduled posts
