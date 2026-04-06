const fs = require('fs');

const filesToRestore = [
  'src/app/api/clients/route.ts',
  'src/app/api/leads/route.ts',
  'src/app/api/projects/route.ts',
  'src/app/api/dashboard/route.ts'
];

for (const file of filesToRestore) {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/const \{ orgId \} = session;/g, 'const { orgId, role, userId } = session;');
    fs.writeFileSync(file, content, 'utf-8');
    console.log("Restored " + file);
  } catch (e) {
    console.error("Error restoring " + file, e.message);
  }
}
