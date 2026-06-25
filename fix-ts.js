const fs = require('fs');
const lines = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setTemplateForm({ id: t.id') && !lines[i].includes('checklist_id')) {
    lines[i] = lines[i].replace(
      "category: t.category || 'General' });",
      "category: t.category || 'General', checklist_id: '' });"
    );
  }
}

fs.writeFileSync('src/app/dashboard/settings/page.tsx', lines.join('\n'), 'utf8');
console.log('Fixed typescript error on setTemplateForm');
