# 🔍 Troubleshooting: Payment Completed But No Registration

## Problem
✅ Payment completed on CartPanda  
❌ No magic link email received  
❌ User not registered in Supabase  

## Root Cause
**CartPanda webhook is not being sent or is failing.**

The webhook is what triggers account creation. If it's not configured or not working, no account will be created.

## Quick Diagnosis

### Step 1: Check CartPanda Webhook Configuration

1. **Log into CartPanda Dashboard**
   - Go to: https://mycartpanda.com
   - Navigate to your store settings

2. **Check Webhook Settings**
   - Go to: **Settings** → **Webhooks** (or **Integrations** → **Webhooks**)
   - Look for a webhook configured for your store

3. **Verify Webhook is Configured:**
   - ✅ Webhook exists and is **enabled**
   - ✅ Webhook URL is: `https://slimpathai.com/api/webhook`
   - ✅ Trigger is set to: **On successful payment** or **Order completed**
   - ✅ Method is: **POST**

**If webhook is NOT configured → This is the problem!**  
**Follow the setup guide below.**

### Step 2: Check Webhook Delivery Logs

1. **In CartPanda Dashboard:**
   - Go to webhook settings
   - Look for **"Delivery Logs"** or **"Webhook History"**
   - Find the webhook for Order #13
   - Check:
     - ✅ Was webhook sent? (Yes/No)
     - ✅ What was the response code? (200 = success, 401/400/500 = error)
     - ✅ What was the response message?

2. **Check Your App Logs:**
   - Go to Vercel Dashboard → Functions → Logs
   - Filter for `/api/webhook`
   - Look for requests around the time of Order #13
   - Check for errors

### Step 3: Verify Webhook Endpoint

Test if your webhook endpoint is working:

```bash
cd SLIMPATH
node verify-webhook-setup.js
```

This will test if the webhook can receive requests and create accounts.

## Solutions

### Solution 1: Configure CartPanda Webhook (If Not Configured)

**This is the most common issue!**

1. **Get Your Webhook Secret:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Copy `WEBHOOK_SECRET` value

2. **Configure CartPanda Webhook:**
   - Log into CartPanda Dashboard
   - Go to Settings → Webhooks
   - Click **"Add Webhook"** or **"Create Webhook"**
   - Configure:
     - **Name:** `SlimPath AI - Auto Registration`
     - **URL:** `https://slimpathai.com/api/webhook`
     - **Method:** `POST`
     - **Content-Type:** `application/json`
     - **Trigger:** `On successful payment` or `Order completed`
     - **Status:** `Enabled` ✅

3. **Set Webhook Payload:**
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

   **Replace `YOUR_WEBHOOK_SECRET_HERE` with your actual secret from Step 1.**

4. **Save and Test:**
   - Save the webhook configuration
   - Make a test payment
   - Check webhook delivery logs
   - Verify user is created in Supabase

**📖 Full Setup Guide:** See [`CARTPANDA_AUTO_REGISTRATION_SETUP.md`](./CARTPANDA_AUTO_REGISTRATION_SETUP.md)

### Solution 2: Fix Webhook Errors (If Webhook is Configured But Failing)

#### Error: 401 Unauthorized
**Cause:** `webhook_secret` doesn't match  
**Fix:**
1. Verify `webhook_secret` in CartPanda payload matches `WEBHOOK_SECRET` in Vercel
2. Check for extra spaces or characters
3. Make sure it's in the JSON body (not header)

#### Error: 400 Bad Request
**Cause:** Missing required fields  
**Fix:**
1. Verify CartPanda sends: `email`, `profile_type`, `subscription_plan`
2. Check CartPanda variable syntax (e.g., `{{customer_email}}`)
3. Verify all required fields are included

#### Error: 500 Internal Server Error
**Cause:** Server configuration issue  
**Fix:**
1. Check Supabase environment variables in Vercel
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is set
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
4. Check Vercel function logs for detailed error

### Solution 3: Manually Create Account (Temporary Fix)

If you need immediate access while fixing the webhook:

```bash
cd SLIMPATH
export WEBHOOK_SECRET="your-webhook-secret"
node manual-create-account.js "serhii@example.com" "Serhii" "hormonal" "monthly" "13" 37
```

Replace:
- `serhii@example.com` with the actual email from Order #13
- `Serhii` with the actual name
- `13` with the order number
- `37` with the payment amount

## Verification Checklist

After fixing, verify:

- [ ] CartPanda webhook is configured
- [ ] Webhook is enabled
- [ ] Webhook URL is correct: `https://slimpathai.com/api/webhook`
- [ ] Webhook payload includes all required fields
- [ ] `webhook_secret` matches environment variable
- [ ] Test payment triggers webhook
- [ ] Webhook returns 200 status
- [ ] User is created in Supabase
- [ ] Magic link email is sent

## Common Issues

### Issue: "Webhook not configured"
**Solution:** Follow Solution 1 above to configure CartPanda webhook

### Issue: "Webhook configured but not triggering"
**Solution:**
1. Check trigger condition (should fire on successful payment)
2. Verify webhook is enabled
3. Check CartPanda webhook delivery logs
4. Make sure you're using test mode correctly

### Issue: "Webhook sent but user not created"
**Solution:**
1. Check webhook response code in CartPanda logs
2. Check Vercel function logs for errors
3. Verify all required fields are in payload
4. Check Supabase environment variables

### Issue: "User created but no email"
**Solution:**
1. User can use "Forgot Password" to access account
2. Check Supabase email settings
3. Check spam folder
4. Verify email templates are configured

## Next Steps

1. **Check CartPanda webhook configuration** (most likely issue)
2. **Check webhook delivery logs** in CartPanda
3. **Check app logs** in Vercel
4. **Test webhook** using `verify-webhook-setup.js`
5. **Manually create account** if needed (temporary fix)
6. **Fix webhook configuration** to prevent future issues

## Documentation

- **📖 Complete Setup:** [`CARTPANDA_AUTO_REGISTRATION_SETUP.md`](./CARTPANDA_AUTO_REGISTRATION_SETUP.md)
- **🔧 Troubleshooting:** [`FIX_WEBHOOK_NOT_TRIGGERED.md`](./FIX_WEBHOOK_NOT_TRIGGERED.md)
- **⚡ Quick Reference:** [`WEBHOOK_QUICK_REFERENCE.md`](./WEBHOOK_QUICK_REFERENCE.md)

---

**Most likely issue:** CartPanda webhook is not configured. Follow Solution 1 to set it up!

