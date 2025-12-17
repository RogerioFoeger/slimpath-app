# 🔥 Quick Reset - Delete All Users

## Fastest Way to Reset All User Data

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard → Your Project → SQL Editor

### Step 2: Copy & Paste This:

```sql
-- Quick delete all users (development only!)
DELETE FROM user_bonus_unlocks;
DELETE FROM push_subscriptions;
DELETE FROM mood_checkins;
DELETE FROM user_daily_progress;
DELETE FROM user_onboarding;
DELETE FROM users;
DELETE FROM auth.users;
```

### Step 3: Run It
Click "Run" or press `Ctrl+Enter`

### Done! ✅
All users deleted. They can now register again.

---

## Delete Just One User

Replace `your-email@example.com` with the actual email:

```sql
-- Delete single user
DELETE FROM auth.users WHERE email = 'your-email@example.com';
DELETE FROM users WHERE email = 'your-email@example.com';
```

---

## Full Documentation
See `USER_DATA_RESET_GUIDE.md` for detailed instructions and options.

## Pre-made Scripts
- `supabase/reset_all_users.sql` - Delete all users (with verification)
- `supabase/reset_single_user.sql` - Delete specific user (with logging)

