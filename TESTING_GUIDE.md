# 🧪 Testing Guide - Free Testing Without Payment

This guide shows you how to test SlimPath AI **completely free** without any credit cards or real payments.

## ✅ Why This Works

Instead of going through Cartpanda/Kirvano payment processing, you'll use a **test signup page** that directly creates a user account with $0 payment, letting you verify the entire app flow.

---

## 🚀 Quick Test Setup (5 Minutes)

### Step 1: Set Up Environment Variables

Create or edit `.env.local` in the `SLIMPATH` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Webhook Secret (for testing)
WEBHOOK_SECRET=test-secret-123
NEXT_PUBLIC_WEBHOOK_SECRET=test-secret-123

# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:support@slimpathai.com
```

**Don't have Supabase set up yet?** See `QUICK_START.md` for setup instructions.

### Step 2: Start the Development Server

```bash
cd SLIMPATH
npm run dev
```

Server will start at `http://localhost:3000`

### Step 3: Access the Test Signup Page

Open your browser and go to:

```
http://localhost:3000/test-signup
```

---

## 📋 Complete Testing Flow

### Test 1: Create Free Test Account

1. **Navigate to:** `http://localhost:3000/test-signup`

2. **Fill in the form:**
   - **Email:** Use a real email you have access to (you'll receive a magic link)
   - **Name:** Any name (e.g., "Test User")
   - **Metabolism Type:** Choose any (e.g., "Cortisol Type")
   - **Subscription Plan:** Choose any (Monthly or Annual)

3. **Click:** "Create Free Test Account"

4. **Expected Result:**
   - ✅ Success message appears
   - ✅ User ID is displayed
   - ✅ Email is sent with magic link

5. **Check Your Email:**
   - Look for email from Supabase
   - Subject: "Magic Link - SlimPath AI"
   - Click the link in the email

### Test 2: Complete Onboarding

1. **After clicking the magic link**, you'll be redirected to `/onboarding`

2. **Complete all 7 steps:**
   - Step 1: Welcome screen
   - Step 2: Biometrics (height, weight, age)
   - Step 3: Health Radar (symptoms)
   - Step 4: Nutrition Filter (dietary restrictions)
   - Step 5: Diet History
   - Step 6: Processing animation
   - Step 7: Welcome to SlimPath

3. **Expected Result:**
   - ✅ Can navigate through all steps
   - ✅ Data saves correctly
   - ✅ Redirected to dashboard

### Test 3: Use the Dashboard

1. **Access:** `http://localhost:3000/dashboard`

2. **Test features:**

   **Daily Checklist:**
   - ✅ See tasks for current day
   - ✅ Check off tasks
   - ✅ SlimPoints increase when completing tasks

   **Mood Check-in:**
   - ✅ Select mood emoji
   - ✅ Submit mood
   - ✅ See success message

   **Lean Trainer:**
   - ✅ See daily message from Lean
   - ✅ See micro-challenge
   - ✅ View progress tracking

   **Nutrition Module:**
   - ✅ See star food of the day
   - ✅ View allowed foods
   - ✅ See personalized tips

   **Panic Button:**
   - ✅ Click button
   - ✅ See motivational message
   - ✅ Modal appears correctly

---

## 🎯 Testing Different User Types

You can test all 6 metabolism types:

### Create Multiple Test Users

Use the test signup page multiple times with different emails:

1. **Cortisol Type**
   - Email: `test-cortisol@example.com`
   - Type: Cortisol

2. **Hormonal Type**
   - Email: `test-hormonal@example.com`
   - Type: Hormonal

3. **Inflammatory Type**
   - Email: `test-inflammatory@example.com`
   - Type: Inflammatory

4. **Metabolic Type**
   - Email: `test-metabolic@example.com`
   - Type: Metabolic

5. **Retention Type**
   - Email: `test-retention@example.com`
   - Type: Retention

6. **Insulinic Type**
   - Email: `test-insulinic@example.com`
   - Type: Insulinic

Each type will receive personalized content based on their metabolism type.

---

## 🔧 Advanced Testing

### Test Subscription Plans

Create users with different plans to test plan-specific features:

**Monthly Plan ($37/mo):**
```
Email: test-monthly@example.com
Plan: Monthly
```

**Annual Plan ($297/yr):**
```
Email: test-annual@example.com
Plan: Annual
```

### Check Database Directly

View created users in Supabase:

1. Go to Supabase Dashboard
2. Navigate to: **Table Editor → users**
3. You should see your test users with:
   - Email
   - Profile type
   - Subscription plan
   - Status: `active`
   - Subscription end date (30 days or 365 days from now)

### Test Email Verification

The test signup automatically confirms email, so you can login immediately.

**Manual check:**
```sql
-- In Supabase SQL Editor:
SELECT 
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email LIKE 'test-%';
```

---

## 🐛 Troubleshooting

### Issue: "Webhook secret mismatch"

**Solution:**
Make sure both env variables are set in `.env.local`:

```env
WEBHOOK_SECRET=test-secret-123
NEXT_PUBLIC_WEBHOOK_SECRET=test-secret-123
```

Then restart the dev server:
```bash
# Press Ctrl+C, then:
npm run dev
```

### Issue: "Email not received"

**Possible causes:**

1. **Supabase email not configured:**
   - Go to Supabase → Authentication → Email Templates
   - Check that "Magic Link" template is enabled
   - For local testing, check Supabase logs for email delivery

2. **Email in spam folder:**
   - Check your spam/junk folder

3. **Use manual login link:**
   ```
   http://localhost:3000/onboarding?token=YOUR_TOKEN
   ```

**Alternative - Manual User Creation:**

If emails aren't working, create user manually in Supabase:

```sql
-- Create auth user
INSERT INTO auth.users (
  email,
  email_confirmed_at,
  encrypted_password
) VALUES (
  'test@example.com',
  NOW(),
  crypt('password123', gen_salt('bf'))
);

-- Create user profile
INSERT INTO users (
  id,
  email,
  full_name,
  profile_type,
  subscription_plan,
  subscription_end_date,
  status,
  current_day,
  slim_points
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'test@example.com',
  'Test User',
  'cortisol',
  'monthly',
  NOW() + INTERVAL '30 days',
  'active',
  1,
  0
);
```

Then login at: `http://localhost:3000/login`
- Email: `test@example.com`
- Password: `password123`

### Issue: "No data on dashboard"

**Solution:**

Make sure you have daily content in the database. Run seed data:

```sql
-- In Supabase SQL Editor, paste and run:
-- Contents of supabase/seed.sql
```

Or check:
```sql
SELECT * FROM daily_content;
SELECT * FROM daily_tasks;
SELECT * FROM profile_content;
```

### Issue: "Test signup page not found"

**Solution:**

1. Make sure the file exists at:
   ```
   SLIMPATH/app/test-signup/page.tsx
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Access at exactly:
   ```
   http://localhost:3000/test-signup
   ```

---

## 🎯 What You're Testing

This test flow verifies:

✅ **User Creation** - Webhook creates user correctly  
✅ **Email Delivery** - Magic link emails are sent  
✅ **Authentication** - Users can login  
✅ **Onboarding** - All 7 steps work  
✅ **Data Persistence** - User data saves to database  
✅ **Dashboard** - All modules render correctly  
✅ **Task Completion** - Users can check off tasks  
✅ **SlimPoints** - Points system works  
✅ **Personalization** - Content matches user type  
✅ **Subscription** - Plan details stored correctly  

---

## 📊 Monitoring Test Results

### Check Webhook Logs

View webhook execution in terminal:

```bash
# You'll see output like:
Webhook payload received: { email: 'test@example.com' }
Creating new auth user for: test@example.com
Created auth user with ID: abc-123-def
Successfully created profile for test@example.com
Sending magic link to test@example.com
✅ Webhook completed successfully
```

### Verify in Supabase

**Check users table:**
```sql
SELECT 
  email,
  profile_type,
  subscription_plan,
  status,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

**Check onboarding:**
```sql
SELECT 
  u.email,
  uo.onboarding_completed,
  uo.biometrics
FROM user_onboarding uo
JOIN users u ON u.id = uo.user_id
ORDER BY uo.created_at DESC;
```

---

## 🔒 Security Note

⚠️ **IMPORTANT:** The test signup page is for **development only**.

**Before deploying to production:**

1. **Delete the test page:**
   ```bash
   rm SLIMPATH/app/test-signup/page.tsx
   ```

2. **Or add authentication:**
   - Protect with password
   - Add IP whitelist
   - Require admin login

3. **Use secure webhook secret:**
   - Change from `test-secret-123` to a strong secret
   - Store in environment variables
   - Never commit to git

---

## 🎉 Success Checklist

After completing testing, you should be able to:

- [ ] Create test users with $0 payment
- [ ] Receive magic link emails
- [ ] Login to the app
- [ ] Complete onboarding
- [ ] Access dashboard
- [ ] See personalized content
- [ ] Complete tasks and earn SlimPoints
- [ ] Test all 6 metabolism types
- [ ] Verify subscription plans work

---

## 🚀 Next Steps

Once testing is complete:

1. **Add Real Content**
   - Create all 30 days of content
   - Customize for each profile type
   - Add nutrition guides

2. **Set Up Real Payments**
   - Configure Cartpanda/Kirvano
   - Set up webhook URL
   - Test with test cards

3. **Deploy to Production**
   - See `DEPLOYMENT_CHECKLIST.md`
   - Deploy to Vercel
   - Configure environment variables

4. **Test End-to-End**
   - Marketing site → Quiz → Purchase → App
   - Verify entire user journey

---

## 📞 Need Help?

- **Documentation:** Check `README.md` and `QUICK_START.md`
- **Database Issues:** See `SETUP_INSTRUCTIONS.md`
- **Deployment:** Read `DEPLOYMENT_CHECKLIST.md`

**Happy Testing! 🧪🎉**

