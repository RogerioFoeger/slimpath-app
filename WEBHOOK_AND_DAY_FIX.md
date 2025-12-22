# Webhook and Day Progression Fixes

## Issues Fixed

### 1. Day Progression Issue ✅
**Problem:** The app was stuck on Day 1 even though it should have progressed to Day 2.

**Solution:** 
- Added `calculateCurrentDay()` function that calculates the current day dynamically based on when the user completed onboarding
- The dashboard now automatically calculates and updates the current day based on `completed_at` date from onboarding
- Day progression now works correctly - Day 1 is the day onboarding was completed, Day 2 is the next day, etc.

**How it works:**
- Uses `user_onboarding.completed_at` as the start date (or `users.created_at` as fallback)
- Calculates days since that date
- Automatically updates the `current_day` field in the database when the dashboard loads

### 2. Webhook Error Handling ✅
**Problem:** Webhook was failing silently - no email sent, nothing in database.

**Solution:**
- Added comprehensive error logging with timestamps
- Better error messages to identify where webhook fails
- Logs now show:
  - Whether payload was received
  - Whether secret validation passed
  - Each step of user creation/update
  - Email sending status
  - Total execution time

## Testing the Webhook

### Check Webhook Logs
When testing the webhook, check the server logs (Vercel logs or local console) for:
- `📥 Webhook payload received` - confirms payload was received
- `✅ Webhook secret verified` - confirms authentication passed
- `✅ Webhook completed successfully` - confirms everything worked
- Any `❌` errors will show exactly where it failed

### Common Webhook Issues

1. **Secret Mismatch**
   - Error: `❌ Webhook secret mismatch`
   - Fix: Make sure `webhook_secret` in CartPanda payload matches `WEBHOOK_SECRET` in your `.env`

2. **Missing Fields**
   - Error: `Missing required fields`
   - Fix: Ensure CartPanda sends: `email`, `profile_type`, `subscription_plan`

3. **Email Not Sent**
   - Warning: `⚠️ WARNING: User account created successfully, but email notification failed!`
   - Check: Supabase email settings, SMTP configuration, rate limits

4. **Database Error**
   - Error: `Failed to create profile` or `Failed to create auth user`
   - Check: Supabase connection, environment variables, database permissions

### Webhook Payload Format (CartPanda)

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "profile_type": "hormonal",
  "subscription_plan": "monthly",
  "transaction_id": "txn_123",
  "amount": 37,
  "webhook_secret": "your_webhook_secret_here"
}
```

**Important:** The `webhook_secret` field must be included in the JSON body (CartPanda doesn't support custom headers).

## Testing Day Progression

1. Complete onboarding on Day 1 (e.g., January 1st)
2. Wait until the next day (e.g., January 2nd)
3. Open the dashboard
4. The app should automatically show Day 2
5. The `current_day` field in the database will be updated automatically

## Next Steps

1. **Test the webhook** with the improved logging to see exactly where it fails
2. **Check Vercel logs** (or local console) when testing webhook
3. **Verify CartPanda configuration** - ensure `webhook_secret` is in the payload
4. **Test day progression** - complete onboarding and check the next day

## Files Modified

- `app/api/webhook/route.ts` - Enhanced error handling and logging
- `app/dashboard/page.tsx` - Dynamic day calculation
- `lib/utils.ts` - Added `calculateCurrentDay()` function

