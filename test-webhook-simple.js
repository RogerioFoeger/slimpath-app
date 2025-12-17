// Simple webhook test script
const https = require('https');

const payload = {
  email: "harryronifell@outlook.com",
  name: "harry",
  profile_type: "cortisol",
  subscription_plan: "annual",
  transaction_id: "c10aad307d39238febc6d4085a4a86f1bdd7729df99327bfe77c50e2c4de1b23",
  amount: 297
};

console.log('🧪 Testing webhook with payload:', payload);
console.log('');

const data = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-webhook-secret': 'c10aad307d39238febc6d4085a4a86f1bdd7729df99327bfe77c50e2c4de1b23',
    'Content-Length': data.length
  },
  rejectUnauthorized: false
};

const http = require('http');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  console.log('');

  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response:');
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log('');
        console.log('✅ SUCCESS! User created/updated.');
        console.log(`User ID: ${parsed.user_id}`);
      } else {
        console.log('');
        console.log('❌ ERROR:', parsed.error);
        if (parsed.details) {
          console.log('Details:', parsed.details);
        }
      }
    } catch (e) {
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('');
  console.log('Make sure the dev server is running: npm run dev');
});

req.write(data);
req.end();

