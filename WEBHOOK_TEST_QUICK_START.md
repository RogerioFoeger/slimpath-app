# 🚀 Quick Start: Test Your Payment Integration
----------------------------
## Step 1: Get Your Webhook Secret
Go to your Vercel dashboard:
1. Visit https://vercel.com
2. Select your **slimpathaiapp** project
3. Go to **Settings** → **Environment Variables**
4. Find and copy the value of `WEBHOOK_SECRET`

## Step 2: Set the Secret

### Windows PowerShell:
```powershell
$env:WEBHOOK_SECRET="paste-your-secret-here"
```

### Windows CMD:
```cmd
set WEBHOOK_SECRET=paste-your-secret-here
```

### Mac/Linux:
```bash
export WEBHOOK_SECRET="paste-your-secret-here"
```

## Step 3: Navigate to SLIMPATH Folder
```bash
cd SLIMPATH
```

## Step 4: Run the Test
```bash
node test-cartpanda-webhook.js
```

## 🎯 What to Expect

You should see:
```
╔════════════════════════════════════════════════════════╗
║     CartPanda Webhook Integration Test Suite          ║
╚════════════════════════════════════════════════════════╝

✅ Security Test: PASSED
✅ Validation Test: PASSED
✅ Profile Types Test: PASSED
✅ Subscription Plans Test: PASSED

🎉 ALL TESTS PASSED! Payment integration is working correctly!
```

## 📧 Check Your Email

After tests complete:
- Check the email addresses shown in the output
- Look for magic link emails (check spam folder too)
- Click links to verify full flow works

## ⚠️ If Tests Fail

### Error: "Unauthorized"
→ Webhook secret is incorrect. Double-check you copied the right value from Vercel.

### Error: "Network error"
→ Check your internet connection and verify the app is deployed to Vercel.

### Error: "Failed to create user"
→ Check Supabase environment variables in Vercel (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).

## 🎓 Other Test Options

**Quick single test:**
```bash
node test-cartpanda-webhook.js quick
```

**Test only security:**
```bash
node test-cartpanda-webhook.js security
```

**Test only profile types:**
```bash
node test-cartpanda-webhook.js types
```

## 📚 More Info

Read `test-cartpanda-webhook-README.md` for detailed documentation.

## ✅ Success Checklist

- [ ] Webhook secret configured
- [ ] Test script runs without errors
- [ ] All 4 test suites pass
- [ ] Magic link emails received
- [ ] Can login to app via magic link
- [ ] Payment integration verified ✅

---

**Ready to test real payments?**
When CartPanda is set up, use their test mode with test card `4242 4242 4242 4242` to verify the full payment flow.

