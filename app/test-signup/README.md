# 🧪 Test Signup Page

## What is this?

This page allows you to create test user accounts **without any payment processing**.

- **Cost:** $0 (completely free)
- **Purpose:** Testing and development
- **Use:** Development environment only

## How to use

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Visit:**
   ```
   http://localhost:3000/test-signup
   ```

3. **Fill the form:**
   - Email: Your real email (to receive magic link)
   - Password: Choose a password (min 6 characters)
   - Name: Any name
   - Type: Choose metabolism type
   - Plan: Monthly or Annual

4. **Submit:**
   - User created instantly
   - Magic link sent to email
   - Password set for future logins
   - No payment required!

## What it does

This page:
- ✅ Calls `/api/webhook` directly
- ✅ Creates user in Supabase with password
- ✅ Sends magic link email
- ✅ Sets subscription with $0 payment
- ✅ Gives full app access

## Login Options

After creating a test account, you can log in using either:
1. **Magic Link:** Click the link sent to your email
2. **Email & Password:** Use the `/login` page with your email and password

This allows you to:
- Log out and log back in anytime
- Test both authentication methods
- Sign up multiple times with the same email (password will be updated)

## Security

⚠️ **IMPORTANT:** This page has no authentication!

**For development only:**
- Only works on localhost
- Never deploy to production with this page
- Delete before going live

**To remove:**
```bash
rm -rf app/test-signup
```

## Documentation

For complete testing instructions, see:
- `START_TESTING_HERE.md` - Quick start
- `FREE_TESTING_SETUP.md` - Complete guide
- `TEST_QUICK_REFERENCE.md` - Cheat sheet

## Environment Required

Make sure `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
WEBHOOK_SECRET=test-secret-123
NEXT_PUBLIC_WEBHOOK_SECRET=test-secret-123
```

## Troubleshooting

**"Webhook secret mismatch"**
- Check .env.local has both WEBHOOK_SECRET variables
- Restart dev server

**"No email received"**
- Check spam folder
- Use manual SQL creation (see TESTING_GUIDE.md)

**"Page not found"**
- Make sure dev server is running
- Clear .next cache: `rm -rf .next`

## Happy Testing! 🚀

