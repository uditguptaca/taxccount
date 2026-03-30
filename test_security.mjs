import fs from 'fs';

// Try to upload an HTML file which is not allowed
const formData1 = new FormData();
const testFile1 = new Blob(['<h1>hello</h1>'], { type: 'text/html' });
formData1.append('file', testFile1, 'test.html');
formData1.append('client_id', 'TEST_CLIENT');
formData1.append('engagement_id', 'TEST_ENGAGEMENT');

// Try to upload a valid pdf but with an invalid extension
const formData2 = new FormData();
const testFile2 = new Blob(['%PDF-1.4...'], { type: 'application/pdf' });
formData2.append('file', testFile2, 'test.bat');
formData2.append('client_id', 'TEST_CLIENT');
formData2.append('engagement_id', 'TEST_ENGAGEMENT');

// Try a valid txt
const formData3 = new FormData();
const testFile3 = new Blob(['some text payload'], { type: 'text/plain' });
formData3.append('file', testFile3, 'test.txt');
formData3.append('client_id', 'TEST_CLIENT');
formData3.append('engagement_id', 'TEST_ENGAGEMENT');

async function testUploads() {
  console.log('--- Test 1: Invalid MIME Type ---');
  let res = await fetch('http://localhost:3000/api/documents', { method: 'POST', body: formData1 });
  console.log(await res.text(), res.status);

  console.log('\\n--- Test 2: Invalid Extension ---');
  res = await fetch('http://localhost:3000/api/documents', { method: 'POST', body: formData2 });
  console.log(await res.text(), res.status);

  console.log('\\n--- Test 3: Valid File ---');
  res = await fetch('http://localhost:3000/api/documents', { method: 'POST', body: formData3 });
  console.log(await res.text(), res.status);
}

testUploads();
