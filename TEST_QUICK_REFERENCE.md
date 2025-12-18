# 🚀 Quick Test Reference Card

## ⚡ Get Started in 3 Steps

### 1. Set Environment Variables

Create `.env.local` in SLIMPATH directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_SECRET=test-secret-123
NEXT_PUBLIC_WEBHOOK_SECRET=test-secret-123
```

### 2. Start Server

```bash
cd SLIMPATH
npm run dev
```

### 3. Test Signup

Go to: **http://localhost:3000/test-signup**

---

## 📋 Test URLs

| Page | URL |
|------|-----|
| **Test Signup** | `http://localhost:3000/test-signup` |
| **Login** | `http://localhost:3000/login` |
| **Onboarding** | `http://localhost:3000/onboarding` |
| **Dashboard** | `http://localhost:3000/dashboard` |
| **Admin** | `http://localhost:3000/admin` |

---

## 🧪 Test User Creation

**Form Fields:**
- **Email:** Use real email (for magic link)
- **Name:** Any name
- **Type:** Choose from 6 metabolism types
- **Plan:** Monthly or Annual

**Example:**
```
Email: test@example.com
Name: Test User
Type: Cortisol Type
Plan: Monthly
```

---

## ✅ Expected Flow

1. **Fill form** → Click "Create Free Test Account"
2. **Success** → See user ID and success message
3. **Check email** → Look for magic link from Supabase
4. **Click link** → Redirected to onboarding
5. **Complete onboarding** → 7 steps
6. **Access dashboard** → See personalized content

---

## 🎯 6 Metabolism Types to Test

1. **Cortisol Type** - Stress-related weight
2. **Hormonal Type** - Hormone imbalance
3. **Inflammatory Type** - Inflammation issues
4. **Metabolic Type** - Slow metabolism
5. **Retention Type** - Water retention
6. **Insulinic Type** - Insulin resistance

---

## 🐛 Quick Fixes

### "Webhook secret mismatch"
```bash
# Make sure .env.local has both:
WEBHOOK_SECRET=test-secret-123
NEXT_PUBLIC_WEBHOOK_SECRET=test-secret-123

# Then restart:
npm run dev
```

### "No email received"
- Check spam folder
- Check Supabase logs
- Use manual SQL creation (see TESTING_GUIDE.md)

### "Page not found"
```bash
# Restart dev server:
npm run dev

# Clear Next.js cache:
rm -rf .next
npm run dev
```

### "No data on dashboard"
```sql
-- Run in Supabase SQL Editor:
-- Copy contents from supabase/seed.sql
```

---

## 🔍 Verify in Supabase

**Check created users:**

```sql
SELECT email, profile_type, subscription_plan, status 
FROM users 
ORDER BY created_at DESC;
```

**Check onboarding:**

```sql
SELECT u.email, uo.onboarding_completed
FROM user_onboarding uo
JOIN users u ON u.id = uo.user_id;
```

---

## 📊 What Gets Created

For each test signup:

✅ Auth user in `auth.users`  
✅ Profile in `users` table  
✅ Onboarding record in `user_onboarding`  
✅ Magic link email sent  
✅ Subscription with 30-day or 365-day access  
✅ Status set to `active`  

---

## 💰 Cost: $0

**No payment required!**
- No credit card needed
- No Stripe test cards
- Completely free testing
- Full app access

---

## 🔒 Before Production

**Delete test page:**
```bash
rm SLIMPATH/app/test-signup/page.tsx
```

**Or protect it:**
- Add authentication
- Use strong webhook secret
- Whitelist IPs

---

## 📚 Full Documentation

- **Complete testing guide:** `TESTING_GUIDE.md`
- **Setup instructions:** `QUICK_START.md`
- **Deployment:** `DEPLOYMENT_CHECKLIST.md`

---

## 🎉 Success!

Once working, you'll be able to:
- Create unlimited test users
- Test all 6 metabolism types
- Complete full onboarding
- Use dashboard features
- Verify entire app flow

**No payment processor needed for testing! 🚀**

