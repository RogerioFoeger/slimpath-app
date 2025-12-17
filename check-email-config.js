#!/usr/bin/env node

/**
 * Email Configuration Diagnostic Tool
 * 
 * This script checks your Supabase email configuration and helps diagnose
 * why you might not be receiving confirmation emails.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'bright');
}

// Load environment variables
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    
    if (!fs.existsSync(envPath)) {
      error('.env.local file not found!');
      return null;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};

    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
          env[key.trim()] = values.join('=').trim();
        }
      }
    });

    return env;
  } catch (err) {
    error(`Failed to load .env.local: ${err.message}`);
    return null;
  }
}

// Check if Supabase project is accessible
function checkSupabaseConnection(url, anonKey) {
  return new Promise((resolve) => {
    const urlObj = new URL(`${url}/rest/v1/`);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve({ success: true, status: res.statusCode });
      } else {
        resolve({ success: false, status: res.statusCode });
      }
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, error: 'Connection timeout' });
    });

    req.end();
  });
}

// Main diagnostic function
async function runDiagnostics() {
  log('\n🔍 SlimPath AI - Email Configuration Diagnostic Tool\n', 'bright');

  // Step 1: Check .env.local file
  section('1. Checking Environment Variables');
  
  const env = loadEnvFile();
  if (!env) {
    error('Cannot proceed without .env.local file');
    process.exit(1);
  }

  success('Found .env.local file');

  // Check required variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL'
  ];

  let missingVars = false;
  required.forEach(key => {
    if (env[key]) {
      success(`${key} is set`);
    } else {
      error(`${key} is missing!`);
      missingVars = true;
    }
  });

  if (missingVars) {
    error('\nCannot proceed with missing environment variables');
    process.exit(1);
  }

  // Step 2: Check Supabase connection
  section('2. Testing Supabase Connection');
  
  info('Connecting to Supabase...');
  const connection = await checkSupabaseConnection(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (connection.success) {
    success('Supabase connection successful!');
  } else {
    error(`Supabase connection failed: ${connection.error || `Status ${connection.status}`}`);
    warning('Your Supabase project might be paused or credentials are invalid');
  }

  // Step 3: Validate URLs
  section('3. Validating URLs');

  try {
    const supabaseUrl = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
    success(`Supabase URL is valid: ${supabaseUrl.hostname}`);
  } catch (err) {
    error(`Invalid Supabase URL: ${err.message}`);
  }

  try {
    const appUrl = new URL(env.NEXT_PUBLIC_APP_URL);
    success(`App URL is valid: ${appUrl.href}`);
    
    if (appUrl.protocol === 'http:' && !appUrl.hostname.includes('localhost')) {
      warning('Using HTTP (not HTTPS) for non-localhost URL');
      warning('Email confirmations require HTTPS in production');
    }
  } catch (err) {
    error(`Invalid App URL: ${err.message}`);
  }

  // Step 4: Check webhook configuration
  section('4. Checking Webhook Configuration');

  if (env.WEBHOOK_SECRET) {
    success('WEBHOOK_SECRET is set');
  } else {
    warning('WEBHOOK_SECRET is not set (only needed for payment webhooks)');
  }

  // Step 5: Check VAPID keys for push notifications
  section('5. Checking Push Notification Configuration');

  if (env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    success('VAPID public key is set');
  } else {
    warning('VAPID public key is not set (push notifications will not work)');
  }

  if (env.VAPID_PRIVATE_KEY) {
    success('VAPID private key is set');
  } else {
    warning('VAPID private key is not set (push notifications will not work)');
  }

  // Step 6: Common issues and recommendations
  section('6. Common Email Issues & Recommendations');

  info('\n📧 Email Configuration Checklist:\n');
  
  console.log('   Go to your Supabase Dashboard and verify:');
  console.log('   1. Authentication → Settings → Email Auth');
  console.log('      - "Enable email confirmations" is ON');
  console.log('      - "Enable email OTP" is ON');
  console.log('   2. Authentication → Email Templates');
  console.log('      - "Confirm signup" template exists');
  console.log('      - Template contains {{ .ConfirmationURL }}');
  console.log('   3. Authentication → URL Configuration');
  console.log(`      - Add: ${env.NEXT_PUBLIC_APP_URL}/**`);
  console.log(`      - Add: ${env.NEXT_PUBLIC_APP_URL}/onboarding`);
  console.log('   4. Authentication → Settings → Rate Limits');
  console.log('      - Check you haven\'t exceeded 3-4 emails/hour (free tier)');

  info('\n🔍 Troubleshooting Steps:\n');
  
  console.log('   1. Check your spam/junk folder for emails from:');
  console.log('      - noreply@mail.app.supabase.io');
  console.log('   2. Try signing up with a different email provider');
  console.log('   3. Wait 1 hour if you\'ve tested multiple times (rate limit)');
  console.log('   4. Check Supabase Dashboard → Logs → Auth Logs for errors');
  console.log('   5. Manually confirm test users in Dashboard → Authentication → Users');

  info('\n🚀 Production Recommendations:\n');
  
  console.log('   1. Set up custom SMTP (SendGrid/Resend) to avoid rate limits');
  console.log('   2. Verify your domain for better email deliverability');
  console.log('   3. Configure SPF/DKIM records in your DNS');
  console.log('   4. Use branded sender email (e.g., support@slimpathai.com)');

  // Step 7: Next steps
  section('7. Next Steps');

  log('\nFor detailed troubleshooting, see:', 'bright');
  info('  📄 EMAIL_SETUP_FIX.md - Quick fixes for common issues');
  info('  📄 EMAIL_TROUBLESHOOTING_GUIDE.md - Complete diagnostic guide');

  log('\nTo test email sending:', 'bright');
  console.log('  1. Start your dev server: npm run dev');
  console.log('  2. Go to: http://localhost:3000/login');
  console.log('  3. Try signing up with a test email');
  console.log('  4. Check for confirmation email');

  log('\nIf emails still not arriving:', 'bright');
  console.log('  1. Check Supabase Dashboard → Authentication → Users');
  console.log('  2. Manually click "Confirm Email" for test users');
  console.log('  3. Or disable email confirmations temporarily for testing');

  log('\n✅ Diagnostic complete!\n', 'green');
}

// Run diagnostics
runDiagnostics().catch(err => {
  error(`\nDiagnostic failed: ${err.message}`);
  process.exit(1);
});

