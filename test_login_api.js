
async function testLogin(email, password) {
  console.log(`Testing login for ${email}...`);
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('Headers:', JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
}

async function run() {
  await testLogin('admin@taxccount.ca', 'password123');
  console.log('---');
  await testLogin('invalid@taxccount.ca', 'wrong');
}

run().catch(console.error);
