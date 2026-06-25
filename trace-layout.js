const fs = require('fs');
const lines = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8').split('\n');
let cnt = 0;
let layoutCnt = -1;
let contentCnt = -1;

for(let i=380; i<lines.length; i++) {
  if(lines[i].includes('<div className="settings-layout"')) layoutCnt = cnt;
  if(lines[i].includes('<div className="settings-content"')) contentCnt = cnt;
  
  if(lines[i].includes('<div')) cnt++;
  if(lines[i].includes('</div>')) cnt--;
  
  if(layoutCnt !== -1 && cnt === layoutCnt - 1) {
    console.log('settings-layout closed at line', i+1);
    layoutCnt = -1;
  }
  if(contentCnt !== -1 && cnt === contentCnt - 1) {
    console.log('settings-content closed at line', i+1);
    contentCnt = -1;
  }
}
