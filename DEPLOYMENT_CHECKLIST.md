# 🚀 SlimPath AI Deployment Checklist

Use this checklist before deploying to production.

## ✅ Pre-Deployment

### Code & Configuration

- [ ] All environment variables set in `.env.local`
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)
- [ ] Updated `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Generated and configured VAPID keys for push notifications
- [ ] Webhook secret configured and documented
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] ESLint warnings addressed
- [ ] Removed all console.logs and debug code

### Database

- [ ] Supabase project created (production instance)
- [ ] Database schema applied (`supabase/schema.sql`)
- [ ] Row Level Security (RLS) policies tested
- [ ] Seed data added (optional: `supabase/seed.sql`)
- [ ] Admin user created for CMS access
- [ ] Database backups configured

### Content

- [ ] All 30 days of content added to database
- [ ] Tasks created for each day (minimum 5 per day)
- [ ] Profile-specific nutrition content for all 6 types
- [ ] Panic button audio files uploaded and URLs configured
- [ ] Bonus content configured for 40-point unlock

### Assets

- [ ] All app icons generated (72px to 512px)
- [ ] Favicon created and added
- [ ] Logo images optimized
- [ ] PWA manifest.json configured correctly
- [ ] Service worker tested

### Testing

- [ ] Sign up flow tested end-to-end
- [ ] **NEW:** Sign up with existing email auto-signs in (see `TEST_AUTH_FIX.md`)
- [ ] Login/logout works correctly
- [ ] Onboarding completes successfully
- [ ] Dashboard loads with all features
- [ ] Task completion and points working
- [ ] Mood check-in saves correctly
- [ ] Nutrition content displays properly
- [ ] Panic button opens and plays audio
- [ ] Admin panel accessible and functional
- [ ] Mobile responsive on iOS and Android
- [ ] PWA installs on mobile devices
- [ ] Offline functionality works
- [ ] Push notifications deliver (on mobile)
- [ ] Webhook receives and processes data

### Performance

- [ ] Lighthouse score > 90 (all categories)
- [ ] Images optimized and compressed
- [ ] Code split and lazy loaded where appropriate
- [ ] Service worker caching configured
- [ ] Database queries optimized
- [ ] No memory leaks detected

### Security

- [ ] HTTPS enabled (required for PWA)
- [ ] Webhook signature verification working
- [ ] RLS policies prevent unauthorized access
- [ ] API routes protected
- [ ] Input validation on all forms
- [ ] SQL injection prevention verified
- [ ] XSS protection in place
- [ ] CORS configured correctly
- [ ] Rate limiting implemented (optional)

## 🌐 Deployment

### Domain & DNS

- [ ] Domain purchased and verified (slimpathai.com)
- [ ] DNS records configured:
  - [ ] A record pointing to hosting
  - [ ] CNAME for www subdomain
  - [ ] SSL certificate issued and active
- [ ] Email SPF/DKIM records for support@slimpathai.com
- [ ] Domain verified in hosting platform

### Hosting Platform (Vercel/Netlify/etc)

- [ ] Project connected to Git repository
- [ ] Build command configured: `npm run build`
- [ ] Environment variables set in platform:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `WEBHOOK_SECRET`
  - [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - [ ] `VAPID_PRIVATE_KEY`
  - [ ] `VAPID_EMAIL`
- [ ] Production deployment successful
- [ ] Custom domain connected and working
- [ ] SSL certificate auto-renewal enabled

### Payment Integration

- [ ] Cartpanda/Kirvano account configured
- [ ] Webhook URL set: `https://slimpathai.com/api/webhook`
- [ ] Webhook secret matches environment variable
- [ ] Test purchase completed successfully
- [ ] User creation flow verified
- [ ] Email delivery working (magic links)
- [ ] Subscription plans configured ($37/mo, $297/yr)
- [ ] Payment confirmation emails sending

### Monitoring & Analytics

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics installed (Google Analytics, Plausible)
- [ ] Uptime monitoring setup (UptimeRobot)
- [ ] Performance monitoring enabled
- [ ] Database monitoring active
- [ ] Alert notifications configured

## 📱 Post-Deployment

### Immediate Checks

- [ ] Homepage loads correctly
- [ ] Sign up creates new user
- [ ] Webhook processes payment
- [ ] Onboarding flow works
- [ ] Dashboard displays content
- [ ] All images load
- [ ] No console errors
- [ ] Mobile app installs from browser
- [ ] Push notifications work on mobile

### First Day

- [ ] Monitor error tracking for issues
- [ ] Check webhook deliveries
- [ ] Verify user sign-ups working
- [ ] Test customer support email
- [ ] Monitor performance metrics
- [ ] Check database connection stability

### First Week

- [ ] Review user feedback
- [ ] Monitor completion rates
- [ ] Check for any error patterns
- [ ] Optimize based on analytics
- [ ] Ensure cron job running (notifications)
- [ ] Verify subscription renewals working

## 🔄 Cron Jobs

- [ ] Daily notification cron configured (8:00 AM)
- [ ] Tested notification delivery
- [ ] Timezone configured correctly
- [ ] Backup jobs scheduled (if applicable)

## 📞 Support

- [ ] Support email responding: support@slimpathai.com
- [ ] FAQ page created (optional)
- [ ] Help documentation accessible
- [ ] Contact form working (optional)
- [ ] Social media links updated

## 📄 Legal & Compliance

- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Cookie notice (if applicable)
- [ ] GDPR compliance (if serving EU)
- [ ] Refund policy documented
- [ ] Copyright notices in place

## 🎉 Launch Preparation

- [ ] Marketing materials ready
- [ ] Social media announcement prepared
- [ ] Email to existing list (if any)
- [ ] Press release (optional)
- [ ] Launch date set
- [ ] Team briefed on launch plan

## 🆘 Emergency Contacts

Document these before launch:

- **Hosting Support:** _______________
- **Domain Registrar:** _______________
- **Supabase Support:** _______________
- **Payment Processor:** _______________
- **Developer Contact:** _______________

## 🔙 Rollback Plan

In case of critical issues:

1. [ ] Rollback procedure documented
2. [ ] Previous working version tagged
3. [ ] Database backup recent (< 24 hours)
4. [ ] Rollback can be executed in < 15 minutes
5. [ ] Team knows how to execute rollback

---

## ✨ Ready to Launch?

Once all items are checked:

1. **Do a final test purchase**
2. **Monitor for 1 hour post-launch**
3. **Celebrate! 🎉**

**Remember:** Launches are never perfect. Have your monitoring in place and be ready to respond quickly to issues.

---

**Last Updated:** [Add date when you complete this checklist]

**Signed Off By:** _______________

