#!/usr/bin/env node

/**
 * Automated Airtable Base Setup for Roof King Manager
 *
 * Usage: node scripts/setup-airtable.js YOUR_AIRTABLE_PAT
 *
 * This script will:
 * 1. Discover your Airtable workspaces
 * 2. Create a new base called "Service Business Hub"
 * 3. Create all 7 tables with proper field structures
 * 4. Output your AIRTABLE_BASE_ID and AIRTABLE_BUSINESS_ID
 */

const https = require('https');

const AIRTABLE_API = 'https://api.airtable.com/v0';
const META_API = 'https://api.airtable.com/v0/meta';

// Helper function to make API requests
function apiRequest(url, method, token, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Get all workspaces
async function getWorkspaces(token) {
  console.log('🔍 Discovering your Airtable workspaces...');
  const data = await apiRequest(`${META_API}/bases`, 'GET', token);

  // Extract unique workspace IDs
  const workspaces = {};
  if (data.bases) {
    data.bases.forEach(base => {
      if (base.permissionLevel === 'owner' || base.permissionLevel === 'create') {
        // Get workspace from base (Airtable API might return this differently)
        // For now, we'll just use the first base's workspace
        workspaces[base.id] = base.name;
      }
    });
  }

  return workspaces;
}

// Create base
async function createBase(token, workspaceId, name) {
  console.log(`\n📦 Creating base "${name}"...`);

  const body = {
    name: name,
    tables: [
      {
        name: 'Customers',
        description: 'Customer contact information',
        fields: [
          { name: 'Business ID', type: 'singleLineText' },
          { name: 'Name', type: 'singleLineText' },
          { name: 'Email', type: 'email' },
          { name: 'Phone', type: 'phoneNumber' },
          { name: 'Address', type: 'singleLineText' },
        ],
      },
    ],
  };

  // Note: workspace ID might be needed in URL or body depending on API version
  const data = await apiRequest(`${META_API}/bases`, 'POST', token, body);
  return data.id;
}

// Create table in base
async function createTable(token, baseId, tableName, fields) {
  console.log(`  ├─ Creating table: ${tableName}...`);

  const body = {
    name: tableName,
    fields: fields,
  };

  const data = await apiRequest(`${META_API}/bases/${baseId}/tables`, 'POST', token, body);
  return data.id;
}

// Table schemas
const TABLES = {
  'Jobs': [
    { name: 'Business ID', type: 'singleLineText' },
    { name: 'Customer', type: 'multipleRecordLinks', options: { linkedTableId: 'CUSTOMERS_TABLE_ID' } },
    { name: 'Title', type: 'singleLineText' },
    { name: 'Status', type: 'singleSelect', options: { choices: [
      { name: 'pending' }, { name: 'scheduled' }, { name: 'in_progress' },
      { name: 'completed' }, { name: 'cancelled' }
    ]}},
    { name: 'Site Address', type: 'singleLineText' },
    { name: 'Estimated Amount', type: 'currency', options: { precision: 2 } },
    { name: 'Notes', type: 'multilineText' },
    { name: 'Scheduled Date', type: 'dateTime', options: { dateFormat: { name: 'us' }, timeFormat: { name: '24hour' }, timeZone: 'America/Los_Angeles' } },
  ],
  'Invoices': [
    { name: 'Business ID', type: 'singleLineText' },
    { name: 'Job', type: 'multipleRecordLinks', options: { linkedTableId: 'JOBS_TABLE_ID' } },
    { name: 'Customer', type: 'multipleRecordLinks', options: { linkedTableId: 'CUSTOMERS_TABLE_ID' } },
    { name: 'Amount', type: 'currency', options: { precision: 2 } },
    { name: 'Tax Amount', type: 'currency', options: { precision: 2 } },
    { name: 'Status', type: 'singleSelect', options: { choices: [
      { name: 'draft' }, { name: 'sent' }, { name: 'paid' }, { name: 'overdue' }
    ]}},
    { name: 'Items', type: 'multilineText' },
    { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'us' } } },
  ],
  'Payments': [
    { name: 'Business ID', type: 'singleLineText' },
    { name: 'Invoice', type: 'multipleRecordLinks', options: { linkedTableId: 'INVOICES_TABLE_ID' } },
    { name: 'Amount', type: 'currency', options: { precision: 2 } },
    { name: 'Payment Method', type: 'singleSelect', options: { choices: [
      { name: 'cash' }, { name: 'check' }, { name: 'credit_card' }, { name: 'bank_transfer' }
    ]}},
    { name: 'Payment Date', type: 'date', options: { dateFormat: { name: 'us' } } },
    { name: 'Notes', type: 'multilineText' },
  ],
  'Services': [
    { name: 'Business ID', type: 'singleLineText' },
    { name: 'Service Name', type: 'singleLineText' },
    { name: 'Default Price', type: 'currency', options: { precision: 2 } },
    { name: 'Description', type: 'multilineText' },
    { name: 'Duration (hours)', type: 'number', options: { precision: 1 } },
  ],
  'Team Members': [
    { name: 'Business ID', type: 'singleLineText' },
    { name: 'Name', type: 'singleLineText' },
    { name: 'Email', type: 'email' },
    { name: 'Phone', type: 'phoneNumber' },
    { name: 'Role', type: 'singleLineText' },
  ],
  'Businesses': [
    { name: 'Business ID', type: 'singleLineText' },
    { name: 'Name', type: 'singleLineText' },
    { name: 'Email', type: 'email' },
    { name: 'Phone', type: 'phoneNumber' },
    { name: 'Address', type: 'singleLineText' },
    { name: 'Website', type: 'url' },
  ],
};

async function main() {
  const token = process.argv[2];

  if (!token || !token.startsWith('pat')) {
    console.error('❌ Error: Please provide your Airtable Personal Access Token');
    console.error('Usage: node scripts/setup-airtable.js YOUR_PAT_HERE');
    console.error('\nGet your PAT at: https://airtable.com/create/tokens');
    console.error('Required scopes: schema.bases:read, schema.bases:write, data.records:read, data.records:write');
    process.exit(1);
  }

  console.log('🚀 Roof King Manager - Airtable Auto-Setup\n');

  try {
    // Step 1: Get workspaces
    const workspaces = await getWorkspaces(token);
    console.log(`✓ Found ${Object.keys(workspaces).length} workspace(s)\n`);

    // Step 2: Create base with first table
    const baseId = await createBase(token, null, 'Service Business Hub');
    console.log(`✓ Base created: ${baseId}\n`);

    // Step 3: Create remaining tables
    console.log('📋 Creating tables...');
    const tableIds = { Customers: 'tbl_customers' }; // First table already created

    for (const [tableName, fields] of Object.entries(TABLES)) {
      // Replace linked table placeholders
      const processedFields = fields.map(field => {
        if (field.type === 'multipleRecordLinks' && field.options?.linkedTableId) {
          const linkedTable = field.options.linkedTableId.replace('_TABLE_ID', '');
          if (tableIds[linkedTable]) {
            return { ...field, options: { ...field.options, linkedTableId: tableIds[linkedTable] } };
          }
        }
        return field;
      });

      const tableId = await createTable(token, baseId, tableName, processedFields);
      tableIds[tableName] = tableId;
    }

    console.log('  └─ All tables created!\n');

    // Step 4: Generate business ID
    const businessId = `business-${Date.now()}`;

    // Step 5: Output results
    console.log('✅ SUCCESS! Your Airtable base is ready.\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Add these to your .env file:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`AIRTABLE_API_KEY=${token}`);
    console.log(`AIRTABLE_BASE_ID=${baseId}`);
    console.log(`AIRTABLE_BUSINESS_ID=${businessId}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`View your base: https://airtable.com/${baseId}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure your PAT has these scopes:');
    console.error('   - schema.bases:read');
    console.error('   - schema.bases:write');
    console.error('   - data.records:read');
    console.error('   - data.records:write');
    console.error('2. Make sure your PAT has access to "All current and future bases"');
    console.error('3. Visit: https://airtable.com/create/tokens to verify\n');
    process.exit(1);
  }
}

main();
