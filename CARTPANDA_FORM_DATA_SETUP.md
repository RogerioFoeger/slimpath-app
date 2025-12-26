# 🚀 CartPanda Webhook Setup - Form Data Format

## Overview

The webhook now supports **both JSON and form data** formats, making it compatible with CartPanda's limitations.

## ✅ What's Supported

The webhook accepts:
- ✅ **JSON** (`application/json`) - Original format
- ✅ **Form Data** (`application/x-www-form-urlencoded`) - CartPanda compatible
- ✅ **Multipart Form Data** (`multipart/form-data`) - Also supported
- ✅ **Auto-detection** - If content-type is missing, tries both formats

## 📋 CartPanda Webhook Configuration

### Step 1: Get Your Webhook Secret

1. Go to **Vercel Dashboard** → Settings → Environment Variables
2. Copy the `WEBHOOK_SECRET` value
3. Save it securely

### Step 2: Configure CartPanda Webhook

1. **Log into CartPanda Dashboard**
   - Go to: https://mycartpanda.com
   - Navigate to your store settings

2. **Find Webhook Settings**
   - Go to: **Settings** → **Webhooks** (or **Integrations** → **Webhooks**)

3. **Create New Webhook**
   - Click **"Add Webhook"** or **"Create Webhook"**

### Step 3: Webhook Settings

Configure with these settings:

- **Name:** `SlimPath AI - Auto Registration`
- **Webhook URL:** `https://slimpathai.com/api/webhook`
- **Method:** `POST`
- **Content-Type:** 
  - Use whatever CartPanda supports (form data, URL-encoded, etc.)
  - The webhook will auto-detect and handle it
- **Trigger:** `On successful payment` or `Order completed`
- **Status:** `Enabled` ✅

### Step 4: Configure Webhook Fields/Payload

CartPanda should send these fields (as form data or URL-encoded):

| Field Name | Value | Required |
|------------|-------|----------|
| `email` | `{{customer_email}}` | ✅ Yes |
| `name` | `{{customer_name}}` | No |
| `profile_type` | `hormonal` | ✅ Yes |
| `subscription_plan` | `monthly` | ✅ Yes |
| `transaction_id` | `{{order_id}}` | No |
| `amount` | `{{order_total}}` | No |
| `webhook_secret` | `YOUR_WEBHOOK_SECRET_HERE` | ✅ Yes |

**Important Notes:**

1. **Replace `YOUR_WEBHOOK_SECRET_HERE`** with your actual `WEBHOOK_SECRET` from Step 1

2. **Field Names:** Use the exact field names shown above (lowercase with underscores)

3. **CartPanda Variables:** 
   - `{{customer_email}}` - Customer's email
   - `{{customer_name}}` - Customer's name
   - `{{order_id}}` - Order number
   - `{{order_total}}` - Payment amount
   - Check CartPanda docs for exact variable syntax

4. **Profile Type:** 
   - Default: `hormonal`
   - Valid values: `hormonal`, `inflammatory`, `cortisol`, `metabolic`, `retention`, `insulinic`
   - Can be set based on product variant or quiz result

5. **Subscription Plan:**
   - Default: `monthly`
   - Valid values: `monthly` or `annual`
   - Can be set based on product purchased

### Step 5: Example Configuration

If CartPanda uses a field mapping interface, configure it like this:

```
Field: email          → Value: {{customer_email}}
Field: name           → Value: {{customer_name}}
Field: profile_type   → Value: hormonal
Field: subscription_plan → Value: monthly
Field: transaction_id → Value: {{order_id}}
Field: amount         → Value: {{order_total}}
Field: webhook_secret → Value: slim-foeger-2026
```

(Replace `slim-foeger-2026` with your actual webhook secret)

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
   - Check:
     - ✅ Was webhook sent? (Yes/No)
     - ✅ Response code: (200 = success)
     - ✅ Response message

2. **In Vercel Logs:**
   - Go to Vercel Dashboard → Functions → Logs
   - Filter for `/api/webhook`
   - Look for:
     - `📥 Webhook payload received (Form Data):` - Form data was received
     - `📥 Webhook payload received (JSON):` - JSON was received
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
3. Verify webhook URL is correct: `https://slimpathai.com/api/webhook`
4. Check if test mode triggers webhooks (some platforms disable webhooks in test mode)

### Error: 401 Unauthorized

**Symptoms:**
- Webhook sent but returns 401
- Error: "Invalid webhook secret"

**Solutions:**
1. Verify `webhook_secret` field value matches `WEBHOOK_SECRET` in Vercel
2. Check for extra spaces or characters
3. Ensure field name is exactly `webhook_secret` (lowercase, underscore)
4. Verify the value is being sent (check CartPanda webhook logs)

### Error: 400 Bad Request

**Symptoms:**
- Webhook sent but returns 400
- Error: "Missing required fields"

**Solutions:**
1. Verify CartPanda sends these required fields:
   - ✅ `email`
   - ✅ `profile_type`
   - ✅ `subscription_plan`
2. Check field names are correct (case-sensitive)
3. Verify CartPanda variable syntax (e.g., `{{customer_email}}`)
4. Check Vercel logs for which fields are missing

### Error: Invalid Payload Format

**Symptoms:**
- Webhook sent but returns 400
- Error: "Invalid payload format"

**Solutions:**
1. Check Content-Type header in CartPanda webhook logs
2. Verify CartPanda is sending data (not empty)
3. Check Vercel logs for detailed error message
4. Try different content-type if CartPanda allows it

## 📊 What Gets Logged

The webhook logs will show:

- **Format detected:** `(JSON)`, `(Form Data)`, or `(Auto-detected)`
- **Content-Type:** The actual content-type header received
- **Fields received:** Which fields were in the payload
- **Authentication:** Whether webhook secret was verified
- **User creation:** Whether user was created or updated
- **Email sent:** Whether magic link email was sent

## ✅ Verification Checklist

After setup, verify:

- [ ] Webhook exists in CartPanda and is enabled
- [ ] Webhook URL is correct: `https://slimpathai.com/api/webhook`
- [ ] All required fields are configured in CartPanda
- [ ] `webhook_secret` field matches environment variable
- [ ] Test payment triggers webhook (check CartPanda logs)
- [ ] Webhook returns 200 status
- [ ] User is created in Supabase
- [ ] Magic link email is sent

## 🎯 Key Differences from JSON Setup

| Aspect | JSON Format | Form Data Format |
|--------|-------------|------------------|
| Content-Type | `application/json` | `application/x-www-form-urlencoded` or `multipart/form-data` |
| Payload Structure | JSON object | Form fields |
| Field Names | Same | Same (lowercase with underscores) |
| Webhook Secret | In JSON body | In form field |
| Amount | Number | String (auto-converted to number) |

## 📝 Notes

- The webhook **automatically detects** the format based on Content-Type header
- If Content-Type is missing, it tries JSON first, then form data
- All field names are **case-sensitive** - use exact names shown
- The `amount` field is automatically converted from string to number
- The webhook secret can be in the body (form field) or header (backward compatibility)

---

**Once configured, all future payments will automatically register users!** 🎉

