# 🔍 Complete Email Troubleshooting Guide

## Understanding Your Email Setup

Your SlimPath AI app has **TWO different signup flows**, and which one you're using matters:

### Flow 1: Direct Signup (Login Page)
- User visits `/login` page
- Enters email + password
- Clicks "Sign Up"
- **Supabase sends confirmation email**
- User clicks link → redirected to onboarding

### Flow 2: Webhook Signup (Payment Integration)
- User pays on Cartpanda/Kirvano
- Payment platform sends webhook to your app
- App creates user with `email_confirm: true` (pre-confirmed)
- **App sends magic link email** for first login
- User clicks link → redirected to onboarding

## 🚨 Most Common Issues & Fixes

### Issue #1: Supabase Email Rate Limit (Most Common)

**Symptom:** Not receiving emails after first few signups

**Cause:** Supabase free tier limits you to **3-4 emails per hour**

**Fix:**
1. Wait 1 hour before trying again
2. Use a different test email
3. Check Supabase Dashboard → Authentication → Users
4. If user exists but shows "Not Confirmed", the signup worked but email hit rate limit

**Check Your Rate Limit:**
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Rate Limits** section
4. See current usage

---

### Issue #2: Emails Going to Spam

**Symptom:** User signed up but didn't receive email

**Fix:**
1. **Check spam/junk folder** in your email
2. Look for sender: `noreply@mail.app.supabase.io`
3. Mark as "Not Spam"
4. Whitelist the sender for future emails

**Prevention:**
- Set up custom SMTP (see Solution below)
- Use a known SMTP provider like SendGrid

---

### Issue #3: Email Confirmations Disabled

**Symptom:** Can login immediately without confirmation

**Fix:**
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth** section
4. Ensure **"Enable email confirmations"** is **ON**
5. Save changes

---

### Issue #4: Email Template Missing/Broken

**Symptom:** No emails sent at all, even within rate limits

**Fix:**
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Click **"Confirm signup"**
4. Verify template contains: `{{ .ConfirmationURL }}`
5. Check subject line is not empty
6. Click **Save**

**Default Template Should Include:**
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

---

### Issue #5: Wrong Redirect URL

**Symptom:** Email arrives but clicking link shows error

**Check:**
1. In your `.env.local` file, verify:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   (For production: `https://slimpathai.com`)

2. In your code (`app/login/page.tsx` line 31):
   ```typescript
   emailRedirectTo: `${window.location.origin}/onboarding`
   ```

3. In Supabase Dashboard → **Authentication** → **URL Configuration**:
   - Add `http://localhost:3000/**` to **Redirect URLs**
   - Add `https://slimpathai.com/**` for production

---

### Issue #6: Webhook Email Not Sending

**Symptom:** Webhook signup works but no magic link received

**Location:** `app/api/webhook/route.ts` lines 102-111

**Debug Steps:**

1. Check if magic link code is running:
   - Look at your terminal logs when webhook fires
   - Should see "Magic link error:" if it failed

2. Check if `NEXT_PUBLIC_APP_URL` is set:
   ```bash
   echo $NEXT_PUBLIC_APP_URL
   ```

3. Verify Supabase is allowing OTP emails:
   - Dashboard → **Authentication** → **Settings**
   - **Enable email OTP** should be **ON**

**Test the Webhook Manually:**
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_WEBHOOK_SECRET" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "profile_type": "hormonal",
    "subscription_plan": "monthly",
    "transaction_id": "test123",
    "amount": 37
  }'
```

---

## ✅ Step-by-Step Diagnostic Process

### Step 1: Verify Email Settings in Supabase

```bash
# Go to: https://supabase.com/dashboard
# Your Project → Authentication → Settings
```

Check these settings:
- ✅ Enable email confirmations: **ON**
- ✅ Enable email OTP: **ON**  
- ✅ Secure email change: **ON**
- ✅ Minimum password length: 6

### Step 2: Check Email Templates

```bash
# Go to: Authentication → Email Templates
```

Verify templates exist for:
- ✅ Confirm signup
- ✅ Magic Link
- ✅ Change Email Address
- ✅ Reset Password

### Step 3: Check Redirect URLs

```bash
# Go to: Authentication → URL Configuration
```

Add these URLs:
```
http://localhost:3000/**
http://localhost:3000/onboarding
https://slimpathai.com/**
https://slimpathai.com/onboarding
```

### Step 4: Test Email Sending

**Test 1: Simple Signup**
1. Go to `http://localhost:3000/login`
2. Click "Don't have an account? Sign up"
3. Enter email: `test+1@yourdomain.com`
4. Enter password
5. Click "Sign Up"
6. Check for email

**Test 2: Check Logs**
1. Go to Supabase Dashboard
2. Navigate to **Logs** → **Auth Logs**
3. Look for signup event
4. Check for any errors

**Test 3: Check User Created**
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Look for your test email
4. Status should show "Waiting for confirmation"

### Step 5: Manual Confirmation (If Needed)

If user exists but email never arrived:

1. Go to **Authentication** → **Users**
2. Click on the user
3. Click **"Confirm Email"** button manually
4. User can now login

---

## 🚀 Production-Ready Email Setup

### Option A: Custom SMTP with SendGrid (Recommended)

**Why SendGrid?**
- ✅ 100 emails/day free
- ✅ No spam issues
- ✅ Custom sender email
- ✅ Detailed analytics

**Setup (10 minutes):**

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up for free account
   - Verify your email

2. **Generate API Key**
   - Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Name: `SlimPath Email`
   - Permissions: **Restricted Access** → Enable only **Mail Send**
   - Copy the key (shown only once!)

3. **Configure in Supabase**
   - Supabase Dashboard → **Project Settings** → **Authentication**
   - Scroll to **SMTP Settings**
   - Click **Enable Custom SMTP**
   - Fill in:
     ```
     Host: smtp.sendgrid.net
     Port: 587
     Username: apikey
     Password: [Your SendGrid API Key]
     Sender email: support@slimpathai.com
     Sender name: SlimPath AI
     ```
   - Click **Save**

4. **Verify Domain (Optional but Recommended)**
   - SendGrid → Settings → Sender Authentication
   - Click "Authenticate Your Domain"
   - Follow DNS setup instructions
   - This prevents spam flagging

5. **Test Sending**
   - Try signing up again
   - Check SendGrid → Activity
   - Should see email sent successfully

---

### Option B: Custom SMTP with Resend (Modern Alternative)

**Why Resend?**
- ✅ 3,000 emails/month free
- ✅ Simple setup
- ✅ Great for developers
- ✅ Beautiful dashboard

**Setup:**

1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. In Supabase SMTP Settings:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Your Resend API Key]
   Sender email: noreply@yourdomain.com
   Sender name: SlimPath AI
   ```

---

### Option C: Gmail SMTP (Quick Test Only)

⚠️ **Not recommended for production**

1. Enable 2-Factor Authentication in Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. In Supabase SMTP Settings:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: [16-character app password]
   Sender email: your-email@gmail.com
   Sender name: SlimPath AI
   ```

**Limitations:**
- Max 500 emails/day
- Gmail branding in emails
- May get blocked if too many signups

---

## 🧪 Testing Commands

### Test 1: Check Supabase Connection
```javascript
// Open browser console on your app (F12)
// Run this:
const { data, error } = await window.supabase.auth.getSession()
console.log('Session:', data, error)
```

### Test 2: Test Email Template
```sql
-- Run in Supabase SQL Editor
SELECT * FROM auth.users 
WHERE email = 'your-test-email@example.com';
```

### Test 3: Check Rate Limits
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) as email_count 
FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour'
AND action = 'signup';
```

### Test 4: Manual Email Trigger
```javascript
// In browser console on your app
const { error } = await window.supabase.auth.signInWithOtp({
  email: 'test@example.com',
  options: {
    emailRedirectTo: window.location.origin + '/onboarding'
  }
})
console.log('OTP result:', error)
```

---

## 📋 Quick Checklist

Before asking for help, verify ALL of these:

**Supabase Settings:**
- [ ] Project is ACTIVE (not paused)
- [ ] Email confirmations: **ON**
- [ ] Email OTP: **ON**
- [ ] Email templates exist and are valid
- [ ] Redirect URLs configured
- [ ] Rate limit not exceeded (< 4 emails/hour)

**Environment Variables:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is correct
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- [ ] `NEXT_PUBLIC_APP_URL` is correct
- [ ] Dev server restarted after `.env.local` changes

**Email Client:**
- [ ] Checked spam/junk folder
- [ ] Tried different email providers (Gmail, Outlook, etc.)
- [ ] Whitelisted `@supabase.io` or your SMTP domain

**Code:**
- [ ] `emailRedirectTo` includes `/onboarding`
- [ ] No errors in browser console (F12)
- [ ] No errors in terminal logs

---

## 🆘 Still Not Working?

### Get Detailed Error Information

1. **Check Supabase Logs:**
   ```
   Dashboard → Logs → Auth Logs
   ```
   Look for errors related to your email

2. **Check Browser Network Tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try signing up
   - Look for failed requests (red)
   - Check response for error messages

3. **Check Terminal Logs:**
   - Look for any errors when signup happens
   - Especially for webhook signups

4. **Enable Supabase Debug Mode:**
   ```typescript
   // In lib/supabase/client.ts, temporarily add:
   const supabase = createClient(url, key, {
     auth: {
       debug: true
     }
   })
   ```

### Common Error Messages & Solutions

**Error:** "Email rate limit exceeded"
- **Solution:** Wait 1 hour or upgrade Supabase plan

**Error:** "Invalid email redirect URL"
- **Solution:** Add URL to Supabase Auth → URL Configuration

**Error:** "SMTP authentication failed"
- **Solution:** Check SMTP username/password in Supabase settings

**Error:** "Template rendering failed"
- **Solution:** Check email template has required variables

**Error:** "Failed to send email"
- **Solution:** Check Supabase project is active and email service is working

---

## 💡 Best Practices

### For Development:
1. **Disable email confirmation** temporarily to speed up testing
2. Use `+` trick for multiple test emails: `test+1@gmail.com`, `test+2@gmail.com`
3. Keep Supabase Auth Logs open while testing
4. Use different email providers to test deliverability

### For Production:
1. **Always use custom SMTP** (SendGrid/Resend)
2. **Verify your domain** to prevent spam filtering
3. **Enable email confirmations** for security
4. **Monitor email delivery** in SMTP provider dashboard
5. **Set up proper SPF/DKIM records**
6. **Use branded sender email** (support@slimpathai.com)

### For Better Deliverability:
1. Use custom domain email (not gmail.com)
2. Warm up your sender email (start with few emails/day)
3. Avoid spam trigger words in templates
4. Include unsubscribe link (for marketing emails)
5. Keep email content simple and text-heavy
6. Test emails with https://mail-tester.com/

---

## 📞 Get Help

If you've tried everything and still have issues:

1. **Check Supabase Status:** https://status.supabase.com/
2. **Supabase Discord:** https://discord.supabase.com/
3. **SendGrid Support:** https://support.sendgrid.com/
4. **Check GitHub Issues:** Search for similar problems

**When asking for help, include:**
- Which signup method (login page or webhook)
- Email provider (Gmail, Outlook, etc.)
- Supabase Auth Log errors
- Browser console errors
- Whether user appears in Auth → Users
- Whether emails went to spam
- Your Supabase plan (free/pro)


