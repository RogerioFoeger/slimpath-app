# 📧 How to Sign Up After CartPanda Payment

## What Should Happen Automatically

After you complete a payment on CartPanda, the following should happen **automatically**:

1. ✅ **CartPanda sends webhook** → Your account is created in SlimPath AI
2. ✅ **Magic link email sent** → Check your email inbox (and spam folder)
3. ✅ **Click the magic link** → You'll be redirected to the onboarding page
4. ✅ **Complete onboarding** → Start using the app!

## Step-by-Step: What to Do Now

### Step 1: Check Your Email 📬

**Look for an email from SlimPath AI** with subject like:
- "Your Magic Link"
- "Sign in to SlimPath AI"
- "Welcome to SlimPath AI"

**Check these locations:**
- ✅ Inbox
- ✅ Spam/Junk folder
- ✅ Promotions tab (Gmail)
- ✅ All Mail folder

**The email should contain:**
- A clickable link that says "Sign in" or "Access your account"
- The link will take you to `https://slimpathai.com/onboarding` (or your app URL)

### Step 2: If You Received the Email ✉️

1. **Click the magic link** in the email
2. You'll be automatically logged in
3. You'll be taken to the **onboarding page** (7 steps)
4. Complete the onboarding to start using the app!

### Step 3: If You DIDN'T Receive the Email ❌

If you don't see the email after 5-10 minutes, try these options:

#### Option A: Try Manual Login (If Account Was Created)

1. Go to: **https://slimpathai.com/login** (or your app URL)
2. Enter your **email address** (the one you used for payment)
3. Click **"Forgot Password"** or **"Sign In"**
4. If your account exists, you can:
   - Request a password reset email
   - Or try signing in (if a password was set)

#### Option B: Check if Webhook Was Triggered

The webhook might not have been sent. This can happen if:
- CartPanda webhook is not configured
- Webhook URL is incorrect
- Webhook secret doesn't match

**To verify:**
1. Check CartPanda dashboard → Webhooks section
2. Look for webhook delivery logs
3. Verify the webhook URL is: `https://slimpathai.com/api/webhook` (or your app URL)

#### Option C: Contact Support

If neither option works, contact support with:
- Your email address
- Transaction ID from CartPanda
- Payment date and time

## 🔧 For Developers: Troubleshooting Webhook Issues

### Check Webhook Configuration in CartPanda

CartPanda should be configured to send webhooks to:
```
POST https://slimpathai.com/api/webhook
```

**Required Webhook Payload:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "profile_type": "hormonal",
  "subscription_plan": "monthly",
  "transaction_id": "txn_123",
  "amount": 37,
  "webhook_secret": "your_webhook_secret_here"
}
```

**Important Notes:**
- ✅ `webhook_secret` must be included in the JSON body (CartPanda doesn't support custom headers)
- ✅ `webhook_secret` must match the `WEBHOOK_SECRET` environment variable in your app
- ✅ All fields are required: `email`, `profile_type`, `subscription_plan`

### Verify Webhook Was Received

Check your app logs (Vercel dashboard or server logs) for:
- `📥 Webhook payload received` - Webhook was received
- `✅ Webhook secret verified` - Authentication passed
- `✅ User created successfully` - Account was created
- `✅ Magic link email sent` - Email was sent

### Test Webhook Manually

If you need to test the webhook manually, you can use the test script:

```bash
cd SLIMPATH
node test-cartpanda-webhook.js
```

Or manually trigger the webhook with curl:

```bash
curl -X POST https://slimpathai.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "name": "Your Name",
    "profile_type": "hormonal",
    "subscription_plan": "monthly",
    "transaction_id": "test_123",
    "amount": 0,
    "webhook_secret": "your_webhook_secret"
  }'
```

## 📋 Quick Checklist

After making a payment:

- [ ] Wait 5-10 minutes for email
- [ ] Check inbox and spam folder
- [ ] Click magic link in email
- [ ] Complete onboarding (7 steps)
- [ ] Start using the dashboard!

If email doesn't arrive:

- [ ] Try manual login at `/login`
- [ ] Check CartPanda webhook configuration
- [ ] Verify webhook was sent (check logs)
- [ ] Contact support if needed

## 🆘 Still Having Issues?

1. **Check CartPanda Dashboard:**
   - Go to your CartPanda account
   - Check webhook settings
   - Verify webhook URL is correct
   - Check webhook delivery logs

2. **Verify Environment Variables:**
   - `WEBHOOK_SECRET` is set correctly
   - `NEXT_PUBLIC_SUPABASE_URL` is configured
   - `SUPABASE_SERVICE_ROLE_KEY` is set
   - Email settings in Supabase are configured

3. **Check App Logs:**
   - Vercel dashboard → Functions → Logs
   - Look for webhook-related errors
   - Check for email sending errors

## ✅ Success Indicators

You'll know everything worked when:
- ✅ You receive the magic link email
- ✅ Clicking the link logs you in automatically
- ✅ You're redirected to the onboarding page
- ✅ Your account shows the correct profile type and subscription

---

**Need Help?** Contact support with your email and transaction details.

