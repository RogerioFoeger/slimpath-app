# Technical Notes & Architecture

## 🏗️ Architecture Overview

### Frontend Architecture

```
┌─────────────────────────────────────┐
│         Next.js 14 (App Router)     │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────┐   │
│  │  Pages   │  │  Components  │   │
│  │  (/app)  │  │ (/components)│   │
│  └──────────┘  └──────────────┘   │
├─────────────────────────────────────┤
│         React 18 + TypeScript       │
├─────────────────────────────────────┤
│    Tailwind CSS + Framer Motion     │
└─────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────┐
│      Supabase (PostgreSQL)          │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────┐   │
│  │   Auth   │  │  Database    │   │
│  │  System  │  │  (Postgres)  │   │
│  └──────────┘  └──────────────┘   │
├─────────────────────────────────────┤
│     Row Level Security (RLS)        │
├─────────────────────────────────────┤
│         Real-time Updates           │
└─────────────────────────────────────┘
```

### Data Flow

```
User → Payment Platform → Webhook → API Route
                                      ↓
                              Create User Account
                                      ↓
                          Send Magic Link Email
                                      ↓
                              User Onboarding
                                      ↓
                          Dashboard with Daily Content
```

## 📊 Database Schema Details

### Key Tables & Relationships

1. **users** (1) ↔ (1) **user_onboarding**
2. **users** (1) ↔ (∞) **user_daily_progress**
3. **users** (1) ↔ (∞) **mood_checkins**
4. **daily_content** (1) ↔ (∞) **daily_tasks**
5. **daily_content** (1) ↔ (∞) **profile_content**

### Indexes for Performance

Critical indexes on:
- `users.email` - Fast user lookup
- `user_daily_progress.user_id + date` - Quick progress queries
- `daily_content.day_number` - Fast content retrieval
- `mood_checkins.user_id + date` - Efficient mood tracking

## 🔐 Security Implementation

### Row Level Security (RLS)

Each table has policies ensuring:
- Users can only see their own data
- Public read access for content tables
- Admin tables require special permissions

Example policy:
```sql
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
```

### Authentication Flow

1. **Magic Link** (primary method)
2. **Email/Password** (fallback)
3. **Session management** via Supabase Auth
4. **Secure cookies** for persistent sessions

### API Security

- Webhook signature verification
- Rate limiting on sensitive endpoints (recommended)
- Input validation on all forms
- SQL injection prevention via parameterized queries

## 🚀 Performance Optimizations

### Frontend

1. **Code Splitting**
   - Lazy load heavy components
   - Dynamic imports for modals
   - Separate bundles per route

2. **Image Optimization**
   - Next.js Image component
   - WebP format where supported
   - Lazy loading below fold

3. **Caching Strategy**
   - Service worker caches static assets
   - Supabase client-side caching
   - React Query for data fetching (future enhancement)

### Backend

1. **Database Queries**
   - Select only needed columns
   - Use indexes effectively
   - Batch operations where possible

2. **Connection Pooling**
   - Supabase handles automatically
   - Max connections managed

3. **Edge Functions** (future)
   - Closer to users
   - Faster response times

## 📱 PWA Implementation

### Service Worker Strategy

```javascript
// Cache-first for static assets
// Network-first for API calls
// Offline fallback for HTML pages
```

### Manifest Configuration

```json
{
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/dashboard"
}
```

### Push Notifications

Using Web Push API with VAPID keys:
1. User subscribes on dashboard
2. Subscription stored in database
3. Cron job sends daily notifications
4. Service worker receives and displays

## 🔄 State Management

Currently using:
- React hooks for component state
- Supabase for server state
- Context API for global state (minimal)

**Future consideration:** Zustand for complex client state

## 🎨 Styling Approach

### Tailwind CSS

**Advantages:**
- Utility-first for rapid development
- No CSS file bloat
- Consistent design system
- Easy to maintain

**Custom theme:**
```javascript
colors: {
  primary: { 50-900 shades },
  secondary: { 50-900 shades },
}
```

### Component Library

Custom components in `/components/ui/`:
- Button
- Card
- Input
- Modal
- Checkbox
- ProgressBar

**Design system:** Clean, modern, health-focused

## 🧪 Testing Strategy

### Recommended Testing Stack

1. **Unit Tests:** Jest + React Testing Library
2. **Integration Tests:** Playwright or Cypress
3. **E2E Tests:** Playwright
4. **API Tests:** Supertest

### Critical Paths to Test

- [ ] Sign up → Onboarding → Dashboard
- [ ] Task completion → Points earned
- [ ] Mood check-in flow
- [ ] Admin content creation
- [ ] Webhook processing

## 🐛 Debugging Tips

### Common Issues & Solutions

**1. "Can't connect to Supabase"**
```
Check: Environment variables set correctly
Check: Supabase project is running
Check: Network connectivity
```

**2. "RLS prevents data access"**
```
Check: User is authenticated
Check: RLS policies allow operation
Check: User ID matches in query
```

**3. "Push notifications not working"**
```
Check: HTTPS enabled (required)
Check: VAPID keys correct
Check: Service worker registered
Check: User granted permission
```

**4. "Webhook not triggering"**
```
Check: URL is correct
Check: Webhook secret matches
Check: Payload format correct
Check: Check server logs
```

## 📈 Scaling Considerations

### Current Limits

- Supabase Free Tier: 500 MB database, 2 GB bandwidth
- Vercel Free: 100 GB bandwidth/month
- Expected: ~1000 users on free tier

### Scaling Strategy

**Phase 1** (0-1000 users):
- Current setup sufficient
- Free tiers cover usage

**Phase 2** (1000-10,000 users):
- Upgrade Supabase to Pro ($25/mo)
- Upgrade Vercel to Pro ($20/mo)
- Add CDN for static assets

**Phase 3** (10,000+ users):
- Consider dedicated database
- Implement Redis for caching
- Add load balancer
- Separate media storage (S3/Cloudflare)

### Database Optimization

When scaling:
1. Add more indexes
2. Implement database partitioning
3. Archive old data (>90 days)
4. Use read replicas for analytics

## 🔧 Development Workflow

### Recommended Git Flow

```
main (production)
  ↑
staging (test environment)
  ↑
develop (integration)
  ↑
feature/* (individual features)
```

### Environment Setup

1. **Local:** `.env.local`
2. **Staging:** Vercel preview deployments
3. **Production:** Vercel production

### Code Quality

- **TypeScript:** Strict mode enabled
- **ESLint:** Next.js config
- **Prettier:** Format on save
- **Husky:** Pre-commit hooks (future)

## 📊 Analytics & Monitoring

### Recommended Metrics

**User Metrics:**
- Sign-up conversion rate
- Onboarding completion rate
- Daily active users (DAU)
- Task completion rates
- Day 30 completion rate

**Technical Metrics:**
- Page load time
- API response time
- Error rate
- Uptime percentage
- Database query performance

### Monitoring Stack

1. **Application:** Sentry for errors
2. **Infrastructure:** Vercel Analytics
3. **Database:** Supabase Dashboard
4. **User Behavior:** Plausible/Google Analytics

## 🚦 Feature Flags (Future)

For gradual rollouts:

```typescript
const FEATURE_FLAGS = {
  NEW_DASHBOARD: process.env.NEXT_PUBLIC_NEW_DASHBOARD === 'true',
  AI_CHAT: process.env.NEXT_PUBLIC_AI_CHAT === 'true',
}
```

## 🤖 AI Integration (Future Enhancement)

Potential additions:
- ChatGPT integration for Lean responses
- Personalized meal planning with AI
- Image recognition for food logging
- Natural language task input

## 📝 Code Style Guide

### File Structure

```
components/
  ├── ui/           # Reusable UI components
  ├── dashboard/    # Dashboard-specific
  ├── onboarding/   # Onboarding steps
  └── admin/        # Admin components

lib/
  ├── supabase/     # Database clients
  ├── hooks/        # Custom React hooks
  ├── utils.ts      # Helper functions
  ├── types.ts      # TypeScript types
  └── constants.ts  # App constants
```

### Naming Conventions

- **Components:** PascalCase (`DailyChecklist`)
- **Hooks:** camelCase with `use` prefix (`useUser`)
- **Utils:** camelCase (`calculateBMI`)
- **Constants:** UPPER_SNAKE_CASE (`BONUS_UNLOCK_THRESHOLD`)
- **Types:** PascalCase (`UserProfileType`)

### Import Order

1. React/Next imports
2. External libraries
3. Internal components
4. Utils and types
5. Styles

## 🎯 Future Roadmap

### v1.1 - Enhanced Features
- [ ] Advanced analytics dashboard
- [ ] Progress photos tracking
- [ ] Social sharing
- [ ] Achievements system
- [ ] Workout videos integration

### v1.2 - AI Enhancements
- [ ] AI chat with Lean
- [ ] Personalized meal generation
- [ ] Smart notifications based on behavior

### v1.3 - Community
- [ ] User forums
- [ ] Success stories
- [ ] Group challenges
- [ ] Coach matching

---

**Last Updated:** December 2024
**Maintained By:** SlimPath AI Development Team

