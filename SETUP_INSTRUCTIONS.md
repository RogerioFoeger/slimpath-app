# SlimPath AI - Complete Setup Instructions

## 🎯 Quick Start Guide

Follow these steps to get SlimPath AI running locally and deploy to production.

## 1️⃣ Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ A Supabase account (free tier works)
- ✅ Vercel account for deployment
- ✅ Basic knowledge of Next.js and SQL

## 2️⃣ Initial Setup

### Step 1: Install Dependencies

```bash
cd SLIMPATH
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### Step 3: Set Up Database

1. In Supabase Dashboard, go to SQL Editor
2. Copy entire contents of `supabase/schema.sql`
3. Paste and run in SQL Editor
4. Wait for completion (should take ~30 seconds)
5. Optionally run `supabase/seed.sql` for sample data

### Step 4: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 5: Generate VAPID Keys

Run this command to generate push notification keys:

```bash
npx web-push generate-vapid-keys
```

Add the output to `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=mailto:support@slimpathai.com
```

### Step 6: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 3️⃣ Setting Up Payment Integration

### Webhook Configuration

1. Configure your payment platform (Cartpanda/Kirvano) webhook:
   - URL: `https://your-domain.com/api/webhook`
   - Method: POST
   - Add header: `x-webhook-secret: your_secret_here`

2. Test payload:

```json
{
  "email": "test@example.com",
  "name": "Test User",
  "profile_type": "hormonal",
  "subscription_plan": "monthly",
  "transaction_id": "test_123",
  "amount": 37
}
```

3. Update `.env.local`:

```env
WEBHOOK_SECRET=your_webhook_secret_here
```

## 4️⃣ Creating App Icons

You need to create PNG icons in these sizes:

- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

Place them in: `public/icons/icon-{size}.png`

**Quick way to generate icons:**

1. Create a 512x512 PNG with your logo
2. Use [RealFaviconGenerator](https://realfavicongenerator.net/)
3. Download and extract to `public/icons/`

## 5️⃣ Admin Panel Setup

### Create Admin User

Run this in Supabase SQL Editor:

```sql
-- First, you need to hash a password using bcrypt
-- Use an online bcrypt generator or Node.js:
-- bcrypt.hash('your_password', 10)

INSERT INTO admin_users (email, password_hash, full_name, is_super_admin)
VALUES (
  'admin@slimpathai.com',
  'your_bcrypt_hashed_password',
  'Admin User',
  true
);
```

### Adding Daily Content

1. Go to `/admin` (after creating admin user)
2. Click "Add New Day"
3. Fill in all fields:
   - Day number (1-30)
   - Lean's message
   - Micro-challenge
   - Panic button audio URL (optional)
   - Support text
4. Add tasks for each day
5. Configure nutrition for all 6 profile types

**Tip:** Use seed.sql as a template for content structure!

## 6️⃣ Deployment to Production

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add all variables from `.env.local`

4. **Deploy to Vercel**
   - Vercel will auto-assign domain: `slimpathaiapp.vercel.app`
   - Or add custom domain in Settings > Domains

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option B: Manual Deployment

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Test production build**
   ```bash
   npm start
   ```

3. **Deploy to your hosting**
   - Upload `.next` folder
   - Set environment variables
   - Configure Node.js server

## 7️⃣ Post-Deployment Setup

### Domain Configuration (Optional)

Your app is already live at `https://slimpathaiapp.vercel.app`

If you want a custom domain:
1. Go to Vercel → Project → Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS instructions for your domain provider

### SSL Certificate

- Vercel: Automatic SSL (already enabled)
- Custom domains: Vercel handles SSL automatically

### Email Configuration

Set up SPF/DKIM records for `support@slimpathai.com` with your email provider for better deliverability.

## 8️⃣ Testing Checklist

Before going live, test:

- ✅ Sign up flow
- ✅ Login/Logout
- ✅ Onboarding (all 7 steps)
- ✅ Dashboard loads correctly
- ✅ Tasks can be checked
- ✅ Mood check-in works
- ✅ Panic button opens
- ✅ Admin panel accessible
- ✅ Webhook receives data
- ✅ Push notifications (test on mobile)
- ✅ PWA installs on mobile
- ✅ Offline functionality

## 9️⃣ Cron Jobs (Optional)

Set up cron job for daily notifications:

### Using Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/push/send",
    "schedule": "0 8 * * *"
  }]
}
```

### Using External Service

Use [cron-job.org](https://cron-job.org) to hit:
```
POST https://slimpathaiapp.vercel.app/api/push/send
```
Daily at 8:00 AM

## 🔟 Monitoring & Analytics

### Recommended Tools

1. **Error Tracking**: [Sentry](https://sentry.io)
2. **Analytics**: [Plausible](https://plausible.io) or Google Analytics
3. **Uptime**: [UptimeRobot](https://uptimerobot.com)
4. **Performance**: [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## 🆘 Troubleshooting

### Common Issues

**Problem: "Failed to load dashboard"**
- Check Supabase connection
- Verify RLS policies are set
- Check browser console for errors

**Problem: "Push notifications not working"**
- Verify VAPID keys are correct
- Check HTTPS is enabled
- Test on different browsers

**Problem: "Webhook not receiving data"**
- Verify webhook secret matches
- Check webhook URL is correct
- Test with Postman first

**Problem: "Can't log in to admin"**
- Verify admin user exists in database
- Check password hash is correct
- Clear browser cookies

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web Push Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

## 🤝 Support

Need help? Contact: support@slimpathai.com

---

**Congratulations! Your SlimPath AI app is ready to transform lives! 🎉**

