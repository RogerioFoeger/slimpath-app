# Magic Link Redirect Fix

## Problem
When clicking on the Magic Link in invitation emails, users were being redirected to `localhost` instead of the production domain.

## Root Cause
1. **Code Issue**: The webhook was using a fallback URL that might not match the production domain
2. **Supabase Configuration**: Supabase's Site URL setting in the dashboard can override the `emailRedirectTo` parameter, even if set correctly in code

## Fix Applied ✅

### Code Changes
Updated `SLIMPATH/app/api/webhook/route.ts` to:
- Prioritize `NEXT_PUBLIC_APP_URL` environment variable
- Auto-detect the correct URL from request headers (for preview deployments)
- Fallback to production domain (`https://slimpathaiapp.vercel.app`) instead of localhost
- Added logging to track which redirect URL is being used

## Required Actions ⚠️

### 1. Configure Supabase Dashboard (CRITICAL)

The Supabase Site URL setting **overrides** the `emailRedirectTo` parameter. You MUST update this:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Set **Site URL** to your production domain:
   ```
   https://slimpathaiapp.vercel.app
   ```
5. Add to **Redirect URLs** (click "Add URL"):
   ```
   https://slimpathaiapp.vercel.app/**
   ```
   ```
   https://slimpathaiapp.vercel.app/onboarding
   ```
   ```
   http://localhost:3000/**  (for local development)
   ```
6. Click **Save**

**Important**: Without this step, magic links will continue redirecting to localhost even after the code fix!

### 2. Verify Environment Variable (Optional but Recommended)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify or add:
   ```
   NEXT_PUBLIC_APP_URL=https://slimpathaiapp.vercel.app
   ```
5. If you add/change it, redeploy the app

### 3. Deploy the Code Fix

```bash
cd SLIMPATH
git add app/api/webhook/route.ts
git commit -m "Fix: Magic link redirect to use production URL instead of localhost"
git push
```

## Testing

1. **Create a test account**:
   - Visit `https://slimpathaiapp.vercel.app/test-signup`
   - Create a test account with a real email
   - Check your email for the magic link

2. **Click the magic link**:
   - Click "Login" in the email
   - **Verify**: Should redirect to `https://slimpathaiapp.vercel.app/onboarding`
   - **Should NOT** redirect to `http://localhost:3000`

3. **Check logs** (optional):
   - Go to Vercel → Deployments → View Function Logs
   - Look for: `Using base URL for redirects: https://slimpathaiapp.vercel.app`
   - Look for: `Sending magic link to [email] with redirect to https://slimpathaiapp.vercel.app/onboarding`

## How It Works

The webhook now:
1. First checks `NEXT_PUBLIC_APP_URL` environment variable
2. If not set, detects URL from request headers (for preview deployments)
3. Falls back to production domain (`https://slimpathaiapp.vercel.app`)
4. **Never** uses localhost as a fallback

However, Supabase will only redirect to URLs that are:
- Set as the Site URL, OR
- Added to the Redirect URLs whitelist

That's why updating the Supabase dashboard is critical!

## Troubleshooting

### Still redirecting to localhost?

1. **Check Supabase Site URL**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Make sure Site URL is set to your production domain
   - Make sure your production domain is in Redirect URLs

2. **Check environment variable**:
   - Verify `NEXT_PUBLIC_APP_URL` is set in Vercel
   - Redeploy after setting/changing it

3. **Check logs**:
   - Look at Vercel function logs to see what URL is being used
   - Should show: `Using base URL for redirects: https://slimpathaiapp.vercel.app`

4. **Clear browser cache**:
   - Sometimes old redirect URLs are cached

### Magic link not working at all?

- Check spam folder
- Verify email is confirmed in Supabase (users table)
- Check Supabase email logs in dashboard

## Summary

✅ **Code Fixed**: Webhook now uses correct production URL  
⏳ **Action Required**: Update Supabase Site URL and Redirect URLs  
⏳ **Action Required**: Deploy code changes  
⏳ **Action Required**: Test with real email

---

**Status**: Code Fixed ✅ | Supabase Config Required ⏳ | Testing Required ⏳

