# SlimPath AI - Personal Weight Loss Journey PWA

A comprehensive Progressive Web App built with Next.js, Supabase, and PostgreSQL for personalized weight loss coaching powered by AI.

## 🌟 Features

- **6 Metabolic Profile Types**: Hormonal, Inflammatory, Cortisol, Metabolic, Retention, and Insulinic
- **30-Day Personalized Program**: Daily content adapted to user's profile
- **AI Coach (Lean)**: Interactive AI companion providing daily motivation and micro-challenges
- **Gamification**: Earn Slim Points and unlock bonus content
- **Mood Tracking**: Track emotional state 3x daily with analytics
- **Nutrition Module**: Profile-specific meal plans and food recommendations
- **Panic Button**: SOS support with calming audio and techniques
- **Push Notifications**: Daily reminders to stay on track
- **Progressive Web App**: Install on any device, works offline
- **Admin CMS**: Manage 30 days of content without touching code

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Web Push API
- **State Management**: Zustand
- **PWA**: Service Workers, Web App Manifest

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Vercel account for deployment
- VAPID keys for push notifications

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd SLIMPATH
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=https://slimpathaiapp.vercel.app
   NEXT_PUBLIC_SITE_NAME=SlimPath AI

   # Webhook Secret
   WEBHOOK_SECRET=your_webhook_secret_key

   # VAPID Keys for Push Notifications
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   VAPID_EMAIL=mailto:support@slimpathai.com
   ```

4. **Set up Supabase database**
   
   Run the SQL schema in your Supabase SQL Editor:
   ```bash
   # Copy contents of supabase/schema.sql and run in Supabase SQL Editor
   ```

5. **Generate VAPID keys** (for push notifications)
   ```bash
   npx web-push generate-vapid-keys
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Schema

The application uses the following main tables:

- `users` - User profiles and subscription information
- `user_onboarding` - Onboarding data (measurements, health info)
- `daily_content` - 30-day content (messages, challenges)
- `daily_tasks` - Tasks for each day
- `profile_content` - Profile-specific nutrition content
- `user_daily_progress` - Daily completion tracking
- `mood_checkins` - Mood tracking data
- `push_subscriptions` - Push notification subscriptions
- `bonus_content` - Unlockable rewards
- `admin_users` - Admin panel access

## 🔐 Authentication Flow

1. **Payment → Webhook**: User completes payment on Cartpanda/Kirvano
2. **Account Creation**: Webhook creates user account with profile type
3. **Magic Link**: User receives email with access link
4. **Onboarding**: 7-screen onboarding collects additional data
5. **Dashboard**: User starts Day 1 of their personalized journey

## 📱 PWA Features

- **Installable**: Add to home screen on any device
- **Offline Support**: Service worker caches essential resources
- **Push Notifications**: Daily reminders at 8:00 AM
- **Responsive**: Optimized for mobile, tablet, and desktop

## 🔧 Webhook Integration

Configure your payment platform (Cartpanda/Kirvano) to send webhooks to:

```
POST https://slimpathaiapp.vercel.app/api/webhook
```

**Webhook Payload:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "profile_type": "hormonal",
  "subscription_plan": "monthly",
  "transaction_id": "txn_123",
  "amount": 37
}
```

**Headers:**
```
x-webhook-secret: your_webhook_secret
Content-Type: application/json
```

## 👨‍💼 Admin Panel

Access the admin panel at `/admin` to:

- Create and edit 30-day content
- Manage daily tasks
- Configure profile-specific nutrition
- Upload panic button audio files
- View user analytics (future enhancement)

## 🎨 Customization

### Profile Types

Edit `lib/constants.ts` to customize profile types:

```typescript
export const PROFILE_TYPES = {
  hormonal: {
    name: 'Hormonal Type',
    description: '...',
    icon: '🌸',
    color: '#FF6B9D',
  },
  // Add more types...
}
```

### Styling

Modify `tailwind.config.ts` for theme customization:

```typescript
colors: {
  primary: { ... },
  secondary: { ... },
}
```

## 📊 Analytics & Monitoring

Consider integrating:

- Google Analytics for user behavior
- Sentry for error tracking
- LogRocket for session replay
- Posthog for product analytics

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository**
   ```bash
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

- **Netlify**: Works with Next.js
- **Railway**: Supports Next.js and PostgreSQL
- **AWS Amplify**: Full-stack deployment

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Webhook signature verification
- HTTPS enforced in production
- Secure cookie handling
- Input validation on all forms

## 📝 Content Management

### Adding Daily Content

1. Go to `/admin`
2. Click "Add New Day"
3. Fill in:
   - Day number (1-30)
   - Lean's message
   - Micro-challenge
   - Panic button audio URL
   - Support text
4. Add tasks for the day
5. Configure nutrition for each profile type

## 🤝 Support

For support, email support@slimpathai.com

## 📄 License

Proprietary - All rights reserved © 2025 SlimPath AI

## 🙏 Acknowledgments

- Built with Next.js, Supabase, and modern web technologies
- Icons by Lucide
- Animations by Framer Motion

---

**Built with ❤️ for transforming lives through personalized health coaching**

