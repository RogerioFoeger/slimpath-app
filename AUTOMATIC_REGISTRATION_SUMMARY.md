# ✅ Automatic Registration - Complete Guide

## Overview

**Goal:** Users are automatically registered in Supabase as soon as payment is processed on CartPanda.

## How It Works

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────┐      ┌─────────────┐
│   Payment   │  →   │   CartPanda   │  →   │   Webhook   │  →   │  Supabase │  →   │ Magic Link  │
│  Completed  │      │   Sends      │      │   API      │      │  Account  │      │   Email     │
│             │      │   Webhook    │      │   Creates  │      │  Created  │      │   Sent      │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────┘      └─────────────┘
```

## Setup Steps

### 1. Get Configuration Values

**Webhook URL:**
```
https://slimpathai.com/api/webhook
```

**Webhook Secret:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Copy `WEBHOOK_SECRET` value

### 2. Configure CartPanda

1. Log into CartPanda Dashboard
2. Go to Settings → Webhooks
3. Create/Edit webhook:
   - **URL:** `https://slimpathai.com/api/webhook`
   - **Method:** POST
   - **Trigger:** On successful payment
   - **Payload:** See below

### 3. Webhook Payload Configuration

CartPanda must send this JSON:

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

**⚠️ Critical:**
- Replace `YOUR_WEBHOOK_SECRET_HERE` with your actual secret
- `webhook_secret` must be in the JSON body (not header)
- `email`, `profile_type`, `subscription_plan` are required

### 4. Test

1. Make a test payment in CartPanda
2. Check CartPanda webhook logs (should show 200 response)
3. Verify user in Supabase (Authentication → Users)
4. Check email for magic link

## Verification Tools

### Quick Setup Check
```bash
node verify-webhook-setup.js
```
Verifies webhook endpoint is working correctly.

### Manual Test
```bash
node test-cartpanda-webhook.js
```
Tests webhook with sample data.

### Manual Account Creation (If Needed)
```bash
node manual-create-account.js "email@example.com" "Name" "hormonal" "monthly" "order_id" 37
```
Creates account manually if webhook fails.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Payment completed but no user created | Check CartPanda webhook is configured and enabled |
| 401 Unauthorized | Verify `webhook_secret` matches environment variable |
| 400 Bad Request | Check all required fields are included in payload |
| User created but no email | User can use "Forgot Password" to access account |

## Documentation

- **📖 Complete Setup:** [`CARTPANDA_AUTO_REGISTRATION_SETUP.md`](./CARTPANDA_AUTO_REGISTRATION_SETUP.md)
- **🔧 Troubleshooting:** [`FIX_WEBHOOK_NOT_TRIGGERED.md`](./FIX_WEBHOOK_NOT_TRIGGERED.md)
- **⚡ Quick Reference:** [`WEBHOOK_QUICK_REFERENCE.md`](./WEBHOOK_QUICK_REFERENCE.md)
- **🛠️ Manual Creation:** [`MANUAL_ACCOUNT_CREATION.md`](./MANUAL_ACCOUNT_CREATION.md)

## Success Criteria

✅ Payment completed  
✅ CartPanda webhook sent automatically  
✅ User account created in Supabase  
✅ Magic link email sent  
✅ User can access account  

---

**Once configured, registration happens automatically on every payment!** 🚀

