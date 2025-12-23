# 🔧 Manual Account Creation After Payment

## Problem
Payment was completed on CartPanda, but the user account was **not created** in Supabase. This means the webhook from CartPanda either:
- ❌ Wasn't sent at all
- ❌ Was sent but failed (wrong secret, missing fields, etc.)
- ❌ Was sent but endpoint had an error

## Quick Solution: Manually Trigger Webhook

### Option 1: Use Test Script (Easiest)

1. **Get your webhook secret** from environment variables (Vercel dashboard or `.env.local`)

2. **Run the test script** with the payment data:

```bash
cd SLIMPATH
node test-cartpanda-webhook.js
```

3. **Or manually send webhook** with curl:

```bash
curl -X POST https://slimpathai.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "User Name",
    "profile_type": "hormonal",
    "subscription_plan": "monthly",
    "transaction_id": "12",
    "amount": 37,
    "webhook_secret": "YOUR_WEBHOOK_SECRET_HERE"
  }'
```

**Replace:**
- `user@example.com` → User's email from CartPanda order
- `User Name` → User's name from CartPanda order
- `hormonal` → Profile type (hormonal, inflammatory, cortisol, metabolic, retention, insulinic)
- `monthly` → Subscription plan (monthly or annual)
- `12` → Order number from CartPanda
- `37` → Payment amount
- `YOUR_WEBHOOK_SECRET_HERE` → Your actual webhook secret

### Option 2: Use Test Signup Page

1. Go to: `https://slimpathai.com/test-signup` (if available)
2. Fill in the user's information
3. **Important:** You need to modify the page to include `webhook_secret` in the payload

## Fix CartPanda Webhook Configuration

To prevent this from happening again, configure CartPanda properly:

### Step 1: Get Webhook Secret

1. Go to your **Vercel Dashboard** (or wherever your app is hosted)
2. Navigate to **Settings** → **Environment Variables**
3. Find `WEBHOOK_SECRET` and copy its value

### Step 2: Configure CartPanda Webhook

1. **Log into CartPanda Dashboard**
2. Go to **Settings** → **Webhooks** (or **Integrations**)
3. **Add/Edit Webhook:**
   - **Webhook URL:** `https://slimpathai.com/api/webhook`
   - **Trigger:** On successful payment/order completion
   - **Method:** POST
   - **Content-Type:** application/json

### Step 3: Configure Webhook Payload

CartPanda needs to send this JSON payload:

```json
{
  "email": "{{customer_email}}",
  "name": "{{customer_name}}",
  "profile_type": "hormonal",
  "subscription_plan": "monthly",
  "transaction_id": "{{order_id}}",
  "amount": {{order_total}},
  "webhook_secret": "YOUR_WEBHOOK_SECRET_HERE"
}
```

**Important Notes:**
- ✅ `webhook_secret` **MUST** be included in the JSON body (CartPanda doesn't support custom headers)
- ✅ `webhook_secret` **MUST** match your `WEBHOOK_SECRET` environment variable exactly
- ✅ `email`, `profile_type`, and `subscription_plan` are **REQUIRED**
- ✅ `profile_type` must be one of: hormonal, inflammatory, cortisol, metabolic, retention, insulinic
- ✅ `subscription_plan` must be: "monthly" or "annual"

### Step 4: Test Webhook

1. Make a test payment in CartPanda
2. Check CartPanda webhook delivery logs
3. Check your app logs (Vercel Functions → Logs)
4. Verify user was created in Supabase

## Troubleshooting

### Issue: "Webhook secret mismatch"
**Solution:** 
- Verify `webhook_secret` in CartPanda payload matches `WEBHOOK_SECRET` in your environment variables
- Make sure there are no extra spaces or characters

### Issue: "Missing required fields"
**Solution:**
- Verify CartPanda is sending: `email`, `profile_type`, `subscription_plan`
- Check CartPanda webhook payload configuration

### Issue: "User already exists"
**Solution:**
- Account was created but email failed
- User can use "Forgot Password" to access account

### Issue: Webhook not being sent
**Solution:**
- Check CartPanda webhook is enabled
- Verify webhook URL is correct
- Check CartPanda webhook delivery logs
- Verify trigger conditions are set correctly

## Verify Account Creation

After manually triggering the webhook, verify the account was created:

1. **Check Supabase Dashboard:**
   - Go to Authentication → Users
   - Look for the user's email
   - Verify user exists

2. **Check Users Table:**
   - Go to Table Editor → users
   - Look for the user's email
   - Verify profile_type and subscription_plan are set

3. **Test Login:**
   - Go to https://slimpathai.com/login
   - Try "Forgot Password" with user's email
   - If reset email is sent → Account exists!

## Next Steps

1. ✅ **Manually create the account** using one of the options above
2. ✅ **Fix CartPanda webhook configuration** to prevent future issues
3. ✅ **Test webhook** with a test payment
4. ✅ **Monitor webhook logs** to catch issues early

## Prevention

To prevent this in the future:

1. **Set up webhook monitoring** - Check logs regularly
2. **Test webhooks** - Use test payments to verify
3. **Set up alerts** - Get notified when webhooks fail
4. **Document webhook config** - Keep webhook secret and payload format documented

---

**Need Help?** Check the webhook logs in Vercel or your hosting platform to see what went wrong.

