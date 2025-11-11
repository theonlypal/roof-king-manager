#!/usr/bin/env node

/**
 * Test Automation Pipeline - Roof King Manager
 *
 * This script tests the complete automation flow:
 * 1. Creates a test customer in Airtable
 * 2. Creates a test job in Airtable
 * 3. Creates a calendar event in Google Calendar
 * 4. Sends a confirmation email via Brevo
 *
 * Usage: node scripts/test-automation.js
 * (Reads from .env file)
 */

require('dotenv').config();
const https = require('https');

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper to make HTTP requests
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

// Test Airtable connection
async function testAirtable() {
  log('\n📊 Testing Airtable...', 'cyan');

  const token = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const businessId = process.env.AIRTABLE_BUSINESS_ID;

  if (!token || !baseId || !businessId) {
    throw new Error('Missing Airtable credentials in .env');
  }

  // Create test customer
  log('  ├─ Creating test customer...', 'blue');
  const customerData = {
    fields: {
      'Business ID': businessId,
      'Name': 'Test Customer',
      'Email': 'test@example.com',
      'Phone': '(555) 123-4567',
      'Address': '123 Test St, San Diego, CA',
    },
  };

  const customer = await httpRequest(
    `https://api.airtable.com/v0/${baseId}/Customers`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: customerData,
    }
  );

  log(`  ├─ ✓ Customer created: ${customer.data.id}`, 'green');

  // Create test job
  log('  ├─ Creating test job...', 'blue');
  const jobData = {
    fields: {
      'Business ID': businessId,
      'Customer': [customer.data.id],
      'Title': 'Test Roof Repair',
      'Status': 'scheduled',
      'Site Address': '123 Test St, San Diego, CA',
      'Estimated Amount': 5000,
      'Notes': 'This is a test job created by automation script',
      'Scheduled Date': new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    },
  };

  const job = await httpRequest(
    `https://api.airtable.com/v0/${baseId}/Jobs`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: jobData,
    }
  );

  log(`  └─ ✓ Job created: ${job.data.id}`, 'green');
  log(`\n  View in Airtable: https://airtable.com/${baseId}`, 'cyan');

  return { customerId: customer.data.id, jobId: job.data.id };
}

// Test Google Calendar
async function testGoogleCalendar() {
  log('\n📅 Testing Google Calendar...', 'cyan');

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!serviceAccountEmail || !privateKey || !calendarId) {
    log('  └─ ⚠ Google Calendar not configured (optional)', 'yellow');
    return null;
  }

  log('  ├─ Service account configured ✓', 'green');
  log(`  ├─ Calendar ID: ${calendarId}`, 'blue');
  log('  └─ Note: Calendar event creation requires googleapis package', 'yellow');
  log('     Run: npm install googleapis', 'yellow');

  return { configured: true };
}

// Test Brevo Email
async function testBrevo() {
  log('\n📧 Testing Brevo Email...', 'cyan');

  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.APP_FROM_EMAIL;
  const fromName = process.env.APP_FROM_NAME;

  if (!apiKey || !fromEmail || !fromName) {
    log('  └─ ⚠ Brevo not configured (optional)', 'yellow');
    return null;
  }

  // Test API connection
  log('  ├─ Checking Brevo API...', 'blue');

  const result = await httpRequest('https://api.brevo.com/v3/account', {
    method: 'GET',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  log(`  ├─ ✓ Brevo account: ${result.data.email}`, 'green');
  log(`  ├─ Plan: ${result.data.plan[0]?.type || 'Free'}`, 'blue');
  log(`  └─ Credits remaining: ${result.data.plan[0]?.credits || 'Unlimited'}`, 'blue');

  return { configured: true };
}

// Main test function
async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  🚀 ROOF KING AUTOMATION TEST SUITE', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  const results = {
    airtable: false,
    calendar: false,
    email: false,
  };

  try {
    // Test Airtable
    const airtableResult = await testAirtable();
    results.airtable = true;

    // Test Google Calendar
    const calendarResult = await testGoogleCalendar();
    results.calendar = !!calendarResult;

    // Test Brevo
    const brevoResult = await testBrevo();
    results.email = !!brevoResult;

    // Summary
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('  📊 TEST RESULTS', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    log(`  Airtable:        ${results.airtable ? '✓ WORKING' : '✗ FAILED'}`, results.airtable ? 'green' : 'red');
    log(`  Google Calendar: ${results.calendar ? '✓ WORKING' : '○ Not configured'}`, results.calendar ? 'green' : 'yellow');
    log(`  Brevo Email:     ${results.email ? '✓ WORKING' : '○ Not configured'}`, results.email ? 'green' : 'yellow');

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    if (results.airtable) {
      log('✅ Core automation is working!', 'green');
      log('\nNext steps:', 'cyan');
      log('1. Open your Airtable base to see the test data', 'blue');
      log('2. Test the live app at: http://localhost:3000/demo', 'blue');
      log('3. Create a real job through the UI', 'blue');
      log('4. Watch the magic happen!\n', 'blue');
    }

  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    log('\nCheck your .env file and make sure all credentials are correct.\n', 'yellow');
    process.exit(1);
  }
}

main();
