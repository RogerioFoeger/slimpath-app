# 🔧 Fix: Payment Completed But User Not Registered

## Problem
✅ Payment was completed on CartPanda  
❌ User account was **NOT created** in Supabase

This means the CartPanda webhook either:
- Wasn't configured
- Wasn't sent
- Failed (wrong secret, missing fields, etc.)

## Immediate Solution: Manually Create Account

### Quick Fix (5 minutes)

**Option 1: Use Manual Script (Recommended)**

1. **Get your webhook secret:**
   ```bash
   # From Vercel Dashboard → Settings → Environment Variables
   # Or from your .env.local file
   ```

2. **Set environment variable:**
   ```bash
   # Mac/Linux:
   export WEBHOOK_SECRET="your-webhook-secret-here"
   
   # Windows PowerShell:
   $env:WEBHOOK_SECRET="your-webhook-secret-here"
   
   # Windows CMD:
   set WEBHOOK_SECRET=your-webhook-secret-here
   ```

3. **Run the manual creation script:**
   ```bash
   cd SLIMPATH
   node manual-create-account.js "user@example.com" "User Name" "hormonal" "monthly" "12" 37
   ```

   **Replace with actual values:**
   - `user@example.com` → User's email from CartPanda order
   - `User Name` → User's name from CartPanda order  
   - `hormonal` → Profile type (see valid types below)
   - `monthly` → Subscription plan (`monthly` or `annual`)
   - `12` → Order number from CartPanda
   - `37` → Payment amount

4. **Check the output:**
   - ✅ Success → Account created! Check user's email for magic link
   - ❌ Error → See error message and fix accordingly

**Valid Profile Types:**
- `hormonal`
- `inflammatory`
- `cortisol`
- `metabolic`
- `retention`
- `insulinic`

**Valid Subscription Plans:**
- `monthly`
- `annual`

### Option 2: Use curl Command

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

Replace all values with actual data from the CartPanda order.

## Verify Account Was Created

After running the script:

1. **Check Supabase Dashboard:**
   - Go to Authentication → Users
   - Search for the user's email
   - ✅ User should exist

2. **Check Users Table:**
   - Go to Table Editor → users
   - Find the user's email
   - Verify `profile_type` and `subscription_plan` are set

3. **Test Login:**
   - Go to https://slimpathai.com/login
   - Click "Forgot password?"
   - Enter user's email
   - If reset email is sent → ✅ Account exists!

## Fix CartPanda Webhook (Prevent Future Issues)

To prevent this from happening again:

### Step 1: Get Webhook Secret

1. Go to **Vercel Dashboard** (or your hosting platform)
2. Navigate to **Settings** → **Environment Variables**
3. Find `WEBHOOK_SECRET` and copy its value

### Step 2: Configure CartPanda Webhook

1. **Log into CartPanda Dashboard**
2. Go to **Settings** → **Webhooks** (or **Integrations** → **Webhooks**)
3. **Add New Webhook:**
   - **Name:** SlimPath AI Account Creation
   - **URL:** `https://slimpathai.com/api/webhook`
   - **Method:** POST
   - **Trigger:** On successful payment/order completion
   - **Content-Type:** application/json

### Step 3: Configure Webhook Payload

CartPanda needs to send this JSON in the request body:

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

**⚠️ CRITICAL:**
- ✅ `webhook_secret` **MUST** be in the JSON body (CartPanda doesn't support custom headers)
- ✅ `webhook_secret` **MUST** match your `WEBHOOK_SECRET` environment variable exactly
- ✅ `email`, `profile_type`, and `subscription_plan` are **REQUIRED**
- ✅ `profile_type` must be lowercase and one of the valid types
- ✅ `subscription_plan` must be lowercase: "monthly" or "annual"

**Note:** You may need to:
- Set `profile_type` based on a quiz result or product variant
- Set `subscription_plan` based on which product was purchased
- Use CartPanda's variable syntax (e.g., `{{customer_email}}`)

### Step 4: Test Webhook

1. Make a **test payment** in CartPanda (use test mode)
2. **Check CartPanda webhook logs:**
   - Go to webhook settings
   - View delivery logs
   - Check if webhook was sent
   - Check response code (should be 200)

3. **Check your app logs:**
   - Vercel Dashboard → Functions → Logs
   - Look for `/api/webhook` requests
   - Check for errors

4. **Verify in Supabase:**
   - Check if user was created
   - Verify all fields are correct

## Troubleshooting

### Error: "Webhook secret mismatch"
**Cause:** `webhook_secret` in CartPanda doesn't match `WEBHOOK_SECRET` in your app  
**Fix:**
1. Copy `WEBHOOK_SECRET` from Vercel environment variables
2. Paste it exactly into CartPanda webhook payload
3. Make sure there are no extra spaces or characters

### Error: "Missing required fields"
**Cause:** CartPanda isn't sending `email`, `profile_type`, or `subscription_plan`  
**Fix:**
1. Check CartPanda webhook payload configuration
2. Verify all required fields are included
3. Use CartPanda variables like `{{customer_email}}`

### Error: "Invalid profile_type" or "Invalid subscription_plan"
**Cause:** Value doesn't match expected enum values  
**Fix:**
- `profile_type` must be: hormonal, inflammatory, cortisol, metabolic, retention, insulinic
- `subscription_plan` must be: monthly or annual
- All values must be lowercase

### Webhook Not Being Sent
**Cause:** CartPanda webhook not configured or not triggered  
**Fix:**
1. Check webhook is enabled in CartPanda
2. Verify trigger conditions (should fire on successful payment)
3. Check webhook URL is correct
4. View CartPanda webhook delivery logs

### Account Created But No Email
**Cause:** Email sending failed (Supabase email config issue)  
**Fix:**
1. User can use "Forgot Password" to access account
2. Check Supabase email settings
3. Check email templates are configured

## Checklist

After fixing:

- [ ] Manually created the account for the current payment
- [ ] Verified account exists in Supabase
- [ ] User can access account (via magic link or forgot password)
- [ ] CartPanda webhook is configured
- [ ] Webhook secret matches environment variable
- [ ] Webhook payload includes all required fields
- [ ] Tested webhook with a test payment
- [ ] Verified test payment created account successfully

## Prevention

1. **Monitor webhook logs** regularly
2. **Set up alerts** for webhook failures
3. **Test webhooks** after any configuration changes
4. **Document webhook config** for your team
5. **Have a backup plan** (manual account creation script ready)

---

**Need Help?** Check:
- CartPanda webhook delivery logs
- Vercel function logs (`/api/webhook`)
- Supabase authentication logs

