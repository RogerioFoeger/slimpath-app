# 🔗 Webhook Quick Reference

## Webhook Endpoint
```
POST https://slimpathai.com/api/webhook
```

## Required Payload (CartPanda Format)

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

## Required Fields

| Field | Type | Required | Valid Values |
|-------|------|----------|--------------|
| `email` | string | ✅ Yes | Customer email |
| `profile_type` | string | ✅ Yes | `hormonal`, `inflammatory`, `cortisol`, `metabolic`, `retention`, `insulinic` |
| `subscription_plan` | string | ✅ Yes | `monthly`, `annual` |
| `webhook_secret` | string | ✅ Yes | Must match `WEBHOOK_SECRET` env var |
| `name` | string | ❌ No | Customer name |
| `transaction_id` | string | ❌ No | Order ID |
| `amount` | number | ❌ No | Payment amount |

## CartPanda Variables

- `{{customer_email}}` - Customer email
- `{{customer_name}}` - Customer name
- `{{order_id}}` - Order number
- `{{order_total}}` - Payment amount

## Verification

```bash
# Test webhook setup
node verify-webhook-setup.js

# Test webhook manually
node test-cartpanda-webhook.js

# Create account manually (if webhook fails)
node manual-create-account.js "email@example.com" "Name" "hormonal" "monthly" "order_id" 37
```

## Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Wrong `webhook_secret` | Match `WEBHOOK_SECRET` env var |
| 400 Bad Request | Missing required fields | Include `email`, `profile_type`, `subscription_plan` |
| 500 Server Error | Supabase config issue | Check env variables |

## Full Documentation

- **Setup Guide:** [`CARTPANDA_AUTO_REGISTRATION_SETUP.md`](./CARTPANDA_AUTO_REGISTRATION_SETUP.md)
- **Troubleshooting:** [`FIX_WEBHOOK_NOT_TRIGGERED.md`](./FIX_WEBHOOK_NOT_TRIGGERED.md)
- **Manual Creation:** [`MANUAL_ACCOUNT_CREATION.md`](./MANUAL_ACCOUNT_CREATION.md)

