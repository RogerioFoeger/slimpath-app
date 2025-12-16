# ⚡ Quick Start Guide - SlimPath AI

Get up and running in **15 minutes** with this streamlined guide!

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js 18+ (`node --version`)
- ✅ npm or yarn (`npm --version`)
- ✅ A code editor (VS Code recommended)
- ✅ Terminal/command line access

## 5-Minute Setup

### 1. Install Dependencies (2 min)

```bash
cd SLIMPATH
npm install
```

### 2. Create Supabase Project (3 min)

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Name: `slimpath-ai`
   - Database Password: (generate strong password)
   - Region: (choose closest to you)
4. Wait ~2 minutes for project creation
5. Copy these from Settings → API:
   - Project URL
   - `anon/public` key
   - `service_role` key (keep secret!)

### 3. Configure Environment (1 min)

```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local with your Supabase values
```

Paste your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Database (2 min)

1. In Supabase Dashboard: SQL Editor (left sidebar)
2. Open `supabase/schema.sql` in your code editor
3. Copy ALL contents
4. Paste into Supabase SQL Editor
5. Click "Run" (takes ~30 seconds)
6. ✅ You should see "Success. No rows returned"

### 5. Generate Push Notification Keys (1 min)

```bash
npx web-push generate-vapid-keys
```

Copy the output and add to `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=mailto:support@slimpathai.com
```

### 6. Add Sample Data (Optional - 1 min)

```bash
# In Supabase SQL Editor:
# Open supabase/seed.sql
# Copy and run to get sample content
```

### 7. Start Development Server

```bash
npm run dev
```

🎉 **Open [http://localhost:3000](http://localhost:3000)** in your browser!

---

## Test the App (5 min)

### Create Your First User

1. **Go to login page:** http://localhost:3000/login
2. **Click "Sign Up"**
3. **Enter email and password**
4. **Check Supabase for confirmation**
   - Supabase → Authentication → Users
   - You should see your new user

### Manual User Creation (for testing)

If email confirmation isn't working locally:

```sql
-- In Supabase SQL Editor:
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@example.com', crypt('password123', gen_salt('bf')), NOW());

-- Then insert user profile:
INSERT INTO users (id, email, full_name, profile_type, status, current_day, slim_points)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'test@example.com',
  'Test User',
  'hormonal',
  'active',
  1,
  0
);
```

### Complete Onboarding

1. Login with your test user
2. Go through all 7 onboarding steps
3. Arrive at the dashboard
4. Test features:
   - ✅ Check off a task
   - ✅ Submit a mood check-in
   - ✅ Click panic button
   - ✅ View nutrition module

---

## Add Your First Content (5 min)

### Method 1: Use Seed Data

Already done if you ran `seed.sql` earlier! You'll have Days 1-3 with content.

### Method 2: Manual Entry

1. **Go to Supabase SQL Editor**
2. **Run this:**

```sql
-- Add Day 1 content
INSERT INTO daily_content (day_number, lean_message, micro_challenge, panic_button_text)
VALUES (
  1,
  'Welcome to Day 1! Today is about building momentum. Small steps lead to big transformations!',
  'Drink one full glass of water right now and check it off your list.',
  'Take a deep breath. You are stronger than you think!'
);

-- Add tasks for Day 1
INSERT INTO daily_tasks (daily_content_id, task_text, task_order)
SELECT id, task, task_order FROM daily_content,
(VALUES
  ('Drink 8 glasses of water today', 1),
  ('Take a 10-minute walk', 2),
  ('Log your mood check-in', 3),
  ('Read today''s nutrition guide', 4),
  ('Complete morning stretch', 5)
) AS tasks(task, task_order)
WHERE day_number = 1;

-- Add nutrition for hormonal type
INSERT INTO profile_content (daily_content_id, profile_type, star_food_name, star_food_description, allowed_foods)
SELECT id, 'hormonal', 'Eggs',
'Rich in protein and healthy fats to support hormone balance',
ARRAY['Eggs', 'Avocado', 'Wild Salmon', 'Leafy Greens', 'Berries', 'Nuts']
FROM daily_content WHERE day_number = 1;
```

3. **Refresh your dashboard** - You should now see:
   - Lean's message
   - Micro-challenge
   - 5 tasks
   - Star food

---

## Troubleshooting

### ❌ "Can't connect to Supabase"

**Check:**
- Are the environment variables correct?
- Is your Supabase project running?
- Did you restart the dev server after adding env vars?

```bash
# Restart the server:
# Press Ctrl+C
npm run dev
```

### ❌ "No data showing on dashboard"

**Check:**
- Did you run the schema.sql?
- Did you add content (seed.sql or manual)?
- Does your user have `current_day: 1`?

```sql
-- Check in Supabase SQL Editor:
SELECT * FROM users;
SELECT * FROM daily_content;
SELECT * FROM daily_tasks;
```

### ❌ "Tasks not saving"

**Check:**
- Is user logged in?
- Check browser console for errors (F12)
- Check RLS policies are set (they should be from schema.sql)

### ❌ "Build errors"

```bash
# Clear cache and reinstall:
rm -rf node_modules .next
npm install
npm run dev
```

---

## What's Next?

### For Development

1. ✅ Explore the code structure
2. ✅ Read `TECHNICAL_NOTES.md` for architecture
3. ✅ Add all 30 days of content
4. ✅ Customize design/colors in `tailwind.config.ts`
5. ✅ Add your app icons to `public/icons/`

### For Production

1. ✅ Complete `DEPLOYMENT_CHECKLIST.md`
2. ✅ Deploy to Vercel
3. ✅ Set up custom domain
4. ✅ Configure payment webhook
5. ✅ Test end-to-end user flow

### Essential Files to Understand

```
📄 app/dashboard/page.tsx       # Main user dashboard
📄 app/onboarding/page.tsx      # Onboarding orchestrator
📄 lib/types.ts                 # All TypeScript types
📄 lib/constants.ts             # Configuration values
📄 supabase/schema.sql          # Database structure
```

---

## Quick Commands Reference

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Database
# (Run in Supabase SQL Editor, not terminal)

# Check environment
echo $NEXT_PUBLIC_SUPABASE_URL

# Generate icons (requires ImageMagick)
convert logo.png -resize 192x192 public/icons/icon-192x192.png
```

---

## Getting Help

### Documentation
- `README.md` - Complete project documentation
- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `TECHNICAL_NOTES.md` - Architecture deep-dive

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Support
- Email: support@slimpathai.com

---

## 🎉 You're All Set!

Your SlimPath AI development environment is ready!

**Next steps:**
1. Explore the dashboard at http://localhost:3000/dashboard
2. Try the admin panel at http://localhost:3000/admin
3. Add more daily content
4. Customize the design
5. Deploy to production!

**Happy coding! 🚀**

---

*Built with ❤️ for SlimPath AI - Transforming lives through personalized health coaching.*

