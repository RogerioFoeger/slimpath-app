# 📧 Email Not Working? Quick Fix Guide

## 🚀 Run This First

```bash
cd SLIMPATH
node check-email-config.js
```

This will diagnose your email configuration automatically.

---

## ⚡ Top 5 Most Common Fixes

### 1️⃣ Check Spam Folder (50% of cases)

**Solution:**
- Open your email client
- Check **Spam/Junk** folder
- Look for emails from: `noreply@mail.app.supabase.io`
- Mark as "Not Spam"

---

### 2️⃣ Rate Limit Exceeded (30% of cases)

**Problem:** Supabase free tier = max 3-4 emails/hour

**Solution:**
- Wait 1 hour before testing again
- OR use different email: `test+1@gmail.com`, `test+2@gmail.com`
- OR manually confirm in Supabase Dashboard

**Check Rate Limit:**
1. Supabase Dashboard → Authentication → Settings
2. Scroll to "Rate Limits"
3. See current usage

**Manual Confirmation:**
1. Supabase Dashboard → Authentication → Users
2. Find your email
3. Click user → Click "Confirm Email" button

---

### 3️⃣ Email Confirmations Disabled (10% of cases)

**Check:**
1. Supabase Dashboard
2. Authentication → Settings
3. Email Auth section
4. **"Enable email confirmations"** must be **ON**

---

### 4️⃣ Missing Redirect URL (5% of cases)

**Fix:**
1. Supabase Dashboard → Authentication → Settings
2. Scroll to "URL Configuration"
3. Add these URLs:
   ```
   http://localhost:3000/**
   http://localhost:3000/onboarding
   https://slimpathai.com/**
   https://slimpathai.com/onboarding
   ```
4. Save

---

### 5️⃣ Supabase Project Paused (5% of cases)

**Check:**
1. Go to https://supabase.com/dashboard
2. Look at your project status
3. If it says "PAUSED" or "INACTIVE"
4. Click "Restore Project" or "Unpause"
5. Wait 2 minutes for it to activate

---

## 🧪 Quick Test

### Test if Signup Works

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
# Go to: http://localhost:3000/login

# 3. Sign up with test email
# Use: yourname+test1@gmail.com

# 4. Check email within 2 minutes
```

### Test if User Was Created

```bash
# Go to: Supabase Dashboard → Authentication → Users
# Look for your test email
# If it's there but "Not Confirmed", signup worked but email didn't arrive
```

---

## 🔧 Production Fix (No More Email Issues!)

### Set Up SendGrid SMTP (10 minutes)

**Why?**
- ✅ 100 emails/day FREE
- ✅ No rate limits
- ✅ Won't go to spam
- ✅ Professional sender email

**Setup:**

1. **Get SendGrid API Key**
   - Sign up: https://sendgrid.com
   - Settings → API Keys → Create API Key
   - Name: `SlimPath Email`
   - Permissions: Mail Send only
   - Copy key

2. **Configure Supabase**
   - Dashboard → Project Settings → Authentication
   - Scroll to "SMTP Settings"
   - Enable Custom SMTP:
     ```
     Host: smtp.sendgrid.net
     Port: 587
     Username: apikey
     Password: [Your SendGrid API Key]
     Sender: support@slimpathai.com
     Name: SlimPath AI
     ```
   - Save

3. **Test**
   - Try signing up again
   - Should receive email within seconds!

---

## 📋 Diagnostic Checklist

Before asking for help, check ALL these:

**Supabase Dashboard:**
- [ ] Project is **Active** (not paused)
- [ ] Authentication → Settings → Email Auth → **Enable email confirmations** is ON
- [ ] Authentication → Email Templates → "Confirm signup" exists
- [ ] Authentication → URL Configuration → Your app URL is added
- [ ] Not exceeding rate limit (check Auth Logs)

**Your Email:**
- [ ] Checked **spam/junk** folder
- [ ] Tried different email provider (Gmail, Outlook, Yahoo)
- [ ] Email client is not blocking automated emails

**Environment Variables:**
- [ ] `.env.local` exists
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is correct
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- [ ] `NEXT_PUBLIC_APP_URL` is correct
- [ ] Restarted dev server after changes

---

## 🆘 Still Not Working?

### Option 1: Disable Email Confirmation (Testing Only)

⚠️ **Only for local testing!**

1. Supabase Dashboard → Authentication → Settings
2. Email Auth section
3. Toggle OFF "Enable email confirmations"
4. Now signups work without email

**Remember to turn back ON for production!**

---

### Option 2: Use Magic Links Instead

Better deliverability than confirmation emails.

**In your code:** Change signup to use OTP

```typescript
// Instead of:
await supabase.auth.signUp({ email, password })

// Use:
await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/onboarding`,
  },
})
```

---

### Option 3: Get Help

**Run diagnostic first:**
```bash
node check-email-config.js
```

**Then check:**
1. Supabase Dashboard → Logs → Auth Logs
2. Browser Console (F12) for errors
3. Terminal logs when signup happens

**Documentation:**
- `EMAIL_SETUP_FIX.md` - Basic fixes
- `EMAIL_TROUBLESHOOTING_GUIDE.md` - Complete guide

**Support:**
- Supabase Discord: https://discord.supabase.com
- Supabase Support: Dashboard → Support

---

## 💡 Pro Tips

### For Testing:
- Use `+` trick: `test+1@gmail.com`, `test+2@gmail.com` (all go to same inbox)
- Wait 1 hour between test batches (rate limit)
- Check Supabase Auth Logs after each test
- Manually confirm users to bypass email

### For Production:
- **Always** use custom SMTP
- Verify your domain (prevents spam)
- Monitor email delivery in SMTP dashboard
- Set up proper SPF/DKIM DNS records

---

## ✅ Success Checklist

You know emails are working when:
- [ ] User signs up
- [ ] Email arrives within 1 minute
- [ ] Email is in inbox (not spam)
- [ ] Click link → redirects to /onboarding
- [ ] User can complete onboarding

---

**Most Common Solution:** Wait 1 hour (rate limit) or check spam folder! 🎉

