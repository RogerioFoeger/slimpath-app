# 🎉 Free Testing Setup - No Credit Card Required!

## 📖 Overview

This guide shows you how to test SlimPath AI **completely free** without:
- ❌ No credit cards needed
- ❌ No Stripe test cards
- ❌ No payment processing
- ❌ No real money

Instead, you'll use a **test signup page** that creates user accounts with **$0 payment**, giving you full access to test the entire app.

---

## 🎯 What You'll Be Able to Test

After following this guide, you can:

✅ Create unlimited test users  
✅ Test all 6 metabolism types  
✅ Receive magic link emails  
✅ Complete onboarding flow  
✅ Access dashboard  
✅ Test all features (tasks, mood, nutrition, panic button)  
✅ Verify personalization works  
✅ Check SlimPoints system  
✅ Test both monthly and annual plans  

---

## 🚀 Setup (15 Minutes)

### Prerequisites

Before starting, make sure you have:

- ✅ Node.js 18+ installed
- ✅ Supabase account created
- ✅ Database set up (schema.sql executed)
- ✅ Text editor (VS Code recommended)

**New to this project?** See `QUICK_START.md` first.

---

## 📝 Step-by-Step Setup

### Step 1: Configure Environment Variables

Create a file named `.env.local` in the `SLIMPATH` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Webhook Secret (for testing)
WEBHOOK_SECRET=test-secret-123
NEXT_PUBLIC_WEBHOOK_SECRET=test-secret-123

# VAPID Keys (optional for testing, required for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:support@slimpathai.com
```

**Where to get these values:**

1. **Supabase values:** 
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy: URL, anon key, service_role key

2. **VAPID keys (optional):**
   ```bash
   npx web-push generate-vapid-keys
   ```

3. **Webhook secret:**
   - For testing: Use `test-secret-123`
   - For production: Generate a strong random secret

### Step 2: Verify Setup

Run the verification script:

```bash
cd SLIMPATH
node verify-setup.js
```

**Expected output:**
```
✅ All checks passed! You're ready to test!
```

If you see errors, follow the suggestions in the output.

### Step 3: Start Development Server

```bash
cd SLIMPATH
npm run dev
```

Server will start at `http://localhost:3000`

**You should see:**
```
- ready started server on 0.0.0.0:3000
- Local: http://localhost:3000
```

### Step 4: Verify Test Page is Accessible

Open your browser and go to:

```
http://localhost:3000/test-signup
```

**You should see:**
- 🧪 Test Signup (Free) heading
- Form with email, name, type, and plan fields
- Blue button: "Create Free Test Account"

---

## 🧪 Testing Process

### Test 1: Create Your First Test User

1. **Fill in the form:**
   ```
   Email: your-real-email@example.com
   Name: Test User
   Metabolism Type: Cortisol Type
   Subscription Plan: Monthly
   ```

   ⚠️ **Important:** Use a real email address you have access to!

2. **Click:** "🚀 Create Free Test Account"

3. **Wait for success:**
   - You should see a green success box
   - It will show: "✅ Success!"
   - User ID will be displayed
   - Message: "📧 Check your email for the magic link to login!"

4. **Check your email:**
   - From: Supabase (or your configured email)
   - Subject: "Confirm Your Email" or "Magic Link"
   - Look for a link that says "Sign In" or "Confirm Email"

5. **Click the link in email:**
   - You'll be redirected to the app
   - Should land on `/onboarding` page

### Test 2: Complete Onboarding

The onboarding has 7 steps:

**Step 1: Welcome**
- Just click "Get Started"

**Step 2: Biometrics**
- Enter: Height, Weight, Age, Gender
- Click "Continue"

**Step 3: Health Radar**
- Select symptoms (optional)
- Click "Continue"

**Step 4: Nutrition Filter**
- Select dietary restrictions (optional)
- Add allergies if any
- Click "Continue"

**Step 5: Diet History**
- Select previous diets tried
- Click "Continue"

**Step 6: Processing**
- Watch the animation (2-3 seconds)
- Auto-advances

**Step 7: Welcome to SlimPath**
- Click "Go to Dashboard"

### Test 3: Explore Dashboard

You should now see the main dashboard with 5 modules:

**1. Lean Trainer (Top)**
- See "Good morning!" message from Lean
- Daily micro-challenge
- Progress tracking

**2. Daily Checklist**
- List of tasks for the day
- Click checkbox to complete tasks
- Watch SlimPoints increase!

**3. Mood Check-in**
- Click an emoji to set mood
- Submit mood
- See success message

**4. Nutrition Module**
- See "Star Food of the Day"
- View allowed foods
- Read personalized tips

**5. Panic Button**
- Click the big red button
- See motivational message
- Modal pops up with encouragement

### Test 4: Verify Data Persistence

1. **Check tasks persist:**
   - Complete a task
   - Refresh page
   - Task should stay checked ✓

2. **Check SlimPoints:**
   - Note your current points
   - Complete another task
   - Points should increase

3. **Check in Supabase:**
   - Go to Supabase Dashboard
   - Table Editor → `users`
   - Find your email
   - Verify: status = "active", correct profile_type

---

## 🎨 Testing All 6 Metabolism Types

Create 6 different test users to see personalized content:

| Type | Email | What's Different |
|------|-------|------------------|
| **Cortisol** | test-cortisol@example.com | Stress-focused content |
| **Hormonal** | test-hormonal@example.com | Hormone-balancing tips |
| **Inflammatory** | test-inflammatory@example.com | Anti-inflammatory foods |
| **Metabolic** | test-metabolic@example.com | Metabolism-boosting advice |
| **Retention** | test-retention@example.com | Water retention solutions |
| **Insulinic** | test-insulinic@example.com | Blood sugar management |

Each type will see:
- Different star foods
- Personalized allowed foods list
- Type-specific daily tips
- Customized challenges

---

## 💰 Testing Subscription Plans

Create users with different plans:

**Monthly Plan ($37/mo)**
- Subscription end date: 30 days from signup
- Access: Full features

**Annual Plan ($297/yr)**
- Subscription end date: 365 days from signup
- Access: Full features + bonuses (if configured)

**To verify:**
```sql
-- In Supabase SQL Editor:
SELECT 
  email,
  subscription_plan,
  subscription_end_date,
  EXTRACT(DAY FROM (subscription_end_date - created_at)) as days_of_access
FROM users
ORDER BY created_at DESC;
```

---

## 🔍 Behind the Scenes: How It Works

### What Happens When You Create a Test User

1. **Form Submission:**
   - Browser sends POST request to `/api/webhook`
   - Includes: email, name, profile_type, subscription_plan
   - Amount: $0 (free!)

2. **Webhook Processing:**
   - Verifies webhook secret
   - Creates auth user in Supabase Auth
   - Creates user profile in `users` table
   - Creates onboarding record in `user_onboarding`
   - Sends magic link email

3. **Database Changes:**
   ```
   auth.users → New user created
   users → Profile created (status: active)
   user_onboarding → Onboarding record created
   ```

4. **Email Sent:**
   - Magic link with JWT token
   - Valid for 1 hour
   - One-click login

5. **User Clicks Link:**
   - Token verified
   - User authenticated
   - Redirected to `/onboarding`

### The Test Page vs Real Payments

**Test Page (Development):**
```
User fills form → Webhook called directly → User created
                   ↓
                Amount: $0
                No payment processor
```

**Production (Real Users):**
```
User clicks "Buy Now" → Cartpanda/Kirvano → Payment processed → Webhook called → User created
                         ↓
                    Real payment
                    $37 or $297
```

The test page **skips the payment** but creates the user **exactly the same way** as a real purchase would.

---

## 🐛 Troubleshooting

### Problem: "Webhook secret mismatch"

**Cause:** Environment variables not set correctly

**Solution:**
```bash
# Check .env.local has both:
WEBHOOK_SECRET=test-secret-123
NEXT_PUBLIC_WEBHOOK_SECRET=test-secret-123

# Restart dev server:
# Press Ctrl+C, then:
npm run dev
```

### Problem: "Email not received"

**Possible causes:**

1. **Email in spam folder**
   - Check spam/junk folder
   - Add Supabase sender to contacts

2. **Supabase email not configured**
   - Go to Supabase → Authentication
   - Check "Email Templates" are enabled
   - Verify SMTP settings (if custom email)

3. **Email delivery delay**
   - Wait 1-2 minutes
   - Check Supabase logs: Logs → Edge Functions

**Workaround - Manual Login:**

If emails aren't working, create user manually:

```sql
-- In Supabase SQL Editor:

-- 1. Create auth user with password
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) RETURNING id;

-- 2. Copy the ID returned, then create profile:
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
  'PASTE_ID_HERE',  -- Replace with ID from above
  'test@example.com',
  'Test User',
  'cortisol',
  'monthly',
  NOW() + INTERVAL '30 days',
  'active',
  1,
  0
);

-- 3. Create onboarding record:
INSERT INTO user_onboarding (user_id)
VALUES ('PASTE_ID_HERE');  -- Same ID
```

Then login at: `http://localhost:3000/login`
- Email: `test@example.com`
- Password: `password123`

### Problem: "No data on dashboard"

**Cause:** No daily content in database

**Solution:**

Run seed data in Supabase SQL Editor:

```bash
# Open: supabase/seed.sql
# Copy all contents
# Paste in Supabase SQL Editor
# Click "Run"
```

This will add Days 1-3 with tasks, nutrition, and challenges.

### Problem: "Test page shows 404"

**Causes:**

1. Dev server not running
2. File doesn't exist
3. Next.js cache issue

**Solutions:**

```bash
# 1. Make sure file exists:
ls -la app/test-signup/page.tsx

# 2. Clear Next.js cache:
rm -rf .next

# 3. Restart dev server:
npm run dev

# 4. Try exact URL:
http://localhost:3000/test-signup
```

### Problem: "Page loads but button does nothing"

**Cause:** JavaScript error

**Solution:**

1. Open browser console (F12)
2. Look for red error messages
3. Common errors:
   - CORS error → Check Supabase URL in .env.local
   - Network error → Check Supabase is running
   - 401 Unauthorized → Check webhook secret

### Problem: "Success but no email"

**This is normal for local development!**

Supabase free tier has email rate limits. For testing:

**Option 1: Use console output**
```bash
# Check terminal where dev server is running
# Look for: "Sending magic link to test@example.com"
```

**Option 2: Use Supabase inbox**
- Go to Supabase Dashboard
- Authentication → Users
- Find your user
- Click "Send Magic Link"
- Copy the URL from browser network tab

**Option 3: Manual password login**
- Use SQL script above to set password
- Login normally

---

## ✅ Success Checklist

After completing all tests, you should be able to:

- [ ] Access test signup page
- [ ] Create test user with form
- [ ] See success message
- [ ] Find user in Supabase
- [ ] Receive magic link email (or use workaround)
- [ ] Click link and get authenticated
- [ ] Complete all 7 onboarding steps
- [ ] See dashboard with all 5 modules
- [ ] Complete tasks and earn SlimPoints
- [ ] Submit mood check-in
- [ ] View nutrition module
- [ ] Test panic button
- [ ] Verify data persists after refresh
- [ ] Create users of different types
- [ ] See personalized content per type

---

## 🔒 Security & Production

### Before Going to Production

**1. Delete the test page:**
```bash
rm app/test-signup/page.tsx
```

**2. Use secure webhook secret:**
```env
# Generate strong secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to production .env:
WEBHOOK_SECRET=your_generated_secret_here
```

**3. Set up real payment processing:**
- Configure Cartpanda/Kirvano
- Add real checkout URLs
- Test with real payment flow
- See `DEPLOYMENT_CHECKLIST.md`

### Why This Test Page is Safe for Development

✅ Only works on localhost  
✅ Requires Supabase credentials  
✅ No public URLs exposed  
✅ Easy to remove before production  
✅ Creates same data structure as real payments  

---

## 📊 Testing Metrics

### What to Verify

**User Creation:**
- ✅ User appears in `auth.users`
- ✅ Profile in `users` table
- ✅ Onboarding record in `user_onboarding`
- ✅ Correct email, name, type
- ✅ Status = 'active'
- ✅ Subscription end date set correctly

**Email Delivery:**
- ✅ Email received within 1-2 minutes
- ✅ Link works and authenticates
- ✅ Redirects to onboarding

**Onboarding:**
- ✅ All 7 steps complete
- ✅ Data saves correctly
- ✅ Redirects to dashboard

**Dashboard:**
- ✅ All modules render
- ✅ Data loads from database
- ✅ Tasks are checkable
- ✅ SlimPoints increase
- ✅ Mood check-in works
- ✅ Panic button works

**Personalization:**
- ✅ Different types see different content
- ✅ Star food matches type
- ✅ Allowed foods are type-specific
- ✅ Daily tips are personalized

---

## 🎯 Next Steps

### After Successful Testing

1. **Add More Content**
   - Create Days 4-30
   - Add more tasks
   - Write more tips
   - Customize for each type

2. **Customize Design**
   - Update colors in `tailwind.config.ts`
   - Add your logo
   - Customize fonts

3. **Set Up Real Payments**
   - Configure Cartpanda/Kirvano
   - Set up webhook URL
   - Test with real checkout

4. **Deploy to Production**
   - Deploy to Vercel
   - Configure environment variables
   - Remove test page
   - Test end-to-end flow

---

## 📚 Related Documentation

- **Setup:** `QUICK_START.md` - Complete project setup
- **Testing:** `TESTING_GUIDE.md` - Detailed testing instructions  
- **Quick Ref:** `TEST_QUICK_REFERENCE.md` - Cheat sheet
- **Deployment:** `DEPLOYMENT_CHECKLIST.md` - Production deployment
- **Technical:** `TECHNICAL_NOTES.md` - Architecture details

---

## 📞 Need Help?

### Common Questions

**Q: Is this really free?**  
A: Yes! No payment required. You're creating test users directly in the database.

**Q: Can I use this in production?**  
A: No! This is for testing only. Remove before going live.

**Q: How many test users can I create?**  
A: Unlimited (within Supabase free tier limits).

**Q: Will test users have full access?**  
A: Yes! They have the same access as paid users.

**Q: Can I test the payment flow?**  
A: Not with this method. For payment testing, set up Cartpanda/Kirvano with test mode.

---

## 🎉 You're Ready!

You now have everything you need to test SlimPath AI without any payment setup!

**Quick start:**
1. `npm run dev`
2. Visit `http://localhost:3000/test-signup`
3. Create test account
4. Complete onboarding
5. Explore dashboard

**Happy testing! 🧪🚀**

---

*Last updated: December 2025*

