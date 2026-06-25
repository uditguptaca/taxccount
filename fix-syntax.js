const fs = require('fs');
const lines = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8').split('\n');
// We need to delete lines 961 and 962 (which are 960 and 961 in 0-indexed array)
if (lines[960].includes('</div>') && lines[961].includes('</div>')) {
  lines.splice(960, 2);
  fs.writeFileSync('src/app/dashboard/settings/page.tsx', lines.join('\n'), 'utf8');
  console.log('Fixed lines 961 and 962');
} else {
  console.log('Lines do not match expected format. Line 960:', lines[960], 'Line 961:', lines[961]);
}
