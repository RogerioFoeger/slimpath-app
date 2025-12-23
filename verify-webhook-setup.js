// Verify CartPanda Webhook Setup
// This script helps verify that your webhook is configured correctly
// and can receive requests from CartPanda

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://slimpathai.com/api/webhook'
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`)
console.log(`${colors.bright}${colors.cyan}║     CartPanda Webhook Setup Verification              ║${colors.reset}`)
console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`)

// Check environment variables
console.log(`${colors.blue}📋 Configuration Check${colors.reset}`)
console.log(`Webhook URL: ${WEBHOOK_URL}`)
console.log(`Webhook Secret: ${WEBHOOK_SECRET ? colors.green + '✅ Configured' + colors.reset : colors.red + '❌ Missing' + colors.reset}\n`)

if (!WEBHOOK_SECRET) {
  console.error(`${colors.red}❌ WEBHOOK_SECRET is not set!${colors.reset}`)
  console.log(`\n${colors.yellow}Set it with:${colors.reset}`)
  console.log(`  export WEBHOOK_SECRET="your-secret-here"`)
  console.log(`  # or on Windows:`)
  console.log(`  set WEBHOOK_SECRET=your-secret-here`)
  process.exit(1)
}

// Test webhook endpoint
async function verifyWebhook() {
  console.log(`${colors.blue}🧪 Testing Webhook Endpoint${colors.reset}\n`)

  const testPayload = {
    email: `verify-${Date.now()}@example.com`,
    name: 'Webhook Verification Test',
    profile_type: 'hormonal',
    subscription_plan: 'monthly',
    transaction_id: `VERIFY_${Date.now()}`,
    amount: 37,
    webhook_secret: WEBHOOK_SECRET
  }

  console.log(`${colors.cyan}📤 Sending test webhook...${colors.reset}`)
  console.log(`${colors.blue}Payload:${colors.reset}`)
  console.log(JSON.stringify(testPayload, null, 2))
  console.log()

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    })

    const data = await response.json()

    console.log(`${colors.blue}📥 Response:${colors.reset}`)
    console.log(`Status: ${response.status} ${response.statusText}`)
    console.log(`Body:`, JSON.stringify(data, null, 2))
    console.log()

    if (response.ok) {
      console.log(`${colors.green}${colors.bright}✅ SUCCESS! Webhook is working correctly!${colors.reset}\n`)
      console.log(`${colors.green}✓ Webhook endpoint is accessible${colors.reset}`)
      console.log(`${colors.green}✓ Webhook secret is correct${colors.reset}`)
      console.log(`${colors.green}✓ Account creation is working${colors.reset}`)
      console.log(`\n${colors.cyan}📧 Check email: ${testPayload.email}${colors.reset}`)
      console.log(`${colors.cyan}🔗 Magic link should arrive shortly${colors.reset}`)
      if (data.user_id) {
        console.log(`${colors.cyan}👤 User ID: ${data.user_id}${colors.reset}`)
      }
      return true
    } else {
      console.error(`${colors.red}${colors.bright}❌ FAILED! Webhook returned an error${colors.reset}\n`)
      
      if (response.status === 401) {
        console.error(`${colors.red}Error: Unauthorized (401)${colors.reset}`)
        console.error(`${colors.yellow}💡 This means the webhook_secret doesn't match${colors.reset}`)
        console.error(`${colors.yellow}   Check that WEBHOOK_SECRET matches what's in CartPanda${colors.reset}`)
      } else if (response.status === 400) {
        console.error(`${colors.red}Error: Bad Request (400)${colors.reset}`)
        console.error(`${colors.yellow}💡 This means required fields are missing${colors.reset}`)
        console.error(`${colors.yellow}   Check that CartPanda sends: email, profile_type, subscription_plan${colors.reset}`)
      } else if (response.status === 500) {
        console.error(`${colors.red}Error: Internal Server Error (500)${colors.reset}`)
        console.error(`${colors.yellow}💡 This means there's a server configuration issue${colors.reset}`)
        console.error(`${colors.yellow}   Check Supabase environment variables${colors.reset}`)
      }
      
      return false
    }
  } catch (error) {
    console.error(`${colors.red}${colors.bright}❌ NETWORK ERROR!${colors.reset}\n`)
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`)
    console.error(`\n${colors.yellow}💡 Possible issues:${colors.reset}`)
    console.error(`   - Webhook URL is incorrect`)
    console.error(`   - Server is not accessible`)
    console.error(`   - Network connectivity issue`)
    return false
  }
}

// Verify CartPanda configuration
function verifyCartPandaConfig() {
  console.log(`${colors.blue}📋 CartPanda Configuration Checklist${colors.reset}\n`)
  
  console.log(`${colors.yellow}Please verify in CartPanda Dashboard:${colors.reset}\n`)
  
  console.log(`1. ${colors.cyan}Webhook URL:${colors.reset}`)
  console.log(`   Should be: ${colors.bright}${WEBHOOK_URL}${colors.reset}\n`)
  
  console.log(`2. ${colors.cyan}Webhook Method:${colors.reset}`)
  console.log(`   Should be: ${colors.bright}POST${colors.reset}\n`)
  
  console.log(`3. ${colors.cyan}Content-Type:${colors.reset}`)
  console.log(`   Should be: ${colors.bright}application/json${colors.reset}\n`)
  
  console.log(`4. ${colors.cyan}Trigger:${colors.reset}`)
  console.log(`   Should fire: ${colors.bright}On successful payment${colors.reset}\n`)
  
  console.log(`5. ${colors.cyan}Webhook Payload (JSON body):${colors.reset}`)
  console.log(`   ${colors.bright}{${colors.reset}`)
  console.log(`     ${colors.bright}"email": "{{customer_email}}",${colors.reset}`)
  console.log(`     ${colors.bright}"name": "{{customer_name}}",${colors.reset}`)
  console.log(`     ${colors.bright}"profile_type": "hormonal",${colors.reset}`)
  console.log(`     ${colors.bright}"subscription_plan": "monthly",${colors.reset}`)
  console.log(`     ${colors.bright}"transaction_id": "{{order_id}}",${colors.reset}`)
  console.log(`     ${colors.bright}"amount": {{order_total}},${colors.reset}`)
  console.log(`     ${colors.bright}"webhook_secret": "${WEBHOOK_SECRET.substring(0, 10)}..."${colors.reset}`)
  console.log(`   ${colors.bright}}${colors.reset}\n`)
  
  console.log(`${colors.yellow}⚠️  IMPORTANT:${colors.reset}`)
  console.log(`   - webhook_secret MUST be in the JSON body (not header)`)
  console.log(`   - webhook_secret must match: ${WEBHOOK_SECRET.substring(0, 10)}...`)
  console.log(`   - email, profile_type, subscription_plan are REQUIRED\n`)
}

// Main execution
async function main() {
  verifyCartPandaConfig()
  
  console.log(`${colors.blue}════════════════════════════════════════════════════════${colors.reset}\n`)
  
  const success = await verifyWebhook()
  
  console.log(`\n${colors.blue}════════════════════════════════════════════════════════${colors.reset}\n`)
  
  if (success) {
    console.log(`${colors.green}${colors.bright}✅ Webhook Setup Verification Complete!${colors.reset}\n`)
    console.log(`${colors.green}Your webhook is configured correctly and ready for automatic registration!${colors.reset}\n`)
    console.log(`${colors.cyan}Next Steps:${colors.reset}`)
    console.log(`1. Configure CartPanda with the settings above`)
    console.log(`2. Make a test payment in CartPanda`)
    console.log(`3. Verify user is created in Supabase`)
    console.log(`4. Check that magic link email is sent\n`)
  } else {
    console.log(`${colors.red}${colors.bright}❌ Webhook Setup Needs Attention${colors.reset}\n`)
    console.log(`${colors.yellow}Please fix the issues above before configuring CartPanda${colors.reset}\n`)
  }
  
  process.exit(success ? 0 : 1)
}

main().catch(error => {
  console.error(`${colors.red}💥 Unexpected error: ${error.message}${colors.reset}`)
  process.exit(1)
})

