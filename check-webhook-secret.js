// Quick script to check what webhook secret is configured locally
// This reads from your .env.local file

require('dotenv').config({ path: '.env.local' })

console.log('\n🔍 Checking Webhook Secret Configuration\n')
console.log('════════════════════════════════════════\n')

const webhookSecret = process.env.WEBHOOK_SECRET || process.env.NEXT_PUBLIC_WEBHOOK_SECRET

if (webhookSecret) {
  console.log('✅ Webhook secret found!')
  console.log(`   Value: ${webhookSecret.substring(0, 8)}${'*'.repeat(Math.max(0, webhookSecret.length - 8))}`)
  console.log(`   Length: ${webhookSecret.length} characters`)
  console.log('\n📋 To use this secret, run:')
  console.log(`   $env:WEBHOOK_SECRET="${webhookSecret}"`)
} else {
  console.log('❌ No webhook secret found in .env.local')
  console.log('\n📋 To fix this:')
  console.log('   1. Get your secret from Vercel dashboard')
  console.log('   2. Add to .env.local:')
  console.log('      WEBHOOK_SECRET=your-secret-here')
  console.log('   3. Or set in terminal:')
  console.log('      $env:WEBHOOK_SECRET="your-secret-here"')
}

console.log('\n════════════════════════════════════════\n')


