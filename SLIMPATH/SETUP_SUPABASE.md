# 🚀 Fix Supabase Connection - Step by Step

## The Problem
Your app is trying to connect to a Supabase project that doesn't exist or is paused.

## The Solution (10 minutes)

### Step 1: Create New Supabase Project (3 minutes)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in with your account
3. Click **"New Project"**
4. Fill in:
   - **Name:** `slimpath-ai`
   - **Database Password:** (Generate a strong password - SAVE THIS!)
   - **Region:** (Choose closest to your location)
5. Click **"Create new project"**
6. ⏳ Wait ~2 minutes for project creation

### Step 2: Get Your API Credentials (2 minutes)

1. Once project is ready, go to **Settings** (gear icon in left sidebar)
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL** (starts with `https://`)
   - **Project API keys:**
     - `anon` `public` key (copy this)
     - `service_role` key (copy this - keep it secret!)

### Step 3: Update Your .env.local File (2 minutes)

1. Open `.env.local` in your SLIMPATH folder
2. Replace the first 3 lines with your NEW credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Keep the rest of your .env.local as is (VAPID keys, etc.)
```

3. **Save the file**

### Step 4: Set Up Database Schema (3 minutes)

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `SLIMPATH/supabase/schema.sql` in your code editor
4. **Copy ALL** the contents (Ctrl+A, Ctrl+C)
5. **Paste** into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. ✅ You should see: **"Success. No rows returned"**

### Step 5: Restart Your Dev Server

1. In your terminal, press `Ctrl+C` to stop the server
2. Run: `npm run dev`
3. Go to `http://localhost:3000/login`
4. Try signing up again! 🎉

---

## Quick Verification Checklist

Before trying again, verify:

- [ ] New Supabase project is **Active** (not paused)
- [ ] `.env.local` has **new URL and keys**
- [ ] Database schema is **successfully run** (SQL Editor)
- [ ] Dev server is **restarted**

---

## Still Having Issues?

### Check These Common Mistakes:

1. **Missing `NEXT_PUBLIC_` prefix**
   - ❌ `SUPABASE_URL=...`
   - ✅ `NEXT_PUBLIC_SUPABASE_URL=...`

2. **Keys have spaces or line breaks**
   - Make sure each key is on ONE line
   - No spaces before or after the `=`

3. **Using the wrong key**
   - Use `anon` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Use `service_role` key for `SUPABASE_SERVICE_ROLE_KEY`

4. **Old environment variables cached**
   - Fully stop your dev server (Ctrl+C)
   - Close your browser
   - Start fresh: `npm run dev`

### Test Your Connection

Run this in your browser console (F12):

```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

If it shows `undefined`, your `.env.local` isn't being loaded properly.

---

## Need More Help?

1. Check that your Supabase project status is "Active" in the dashboard
2. Verify your internet connection can reach supabase.co
3. Try disabling VPN/firewall temporarily
4. Make sure you're using the correct project credentials

---

**After following these steps, your authentication should work!** 🚀


