// Manual Account Creation Script
// Use this to create an account after a payment when the webhook didn't trigger
// 
// Usage:
//   node manual-create-account.js "user@example.com" "User Name" "hormonal" "monthly" "12" 37
//
// Or set environment variables:
//   export WEBHOOK_SECRET="your-secret"
//   export WEBHOOK_URL="https://slimpathai.com/api/webhook"
//   node manual-create-account.js "user@example.com" "User Name" "hormonal" "monthly" "12" 37

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://slimpathai.com/api/webhook'
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

// Get arguments from command line
const args = process.argv.slice(2)

if (args.length < 4) {
  console.error('❌ Missing required arguments!')
  console.log('\n📋 Usage:')
  console.log('  node manual-create-account.js <email> <name> <profile_type> <subscription_plan> [transaction_id] [amount]')
  console.log('\n📝 Example:')
  console.log('  node manual-create-account.js "user@example.com" "John Doe" "hormonal" "monthly" "12" 37')
  console.log('\n📋 Profile Types:')
  console.log('  - hormonal')
  console.log('  - inflammatory')
  console.log('  - cortisol')
  console.log('  - metabolic')
  console.log('  - retention')
  console.log('  - insulinic')
  console.log('\n📋 Subscription Plans:')
  console.log('  - monthly')
  console.log('  - annual')
  console.log('\n🔐 Environment Variables:')
  console.log('  WEBHOOK_SECRET - Your webhook secret (required)')
  console.log('  WEBHOOK_URL - Webhook URL (default: https://slimpathai.com/api/webhook)')
  process.exit(1)
}

if (!WEBHOOK_SECRET) {
  console.error('❌ WEBHOOK_SECRET environment variable is required!')
  console.log('\n💡 Set it with:')
  console.log('  export WEBHOOK_SECRET="your-secret-here"')
  console.log('  # or on Windows:')
  console.log('  set WEBHOOK_SECRET=your-secret-here')
  process.exit(1)
}

const [email, name, profileType, subscriptionPlan, transactionId = `MANUAL_${Date.now()}`, amount = 37] = args

// Validate profile type
const validProfileTypes = ['hormonal', 'inflammatory', 'cortisol', 'metabolic', 'retention', 'insulinic']
if (!validProfileTypes.includes(profileType.toLowerCase())) {
  console.error(`❌ Invalid profile type: ${profileType}`)
  console.log(`Valid types: ${validProfileTypes.join(', ')}`)
  process.exit(1)
}

// Validate subscription plan
const validPlans = ['monthly', 'annual']
if (!validPlans.includes(subscriptionPlan.toLowerCase())) {
  console.error(`❌ Invalid subscription plan: ${subscriptionPlan}`)
  console.log(`Valid plans: ${validPlans.join(', ')}`)
  process.exit(1)
}

// Create payload (CartPanda format - webhook_secret in body)
const payload = {
  email: email,
  name: name,
  profile_type: profileType.toLowerCase(),
  subscription_plan: subscriptionPlan.toLowerCase(),
  transaction_id: transactionId,
  amount: parseFloat(amount),
  webhook_secret: WEBHOOK_SECRET
}

console.log('🚀 Manual Account Creation')
console.log('════════════════════════════════════════')
console.log(`📧 Email: ${email}`)
console.log(`👤 Name: ${name}`)
console.log(`🏷️  Profile Type: ${profileType}`)
console.log(`💳 Subscription: ${subscriptionPlan}`)
console.log(`🆔 Transaction ID: ${transactionId}`)
console.log(`💰 Amount: $${amount}`)
console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`)
console.log('════════════════════════════════════════\n')

console.log('📤 Sending webhook request...\n')

async function createAccount() {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ SUCCESS! Account created successfully!\n')
      console.log('📊 Response:')
      console.log(JSON.stringify(data, null, 2))
      console.log('\n📧 Next Steps:')
      console.log(`   1. Check email inbox for: ${email}`)
      console.log('   2. Look for magic link email from SlimPath AI')
      console.log('   3. Click the magic link to access the account')
      console.log('   4. Or go to /login and use "Forgot Password"')
      console.log(`\n👤 User ID: ${data.user_id}`)
      return true
    } else {
      console.error('❌ FAILED! Account creation failed\n')
      console.error('📊 Error Response:')
      console.error(JSON.stringify(data, null, 2))
      console.error(`\n🔍 Status Code: ${response.status}`)
      
      if (response.status === 401) {
        console.error('\n💡 Tip: Check that WEBHOOK_SECRET matches your environment variable')
      } else if (response.status === 400) {
        console.error('\n💡 Tip: Check that all required fields are provided')
      }
      return false
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message)
    console.error('\n💡 Tips:')
    console.error('   - Check your internet connection')
    console.error('   - Verify WEBHOOK_URL is correct')
    console.error('   - Check if the server is running')
    return false
  }
}

createAccount()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })

