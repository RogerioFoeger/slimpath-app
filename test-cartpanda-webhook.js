// Test script to simulate CartPanda webhook
// This tests the payment integration without needing access to CartPanda

const WEBHOOK_URL = 'https://slimpathai.com/api/webhook'
// Get your webhook secret from Vercel environment variables
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'c10aad307d39238febc6d4085a4a86f1bdd7729df99327bfe77c50e2c4de1b23'

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

async function testWebhook(profileType = 'inflammatory', plan = 'monthly') {
  const timestamp = Date.now()
  const payload = {
    email: `test-${timestamp}@example.com`,
    name: 'Test User',
    profile_type: profileType,
    subscription_plan: plan,
    transaction_id: `TEST_${timestamp}`,
    amount: plan === 'monthly' ? 37 : 297
  }

  console.log(`${colors.cyan}🔄 Sending test webhook...${colors.reset}`)
  console.log(`${colors.blue}Payload:${colors.reset}`, JSON.stringify(payload, null, 2))
  console.log(`${colors.blue}Headers:${colors.reset}`, {
    'Content-Type': 'application/json',
    'x-webhook-secret': WEBHOOK_SECRET.substring(0, 5) + '***'
  })

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log(`${colors.green}${colors.bright}✅ SUCCESS!${colors.reset}`)
      console.log(`${colors.green}Response:${colors.reset}`, JSON.stringify(data, null, 2))
      console.log(`\n${colors.cyan}📧 Check email: ${colors.bright}${payload.email}${colors.reset}`)
      console.log(`${colors.cyan}🔗 Magic link should arrive shortly${colors.reset}`)
      console.log(`${colors.cyan}👤 User ID: ${colors.bright}${data.user_id}${colors.reset}`)
      return true
    } else {
      console.log(`${colors.red}${colors.bright}❌ FAILED!${colors.reset}`)
      console.log(`${colors.red}Status: ${response.status}${colors.reset}`)
      console.log(`${colors.red}Error:${colors.reset}`, JSON.stringify(data, null, 2))
      return false
    }
  } catch (error) {
    console.error(`${colors.red}❌ Network error: ${error.message}${colors.reset}`)
    return false
  }
}

// Test invalid webhook secret
async function testInvalidSecret() {
  console.log(`\n${colors.yellow}=== Testing Invalid Webhook Secret ===${colors.reset}`)
  
  const payload = {
    email: 'test@example.com',
    name: 'Test User',
    profile_type: 'inflammatory',
    subscription_plan: 'monthly',
    transaction_id: 'TEST_INVALID',
    amount: 37
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': 'wrong-secret'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    
    if (response.status === 401) {
      console.log(`${colors.green}✅ Security working correctly - Unauthorized response${colors.reset}`)
      return true
    } else {
      console.log(`${colors.red}❌ Security issue - Expected 401, got ${response.status}${colors.reset}`)
      return false
    }
  } catch (error) {
    console.error(`${colors.red}❌ Network error: ${error.message}${colors.reset}`)
    return false
  }
}

// Test missing required fields
async function testMissingFields() {
  console.log(`\n${colors.yellow}=== Testing Missing Required Fields ===${colors.reset}`)
  
  const payload = {
    email: 'test@example.com',
    name: 'Test User',
    // Missing profile_type and subscription_plan
    transaction_id: 'TEST_MISSING',
    amount: 37
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    
    if (response.status === 400) {
      console.log(`${colors.green}✅ Validation working correctly - Bad request response${colors.reset}`)
      console.log(`${colors.blue}Error message:${colors.reset}`, data.error)
      return true
    } else {
      console.log(`${colors.red}❌ Validation issue - Expected 400, got ${response.status}${colors.reset}`)
      return false
    }
  } catch (error) {
    console.error(`${colors.red}❌ Network error: ${error.message}${colors.reset}`)
    return false
  }
}

// Test all 6 profile types
async function testAllProfileTypes() {
  const types = ['cortisol', 'hormonal', 'inflammatory', 'metabolic', 'retention', 'insulinic']
  console.log(`\n${colors.bright}${colors.cyan}🧪 Testing webhook for all 6 profile types${colors.reset}\n`)
  
  let successCount = 0
  
  for (const type of types) {
    console.log(`\n${colors.yellow}=== Testing ${type.toUpperCase()} ===${colors.reset}`)
    const success = await testWebhook(type, 'monthly')
    if (success) successCount++
    await new Promise(r => setTimeout(r, 2000)) // Wait 2s between tests
  }
  
  console.log(`\n${colors.bright}${colors.cyan}📊 Results: ${successCount}/${types.length} profile types successful${colors.reset}`)
  return successCount === types.length
}

// Test both subscription plans
async function testSubscriptionPlans() {
  console.log(`\n${colors.bright}${colors.cyan}💳 Testing both subscription plans${colors.reset}\n`)
  
  console.log(`\n${colors.yellow}=== Testing MONTHLY Plan ===${colors.reset}`)
  const monthlySuccess = await testWebhook('inflammatory', 'monthly')
  await new Promise(r => setTimeout(r, 2000))
  
  console.log(`\n${colors.yellow}=== Testing ANNUAL Plan ===${colors.reset}`)
  const annualSuccess = await testWebhook('inflammatory', 'annual')
  
  return monthlySuccess && annualSuccess
}

// Run comprehensive test suite
async function runFullTestSuite() {
  console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}║     CartPanda Webhook Integration Test Suite          ║${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`)
  
  console.log(`${colors.blue}Webhook URL: ${colors.bright}${WEBHOOK_URL}${colors.reset}`)
  console.log(`${colors.blue}Secret configured: ${colors.bright}${WEBHOOK_SECRET ? 'Yes' : 'No'}${colors.reset}\n`)
  
  if (!WEBHOOK_SECRET || WEBHOOK_SECRET === 'your-webhook-secret-here') {
    console.log(`${colors.red}${colors.bright}⚠️  WARNING: Using placeholder webhook secret!${colors.reset}`)
    console.log(`${colors.yellow}Set WEBHOOK_SECRET environment variable or update the script${colors.reset}\n`)
  }
  
  const results = {
    security: false,
    validation: false,
    profileTypes: false,
    subscriptionPlans: false
  }
  
  // Test 1: Security
  console.log(`${colors.cyan}${colors.bright}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.cyan}${colors.bright}TEST 1: Security (Invalid Webhook Secret)${colors.reset}`)
  console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  results.security = await testInvalidSecret()
  
  // Test 2: Validation
  console.log(`${colors.cyan}${colors.bright}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.cyan}${colors.bright}TEST 2: Validation (Missing Required Fields)${colors.reset}`)
  console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  results.validation = await testMissingFields()
  
  // Test 3: Profile Types
  console.log(`${colors.cyan}${colors.bright}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.cyan}${colors.bright}TEST 3: All Profile Types${colors.reset}`)
  console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  results.profileTypes = await testAllProfileTypes()
  
  // Test 4: Subscription Plans
  console.log(`${colors.cyan}${colors.bright}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.cyan}${colors.bright}TEST 4: Subscription Plans${colors.reset}`)
  console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  results.subscriptionPlans = await testSubscriptionPlans()
  
  // Final Summary
  console.log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}║                    TEST SUMMARY                        ║${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`)
  
  console.log(`${results.security ? colors.green + '✅' : colors.red + '❌'} Security Test: ${results.security ? 'PASSED' : 'FAILED'}${colors.reset}`)
  console.log(`${results.validation ? colors.green + '✅' : colors.red + '❌'} Validation Test: ${results.validation ? 'PASSED' : 'FAILED'}${colors.reset}`)
  console.log(`${results.profileTypes ? colors.green + '✅' : colors.red + '❌'} Profile Types Test: ${results.profileTypes ? 'PASSED' : 'FAILED'}${colors.reset}`)
  console.log(`${results.subscriptionPlans ? colors.green + '✅' : colors.red + '❌'} Subscription Plans Test: ${results.subscriptionPlans ? 'PASSED' : 'FAILED'}${colors.reset}`)
  
  const allPassed = Object.values(results).every(r => r)
  
  if (allPassed) {
    console.log(`\n${colors.green}${colors.bright}🎉 ALL TESTS PASSED! Payment integration is working correctly!${colors.reset}\n`)
  } else {
    console.log(`\n${colors.red}${colors.bright}⚠️  SOME TESTS FAILED! Please review the errors above.${colors.reset}\n`)
  }
}

// Quick single test
async function quickTest() {
  console.log(`${colors.bright}${colors.cyan}🚀 Quick Test - Single Webhook${colors.reset}\n`)
  await testWebhook('inflammatory', 'monthly')
}

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0] || 'full'

// Main execution
async function main() {
  switch (command) {
    case 'quick':
      await quickTest()
      break
    case 'security':
      await testInvalidSecret()
      break
    case 'validation':
      await testMissingFields()
      break
    case 'types':
      await testAllProfileTypes()
      break
    case 'plans':
      await testSubscriptionPlans()
      break
    case 'full':
    default:
      await runFullTestSuite()
      break
  }
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`)
  process.exit(1)
})

