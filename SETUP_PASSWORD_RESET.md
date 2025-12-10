# Password Reset Setup - IMPORTANT

## The Issue You're Experiencing

When you click the reset link from email, it redirects to login instead of the password reset page. This is because Supabase needs to be configured with the correct redirect URL.

## Quick Fix - Follow These Steps:

### Step 1: Go to Supabase Dashboard
Open: https://zrexjqogbamkhtclboew.supabase.co/project/_/auth/url-configuration

### Step 2: Add Redirect URL
In the **"Redirect URLs"** section, add this URL:

```
https://www.linkedai.site/auth/callback**
```

**IMPORTANT:** The `**` at the end is crucial! It allows the callback to work with query parameters.

Click **"Save"** after adding the URL.

### Step 3: Verify Site URL
Make sure the **Site URL** is set to:
```
https://www.linkedai.site
```

### Step 4: Test Again
1. Go to https://www.linkedai.site/forgot-password
2. Enter your email and click "Send reset link"
3. Check your email
4. Click the reset link
5. You should now be redirected to the password reset page ✅

## How It Works Now

### Flow:
1. User clicks reset link in email
2. Link goes to: `http://localhost:3000/auth/callback?type=recovery&code=xxxxx`
3. Callback route processes the code
4. Detects `type=recovery` parameter
5. Redirects to `/reset-password` page
6. User can now set new password

## Files Created/Updated

1. **`/src/app/auth/callback/route.ts`** (NEW)
   - Handles auth callbacks from Supabase
   - Exchanges code for session
   - Detects password recovery flow
   - Redirects to appropriate page

2. **`/src/app/(auth)/forgot-password/page.tsx`** (UPDATED)
   - Changed redirect URL to use auth callback
   - Now uses: `/auth/callback?type=recovery`

## Production Setup

When you deploy to production, add these URLs in Supabase:

1. Production Site URL:
   ```
   https://yourdomain.com
   ```

2. Production Redirect URLs:
   ```
   https://yourdomain.com/auth/callback**
   https://yourdomain.com/reset-password
   ```

## Common Issues

### Still redirecting to login?
- Wait 1-2 minutes after saving Supabase settings
- Clear browser cache
- Try in incognito/private window
- Check that redirect URL includes `**` at the end

### "Invalid redirect URL" error?
- Make sure you added the URL to Supabase redirect URLs
- Check for typos in the URL
- Ensure `**` is at the end

### Token expired?
- Reset link expires after 1 hour
- Request a new reset link

## Testing Checklist

- [ ] Added `http://localhost:3000/auth/callback**` to Supabase redirect URLs
- [ ] Saved the settings in Supabase
- [ ] Waited 1-2 minutes for changes to propagate
- [ ] Requested new password reset email (old links won't work)
- [ ] Clicked the new reset link
- [ ] Successfully reached reset password page
- [ ] Changed password successfully
- [ ] Logged in with new password

## Need Help?

If you're still having issues:
1. Check Supabase logs: https://zrexjqogbamkhtclboew.supabase.co/project/_/logs/explorer
2. Look for authentication errors
3. Verify the redirect URL is exactly: `http://localhost:3000/auth/callback**`
4. Make sure you're using a NEW reset link (request a new one after configuration)
