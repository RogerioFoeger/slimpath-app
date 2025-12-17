# 📧 Fix: Not Receiving Email Confirmations

## The Problem
You're not receiving confirmation/invitation emails after signing up because:
1. **Supabase default email service is limited** (3-4 emails/hour in free tier)
2. **Emails may be going to spam**
3. **Custom SMTP may not be configured**
4. **Email confirmations might be disabled**

---

## ✅ Solution 1: Check Supabase Email Settings (2 minutes)

### Step 1: Enable Email Confirmations

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Settings** (left sidebar)
4. Scroll to **Email Auth** section
5. Verify these settings:

   - ✅ **Enable email confirmations** should be **ON**
   - ✅ **Enable email change confirmations** should be **ON** 
   - ✅ **Secure email change** should be **ON**

### Step 2: Check Email Templates

1. Still in **Authentication** → **Settings**
2. Scroll to **Email Templates** section
3. Click **Confirm signup** template
4. Verify:
   - Template exists and is enabled
   - `{{ .ConfirmationURL }}` is present in the template
   - Subject line is not empty

### Step 3: Check Email Rate Limits

1. In **Authentication** → **Settings**
2. Scroll to **Rate Limits** section
3. **Free tier limitation**: Only **3-4 emails per hour**
4. If you've been testing multiple times, you may have hit the limit
5. **Wait 1 hour** and try again with a different email

---

## ✅ Solution 2: Check Your Spam Folder

Supabase's default email service often gets flagged as spam:

1. Check your **Spam/Junk** folder
2. Look for emails from:
   - `noreply@mail.app.supabase.io`
   - Your project name
3. If found, mark as "Not Spam" for future emails

---

## ✅ Solution 3: Configure Custom SMTP (Recommended for Production)

### Why Use Custom SMTP?
- ✅ No rate limits
- ✅ Better deliverability 
- ✅ Branded sender email
- ✅ Won't go to spam

### Recommended Free SMTP Providers:
- **SendGrid** - 100 emails/day free
- **Mailgun** - 5,000 emails/month free
- **Resend** - 3,000 emails/month free
- **Gmail SMTP** - Free, but not recommended for production

### How to Set Up Custom SMTP (Example: SendGrid)

#### Step 1: Get SendGrid API Key (5 minutes)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it: `SlimPath Email`
5. Choose **Restricted Access**
6. Enable only **Mail Send** permission
7. Copy the API key (you'll only see it once!)

#### Step 2: Configure in Supabase (2 minutes)

1. Go to Supabase Dashboard
2. Navigate to **Project Settings** → **Authentication**
3. Scroll to **SMTP Settings**
4. Click **Enable Custom SMTP**
5. Fill in:

```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API Key]
Sender email: noreply@yourdomain.com
Sender name: SlimPath AI
```

6. Click **Save**

#### Step 3: Verify Domain (Optional but Recommended)

For production, verify your domain:
1. In SendGrid, go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS configuration steps
4. This prevents emails from going to spam

---

## ✅ Solution 4: Disable Email Confirmation (For Testing Only)

⚠️ **WARNING**: Only use this for local testing, NEVER in production!

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth**
4. Toggle OFF **Enable email confirmations**
5. Save changes

Now users can sign up without email confirmation.

**Remember to turn this back ON for production!**

---

## ✅ Solution 5: Use Magic Link Instead of Password

Magic links have better deliverability than confirmation emails.

Update your login page to use magic links:

```typescript
// In app/login/page.tsx, replace signUp with:
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/onboarding`,
  },
})

if (error) throw error
toast.success('Check your email for a magic link!')
```

---

## 🧪 Testing Your Email Setup

### Test 1: Check Supabase Logs

1. Go to **Logs** → **Auth Logs** in Supabase Dashboard
2. Look for recent signup events
3. Check for any email-related errors

### Test 2: Use a Different Email Provider

Try signing up with emails from different providers:
- ✅ Gmail
- ✅ Outlook/Hotmail
- ✅ Yahoo
- ⚠️ Some work emails block external emails

### Test 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try signing up
4. Look for any errors related to signup

---

## 📊 Verification Checklist

Before asking for help, verify:

- [ ] Email confirmations are **enabled** in Supabase
- [ ] Checked **spam/junk** folder
- [ ] Waited **1 hour** (if testing multiple times due to rate limits)
- [ ] Tried **different email addresses**
- [ ] Checked **Supabase Auth Logs** for errors
- [ ] Email template exists and has `{{ .ConfirmationURL }}`
- [ ] Not hitting rate limits (max 3-4 emails/hour on free tier)

---

## 🚀 Quick Test Command

To test if a user was created (even without email):

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Look for your email in the list
3. If it's there but shows "Not Confirmed", the signup worked but email wasn't delivered

You can manually confirm a user:
1. Click on the user in the list
2. Click **Confirm Email** button

---

## 🆘 Still Not Working?

### Check These Common Issues:

1. **Environment Variables Wrong**
   - Verify `.env.local` has correct Supabase URL and keys
   - Restart dev server after changing env vars

2. **Multiple Signups Too Fast**
   - Supabase rate limits: 3-4 emails/hour
   - Wait 1 hour between test signups

3. **Email Provider Blocking**
   - Some email providers (especially corporate) block automated emails
   - Try a personal Gmail/Outlook account

4. **Confirmation URL Wrong**
   - Check that `NEXT_PUBLIC_APP_URL` in `.env.local` is correct
   - Should be `http://localhost:3000` for local dev

5. **Database Trigger Conflict**
   - You have both `handle_new_user()` trigger AND webhook
   - If using webhook, the trigger might be conflicting
   - See `supabase/fix_webhook_conflict.sql`

---

## 📋 Recommended Production Setup

For production deployment:

1. ✅ Use **custom SMTP** (SendGrid/Mailgun)
2. ✅ **Verify your domain** 
3. ✅ Keep **email confirmations enabled**
4. ✅ Set up **SPF and DKIM** records
5. ✅ Monitor email delivery in your SMTP provider dashboard

---

## Need More Help?

If you're still not receiving emails, provide:
1. Which signup method you're using (login page or webhook)
2. Email provider (Gmail, Outlook, etc.)
3. Any errors in browser console
4. Any errors in Supabase Auth Logs
5. Whether user appears in Supabase Authentication → Users


