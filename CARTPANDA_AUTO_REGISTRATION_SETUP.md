# 🚀 CartPanda Automatic Registration Setup

## Goal
**Automatically register users in Supabase as soon as payment is processed on CartPanda.**

## How It Works

```
Payment Completed → CartPanda Webhook → SlimPath API → User Created in Supabase → Magic Link Email Sent
```

## Step-by-Step Setup

### Step 1: Get Your Webhook Secret

1. Go to your **Vercel Dashboard** (or hosting platform)
2. Navigate to **Settings** → **Environment Variables**
3. Find `WEBHOOK_SECRET` and **copy its value**
4. **Save this securely** - you'll need it for CartPanda configuration

### Step 2: Get Your Webhook URL

Your webhook endpoint URL is:
```
https://slimpathai.com/api/webhook
```

(Or your actual app domain if different)

### Step 3: Configure CartPanda Webhook

1. **Log into CartPanda Dashboard**
   - Go to: https://mycartpanda.com (or your CartPanda URL)
   - Navigate to your store settings

2. **Find Webhook Settings**
   - Look for: **Settings** → **Webhooks** or **Integrations** → **Webhooks**
   - Or: **Store Settings** → **Webhooks**

3. **Create New Webhook** (or edit existing)
   - **Name:** `SlimPath AI - Auto Registration`
   - **Webhook URL:** `https://slimpathai.com/api/webhook`
   - **Method:** `POST`
   - **Content-Type:** `application/json`
   - **Trigger:** `On successful payment` or `Order completed`
   - **Status:** `Enabled` ✅

### Step 4: Configure Webhook Payload

CartPanda needs to send this JSON payload in the request body:

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

**⚠️ CRITICAL CONFIGURATION:**

1. **Replace `YOUR_WEBHOOK_SECRET_HERE`** with your actual `WEBHOOK_SECRET` value from Step 1

2. **Set `profile_type`** based on:
   - Product variant/option
   - Quiz result (if you have a quiz)
   - Default value (e.g., "hormonal")
   
   **Valid values:** `hormonal`, `inflammatory`, `cortisol`, `metabolic`, `retention`, `insulinic`

3. **Set `subscription_plan`** based on:
   - Product purchased (monthly vs annual)
   - Product ID or SKU
   
   **Valid values:** `monthly` or `annual`

4. **Use CartPanda Variables:**
   - `{{customer_email}}` - Customer's email address
   - `{{customer_name}}` - Customer's full name
   - `{{order_id}}` - Order number/ID
   - `{{order_total}}` - Payment amount
   - Check CartPanda docs for other available variables

### Step 5: Test the Webhook

1. **Make a test payment** in CartPanda (use test mode)
   - Use test card: `4242 4242 4242 4242`
   - Complete the checkout process

2. **Check CartPanda Webhook Logs:**
   - Go to webhook settings
   - View delivery logs
   - Look for the webhook request
   - Check response code (should be `200`)

3. **Check Your App Logs:**
   - Vercel Dashboard → Functions → Logs
   - Look for `/api/webhook` requests
   - Check for `📥 Webhook payload received`
   - Verify no errors

4. **Verify in Supabase:**
   - Go to Authentication → Users
   - Search for the test email
   - ✅ User should exist!

5. **Check Email:**
   - Check the test email inbox
   - Look for magic link from SlimPath AI
   - ✅ Magic link should be received!

## Troubleshooting

### Webhook Not Being Sent

**Symptoms:**
- Payment completed but no user created
- No webhook in CartPanda logs

**Solutions:**
1. Verify webhook is **enabled** in CartPanda
2. Check trigger condition (should fire on successful payment)
3. Verify webhook URL is correct
4. Check CartPanda webhook delivery logs

### Error: "Webhook secret mismatch"

**Symptoms:**
- Webhook sent but returns 401 Unauthorized
- Error in logs: "Invalid webhook secret"

**Solutions:**
1. Verify `webhook_secret` in CartPanda payload **exactly matches** `WEBHOOK_SECRET` in your environment variables
2. Check for extra spaces or characters
3. Make sure it's in the JSON body (not header)

### Error: "Missing required fields"

**Symptoms:**
- Webhook sent but returns 400 Bad Request
- Error: "Missing required fields"

**Solutions:**
1. Verify CartPanda is sending:
   - ✅ `email`
   - ✅ `profile_type`
   - ✅ `subscription_plan`
2. Check CartPanda variable syntax (e.g., `{{customer_email}}`)
3. Verify variables are available in CartPanda

### Account Created But No Email

**Symptoms:**
- User exists in Supabase
- No magic link email received

**Solutions:**
1. User can use "Forgot Password" to access account
2. Check Supabase email settings
3. Check email templates are configured
4. Check spam folder

## Verification Checklist

After setup, verify everything works:

- [ ] Webhook is enabled in CartPanda
- [ ] Webhook URL is correct: `https://slimpathai.com/api/webhook`
- [ ] Webhook payload includes all required fields
- [ ] `webhook_secret` matches environment variable
- [ ] Test payment triggers webhook
- [ ] Webhook returns 200 status
- [ ] User is created in Supabase
- [ ] Magic link email is sent
- [ ] User can access account via magic link

## Monitoring

### Set Up Monitoring

1. **Check Webhook Logs Regularly:**
   - CartPanda webhook delivery logs
   - Vercel function logs (`/api/webhook`)

2. **Set Up Alerts:**
   - Monitor for webhook failures (401, 400, 500 errors)
   - Alert if no webhooks received in X hours

3. **Verify New Users:**
   - Check Supabase users table regularly
   - Compare with CartPanda orders

## Advanced Configuration

### Dynamic Profile Type

If you have a quiz or product variants, you can set `profile_type` dynamically:

```json
{
  "profile_type": "{{product_variant}}",
  ...
}
```

Or use conditional logic in CartPanda (if supported).

### Multiple Products

If you have multiple products with different profile types:

1. Create separate webhooks for each product, OR
2. Use product ID/SKU to determine profile type in the payload

### Subscription Plan Detection

Set `subscription_plan` based on product:

```json
{
  "subscription_plan": "{{product_sku}}",
  ...
}
```

Or use product price to determine (e.g., $37 = monthly, $297 = annual).

## Production Checklist

Before going live:

- [ ] Webhook configured in CartPanda
- [ ] Webhook secret is secure (not exposed)
- [ ] Test payment works end-to-end
- [ ] All required fields are included
- [ ] Profile type logic is correct
- [ ] Subscription plan detection works
- [ ] Email delivery is working
- [ ] Monitoring is set up
- [ ] Error handling is tested

## Support

If you're still having issues:

1. **Check CartPanda Documentation:**
   - Webhook setup guide
   - Available variables
   - Trigger conditions

2. **Check Your Logs:**
   - Vercel function logs
   - Supabase logs
   - CartPanda webhook logs

3. **Test Manually:**
   - Use `manual-create-account.js` script
   - Use `test-cartpanda-webhook.js` script

---

**Once configured correctly, users will be automatically registered in Supabase as soon as payment is processed!** 🎉

