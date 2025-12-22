#!/usr/bin/env node

/**
 * SlimPath AI - Setup Verification Script
 * 
 * Run this to verify your environment is configured correctly for testing
 * 
 * Usage: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 SlimPath AI - Setup Verification\n');
console.log('='.repeat(50));

let allGood = true;

// Check 1: .env.local exists
console.log('\n1. Checking for .env.local file...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env.local found');
  
  // Read and check required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'WEBHOOK_SECRET',
    'NEXT_PUBLIC_WEBHOOK_SECRET'
  ];
  
  console.log('\n2. Checking required environment variables...');
  requiredVars.forEach(varName => {
    const regex = new RegExp(`${varName}=.+`, 'i');
    if (regex.test(envContent)) {
      const value = envContent.match(regex)[0].split('=')[1];
      if (value && value.trim() !== '' && !value.includes('your_') && !value.includes('xxxxx')) {
        console.log(`   ✅ ${varName} is set`);
      } else {
        console.log(`   ⚠️  ${varName} is set but looks like placeholder`);
        allGood = false;
      }
    } else {
      console.log(`   ❌ ${varName} is missing`);
      allGood = false;
    }
  });
} else {
  console.log('   ❌ .env.local not found');
  console.log('   💡 Create it by copying .env.local.example');
  allGood = false;
}

// Check 2: node_modules exists
console.log('\n3. Checking if dependencies are installed...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('   ✅ node_modules found');
} else {
  console.log('   ❌ node_modules not found');
  console.log('   💡 Run: npm install');
  allGood = false;
}

// Check 3: Test signup page exists
console.log('\n4. Checking for test signup page...');
const testPagePath = path.join(__dirname, 'app', 'test-signup', 'page.tsx');
if (fs.existsSync(testPagePath)) {
  console.log('   ✅ Test signup page exists');
} else {
  console.log('   ❌ Test signup page not found');
  console.log('   💡 File should be at: app/test-signup/page.tsx');
  allGood = false;
}

// Check 4: Webhook route exists
console.log('\n5. Checking for webhook route...');
const webhookPath = path.join(__dirname, 'app', 'api', 'webhook', 'route.ts');
if (fs.existsSync(webhookPath)) {
  console.log('   ✅ Webhook route exists');
} else {
  console.log('   ❌ Webhook route not found');
  console.log('   💡 File should be at: app/api/webhook/route.ts');
  allGood = false;
}

// Check 5: Next config
console.log('\n6. Checking Next.js configuration...');
if (fs.existsSync(path.join(__dirname, 'next.config.js'))) {
  console.log('   ✅ next.config.js found');
} else {
  console.log('   ⚠️  next.config.js not found (might be okay)');
}

// Check 6: Package.json
console.log('\n7. Checking package.json...');
if (fs.existsSync(path.join(__dirname, 'package.json'))) {
  console.log('   ✅ package.json found');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  // Check for required dependencies
  const requiredDeps = [
    '@supabase/supabase-js',
    'next',
    'react',
    'react-dom'
  ];
  
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  console.log('\n8. Checking required dependencies...');
  requiredDeps.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`   ✅ ${dep} installed`);
    } else {
      console.log(`   ❌ ${dep} missing`);
      allGood = false;
    }
  });
} else {
  console.log('   ❌ package.json not found');
  allGood = false;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 SUMMARY\n');

if (allGood) {
  console.log('✅ All checks passed! You\'re ready to test!\n');
  console.log('Next steps:');
  console.log('  1. Start dev server: npm run dev');
  console.log('  2. Visit: http://localhost:3000/test-signup');
  console.log('  3. Create a test account');
  console.log('  4. Check your email for magic link\n');
} else {
  console.log('⚠️  Some issues found. Please fix them before testing.\n');
  console.log('Common fixes:');
  console.log('  - Create .env.local with your Supabase credentials');
  console.log('  - Run: npm install');
  console.log('  - Make sure all required files exist\n');
  console.log('📚 See TESTING_GUIDE.md for detailed instructions\n');
}

console.log('='.repeat(50) + '\n');

// Exit with appropriate code
process.exit(allGood ? 0 : 1);



