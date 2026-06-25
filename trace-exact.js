const fs = require('fs');
const lines = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8').split('\n');
let cnt = 0;
let layoutOpened = -1;
let contentOpened = -1;

for(let i=380; i<960; i++) {
  const l = lines[i];
  if(l.includes('<div className="settings-layout"')) layoutOpened = cnt;
  if(l.includes('<div className="settings-content"')) contentOpened = cnt;
  
  const open = (l.match(/<div/g) || []).length;
  const close = (l.match(/<\/div/g) || []).length;
  cnt += open - close;
  
  if (layoutOpened !== -1 && cnt === layoutOpened - 1) {
    console.log('settings-layout closed at', i+1);
    layoutOpened = -2;
  }
  if (contentOpened !== -1 && cnt === contentOpened - 1) {
    console.log('settings-content closed at', i+1);
    contentOpened = -2;
  }
}
