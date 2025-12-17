# User Data Reset Guide

This guide explains how to delete user data from your SlimPath database, allowing users to register again from scratch.

## ⚠️ Important Warnings

- **These scripts are intended for DEVELOPMENT/TESTING only**
- **All user data will be permanently deleted and CANNOT be recovered**
- **Do NOT run these scripts in production without proper backups**
- Content data (daily tasks, profile content, bonus content) will be preserved

---

## Option 1: Delete ALL Users

Use this when you want to completely reset the database and start fresh with no users.

### Steps:

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file: `supabase/reset_all_users.sql`
4. Copy and paste the entire script into the SQL Editor
5. Click **Run** or press `Ctrl+Enter`
6. Check the output messages to confirm deletion

### What Gets Deleted:
- ✅ All authentication accounts
- ✅ All user profiles
- ✅ All onboarding data
- ✅ All progress tracking
- ✅ All mood check-ins
- ✅ All push notification subscriptions
- ✅ All bonus unlocks

### What Gets Preserved:
- ✅ Daily content (tasks, messages)
- ✅ Profile-specific content (star foods, allowed foods)
- ✅ Bonus content library
- ✅ Admin users (if any)

---

## Option 2: Delete a SPECIFIC User

Use this when you only want to remove one specific user account for testing.

### Steps:

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file: `supabase/reset_single_user.sql`
4. **EDIT LINE 13** to change the email:
   ```sql
   target_email TEXT := 'user@example.com';  -- Change to your user's email
   ```
5. Copy and paste the entire script into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`
7. Check the output messages to confirm deletion

---

## Alternative Method: Using Supabase Dashboard

If you prefer a GUI approach:

### Delete a Single User:

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Find the user you want to delete
3. Click the **three dots (...)** menu next to the user
4. Select **Delete user**
5. Confirm the deletion

**Note:** This will remove the auth account, but you may need to manually clean up related data in the database tables.

---

## Verification After Deletion

After running either script, you can verify the deletion:

1. Go to **Authentication** → **Users** - should show 0 users (or expected count)
2. Go to **Table Editor** → **users** - should be empty (or show remaining users)
3. Check other user-related tables to ensure they're clean

---

## Re-registering Users

After deletion, users can:

1. Go to your app's login/signup page
2. Register with the same or different email
3. Complete the onboarding process from scratch
4. Start fresh with Day 1 content

---

## Troubleshooting

### "Cannot delete user due to foreign key constraint"

This shouldn't happen with these scripts since we use `ON DELETE CASCADE`, but if it does:

1. Check if there are any custom tables referencing users
2. Delete data from child tables first, then parent tables
3. Contact support if the issue persists

### Script runs but users remain

1. Check if you have proper permissions in Supabase
2. Ensure you're running the script as the **postgres** user or with sufficient privileges
3. Try running individual DELETE statements one at a time

### Need to keep certain test users

Modify the `reset_all_users.sql` script to exclude specific emails:

```sql
-- Instead of: DELETE FROM users;
-- Use this:
DELETE FROM users WHERE email NOT IN ('testuser@example.com', 'admin@example.com');

-- Do the same for auth.users:
DELETE FROM auth.users WHERE email NOT IN ('testuser@example.com', 'admin@example.com');
```

---

## Quick Reference

| Action | Script File | Use Case |
|--------|-------------|----------|
| Delete all users | `reset_all_users.sql` | Complete fresh start |
| Delete one user | `reset_single_user.sql` | Testing specific user flows |
| Manual deletion | Supabase Dashboard | Quick single-user removal |

---

## Safety Checklist

Before running deletion scripts:

- [ ] I am working in a **development environment**
- [ ] I have **backed up** any important data (if needed)
- [ ] I understand that **deletion is permanent**
- [ ] I have **reviewed** the script before running it
- [ ] I know which users will be affected

---

## Need Help?

If you encounter issues:

1. Check the Supabase logs for error messages
2. Review the database schema to understand relationships
3. Test with a single user first before deleting all users
4. Ensure you have proper database permissions

---

*Last Updated: December 2025*

