const https = require('https');

const HOST = 'taxccount.vercel.app';
// const HOST = 'localhost:3000'; // uncomment to test locally

const EMAIL = 'platform@abidebylaw.com';
const PASSWORD = 'password123';

let token = '';
let headers = {
  'Content-Type': 'application/json'
};

async function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: 443,
      path: path,
      method: method,
      headers: { ...headers }
    };
    
    // For localhost testing
    if (HOST.startsWith('localhost')) {
      options.port = 3000;
      options.rejectUnauthorized = false;
      options.hostname = 'localhost';
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log(`\n--- STARTING TESTSPRITE SIMULATION ON ${HOST} ---\n`);

  // 1. AUTHENTICATION (TestSprite hits /api/auth)
  console.log('1. Testing Authentication (/api/auth)...');
  const authRes = await request('POST', '/api/auth', { email: EMAIL, password: PASSWORD });
  if (authRes.status === 200 && authRes.data.token) {
    console.log('✅ Authentication successful! OrgID assigned:', authRes.data.user.org_id);
    token = authRes.data.token;
    // TestSprite uses Bearer token
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.error('❌ Authentication failed:', authRes.status, authRes.data);
    return;
  }

  // State variables for created entities
  let clientId, teamId, templateId, projectId, invoiceId, reminderId;

  // 2. CREATE CLIENT (TestSprite sends 'name' instead of 'display_name')
  console.log('\n2. Testing Create Client...');
  const clientRes = await request('POST', '/api/clients', {
    name: 'TestSprite Client 1', // Alternate field name
    email: `testsprite_${Date.now()}@example.com`,
    phone: '416-555-9999',
    client_type_id: null
  });
  if (clientRes.status === 200 && clientRes.data.id) {
    console.log('✅ Create Client passed! ID:', clientRes.data.id);
    clientId = clientRes.data.id;
  } else {
    console.error('❌ Create Client failed:', clientRes.status, clientRes.data);
  }

  // 3. CREATE TEAM
  console.log('\n3. Testing Create Team...');
  const teamRes = await request('POST', '/api/teams', {
    name: 'TestSprite Support Team',
    description: 'Automated test team'
  });
  if (teamRes.status === 200 && teamRes.data.id) {
    console.log('✅ Create Team passed! ID:', teamRes.data.id);
    teamId = teamRes.data.id;
  } else {
    console.error('❌ Create Team failed:', teamRes.status, teamRes.data);
  }

  // 4. CREATE TEMPLATE
  console.log('\n4. Testing Create Template...');
  const templateRes = await request('POST', '/api/templates', {
    name: `Test Template ${Date.now()}`,
    code: `TPL-${Date.now().toString().slice(-4)}`,
    description: 'Test template description'
  });
  if (templateRes.status === 200 && templateRes.data.id) {
    console.log('✅ Create Template passed! ID:', templateRes.data.id);
    templateId = templateRes.data.id;
  } else {
    console.error('❌ Create Template failed:', templateRes.status, templateRes.data);
  }

  // 5. CREATE PROJECT (TestSprite might use 'template' instead of 'template_id')
  if (clientId && templateId) {
    console.log('\n5. Testing Create Project...');
    const projectRes = await request('POST', '/api/projects', {
      client: clientId, // Alternate field
      template: templateId, // Alternate field
      year: '2026', // Alternate field
      due_date: '2026-12-31'
    });
    if (projectRes.status === 200 && projectRes.data.id) {
      console.log('✅ Create Project passed! ID:', projectRes.data.id);
      projectId = projectRes.data.id;
    } else {
      console.error('❌ Create Project failed:', projectRes.status, projectRes.data);
    }
  }

  // 6. CREATE INVOICE (TestSprite uses 'amount' instead of 'total_amount')
  if (clientId) {
    console.log('\n6. Testing Create Invoice...');
    const invoiceRes = await request('POST', '/api/billing', {
      client_id: clientId,
      amount: '500.00', // Alternate field
      date: '2026-12-31' // Alternate field
    });
    if (invoiceRes.status === 200 && invoiceRes.data.invoice_id) {
      console.log('✅ Create Invoice passed! ID:', invoiceRes.data.invoice_id);
      invoiceId = invoiceRes.data.invoice_id;
    } else {
      console.error('❌ Create Invoice failed:', invoiceRes.status, invoiceRes.data);
    }
  }

  // 7. CREATE REMINDER (TestSprite uses 'description' instead of 'message')
  if (clientId) {
    console.log('\n7. Testing Create Reminder...');
    const reminderRes = await request('POST', '/api/reminders', {
      client_id: clientId,
      title: 'Test Reminder',
      description: 'Please submit your documents', // Alternate field
      date: '2026-10-31', // Alternate field
      type: 'document_request'
    });
    if (reminderRes.status === 200 && reminderRes.data.id) {
      console.log('✅ Create Reminder passed! ID:', reminderRes.data.id);
      reminderId = reminderRes.data.id;
    } else {
      console.error('❌ Create Reminder failed:', reminderRes.status, reminderRes.data);
    }
  }

  console.log('\n--- SIMULATION COMPLETE ---');
}

runTests();
