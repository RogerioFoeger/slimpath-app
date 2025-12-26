# 🚀 CartPanda Webhook Setup - Query Parameters Only

## Overview

Since CartPanda only allows configuring a webhook URL (no body/headers), the webhook now accepts **all data via URL query parameters**.

## ✅ What's Supported

The webhook accepts data from:
- ✅ **Query Parameters** - CartPanda URL-only configuration (NEW)
- ✅ **Request Body** (JSON or Form Data) - For other platforms
- ✅ **Headers** - Backward compatibility

## 📋 CartPanda Webhook Configuration

### Step 1: Get Your Webhook Secret

1. Go to **Vercel Dashboard** → Settings → Environment Variables
2. Copy the `WEBHOOK_SECRET` value
3. Save it securely

**Example:** `slim-foeger-2026`

### Step 2: Configure CartPanda Webhook URL

In CartPanda Dashboard, configure the webhook URL with **all parameters in the query string**:

```
https://slimpathai.com/api/webhook?secret=YOUR_WEBHOOK_SECRET&email={{customer_email}}&name={{customer_name}}&profile_type=hormonal&subscription_plan=monthly&transaction_id={{order_id}}&amount={{order_total}}
```

**Replace `YOUR_WEBHOOK_SECRET` with your actual secret from Step 1.**

### Step 3: URL Parameters

| Parameter | Value | Required | Description |
|-----------|-------|----------|-------------|
| `secret` | `YOUR_WEBHOOK_SECRET` | ✅ Yes | Your webhook secret from Vercel |
| `email` | `{{customer_email}}` | ✅ Yes | Customer's email address |
| `name` | `{{customer_name}}` | No | Customer's full name |
| `profile_type` | `hormonal` | ✅ Yes | User profile type |
| `subscription_plan` | `monthly` | ✅ Yes | Subscription plan |
| `transaction_id` | `{{order_id}}` | No | Order/transaction ID |
| `amount` | `{{order_total}}` | No | Payment amount |

### Step 4: CartPanda Variable Syntax

CartPanda should support these variables in the URL:
- `{{customer_email}}` - Customer's email
- `{{customer_name}}` - Customer's name
- `{{order_id}}` - Order number
- `{{order_total}}` - Payment amount

**Note:** Check CartPanda documentation for exact variable syntax (might be `{customer_email}`, `$customer_email`, etc.)

### Step 5: Example Configuration

**Full URL Example:**
```
https://slimpathai.com/api/webhook?secret=slim-foeger-2026&email={{customer_email}}&name={{customer_name}}&profile_type=hormonal&subscription_plan=monthly&transaction_id={{order_id}}&amount={{order_total}}
```

**In CartPanda Dashboard:**
1. Go to **Settings** → **Webhooks**
2. Click **"Add Webhook"** or **"Create Webhook"**
3. **Webhook URL:** Paste the full URL above (with your actual secret)
4. **Method:** `POST` (if available)
5. **Trigger:** `On successful payment` or `Order completed`
6. **Status:** `Enabled` ✅

## 🎯 Profile Type Options

The `profile_type` parameter can be:
- `hormonal` (default)
- `inflammatory`
- `cortisol`
- `metabolic`
- `retention`
- `insulinic`

**To set dynamically:**
- If CartPanda supports conditional URLs, use product variant/option
- Or create separate webhooks for each profile type

## 📊 Subscription Plan Options

The `subscription_plan` parameter can be:
- `monthly` (default)
- `annual`

**To set dynamically:**
- Use product ID/SKU to determine plan
- Or create separate webhooks for monthly/annual

## 🧪 Testing

### Step 1: Make a Test Payment

1. Go to your CartPanda checkout page
2. Use test mode: `?test_mode=true`
3. Use test card: `4242 4242 4242 4242`
4. Complete the payment

### Step 2: Check Webhook Delivery

1. **In CartPanda Dashboard:**
   - Go to webhook settings
   - View **Delivery Logs** or **Webhook History**
   - Find the webhook for your test order
   - Check the URL that was called
   - Verify response code: (200 = success)

2. **In Vercel Logs:**
   - Go to Vercel Dashboard → Functions → Logs
   - Filter for `/api/webhook`
   - Look for:
     - `📥 Webhook payload received (Query Parameters only):` - Query params received
     - `🔐 Webhook secret found in query parameters` - Secret verified
     - `✅ Webhook secret verified` - Authentication passed
     - `✅ User created successfully` - Registration completed

### Step 3: Verify in Supabase

1. Go to **Supabase Dashboard** → Authentication → Users
2. Search for the test email
3. ✅ User should exist!

### Step 4: Check Email

1. Check your email inbox
2. Look for magic link from **SlimPath AI** (not CartPanda)
3. ✅ Magic link should be received!

## 🔍 Troubleshooting

### Webhook Not Being Sent

**Symptoms:**
- Payment completed but no user created
- No webhook in CartPanda logs

**Solutions:**
1. Verify webhook is **enabled** in CartPanda
2. Check trigger condition (should fire on successful payment)
3. Verify webhook URL is correct
4. Check if test mode triggers webhooks (some platforms disable webhooks in test mode)
5. Verify CartPanda supports variables in URLs

### Error: 401 Unauthorized

**Symptoms:**
- Webhook sent but returns 401
- Error: "Invalid webhook secret"

**Solutions:**
1. Verify `secret` parameter value matches `WEBHOOK_SECRET` in Vercel
2. Check for URL encoding issues (spaces, special characters)
3. Ensure the secret is in the URL, not duplicated
4. Check Vercel logs to see what secret was received

### Error: 400 Bad Request

**Symptoms:**
- Webhook sent but returns 400
- Error: "Missing required fields"

**Solutions:**
1. Verify URL includes these required parameters:
   - ✅ `secret`
   - ✅ `email`
   - ✅ `profile_type`
   - ✅ `subscription_plan`
2. Check CartPanda variable syntax (might need `{variable}` instead of `{{variable}}`)
3. Verify variables are available in CartPanda
4. Check Vercel logs to see which fields are missing

### URL Too Long

**Symptoms:**
- CartPanda rejects the webhook URL
- Error about URL length

**Solutions:**
1. Some platforms have URL length limits
2. Consider using only required parameters:
   ```
   https://slimpathai.com/api/webhook?secret=YOUR_SECRET&email={{customer_email}}&profile_type=hormonal&subscription_plan=monthly
   ```
3. Optional fields (`name`, `transaction_id`, `amount`) can be omitted

### Variables Not Replaced

**Symptoms:**
- Webhook received but with literal `{{customer_email}}` instead of actual email

**Solutions:**
1. Check CartPanda variable syntax (might be different)
2. Test with hardcoded values first to verify webhook works
3. Contact CartPanda support about variable syntax
4. Check CartPanda documentation for webhook variable support

## 📝 URL Encoding

**Important:** Make sure CartPanda URL-encodes the parameters properly:
- Spaces → `%20` or `+`
- Special characters → Properly encoded
- Email addresses → Should be fine, but verify

**Example of properly encoded URL:**
```
https://slimpathai.com/api/webhook?secret=slim-foeger-2026&email=user%40example.com&name=John%20Doe&profile_type=hormonal&subscription_plan=monthly
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Webhook URL includes `secret` parameter with correct value
- [ ] Webhook URL includes all required parameters: `email`, `profile_type`, `subscription_plan`
- [ ] CartPanda variables are correctly formatted
- [ ] Webhook is enabled in CartPanda
- [ ] Test payment triggers webhook (check CartPanda logs)
- [ ] Webhook returns 200 status
- [ ] User is created in Supabase
- [ ] Magic link email is sent

## 🎯 Key Points

1. **All data in URL:** CartPanda only allows URL configuration, so everything goes in query parameters
2. **Secret in URL:** The webhook secret is passed as `?secret=YOUR_SECRET`
3. **Variables:** CartPanda should replace `{{variable}}` with actual values
4. **URL Encoding:** CartPanda should automatically encode special characters
5. **Backward Compatible:** Still works with JSON/form data from other platforms

## 📊 What Gets Logged

The webhook logs will show:

- **Format:** `(Query Parameters only)` when using URL-only config
- **Secret source:** `🔐 Webhook secret found in query parameters`
- **Fields received:** Which parameters were in the URL
- **Authentication:** Whether webhook secret was verified
- **User creation:** Whether user was created or updated
- **Email sent:** Whether magic link email was sent

---

**Once configured, all future payments will automatically register users via the URL!** 🎉

