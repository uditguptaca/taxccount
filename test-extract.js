const fs = require('fs');

const transcriptPath = 'c:\\Users\\uditg\\.gemini\\antigravity\\brain\\109efa2f-8766-41dd-9f08-ff3972346646\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'PLANNER_RESPONSE' && data.tool_calls) {
      for (const call of data.tool_calls) {
        if (call.name === 'write_to_file' && call.args && call.args.TargetFile) {
          const target = call.args.TargetFile;
          // check endsWith instead
          if (target.includes('company') || target.includes('pay-groups') || target.includes('stat-holidays') || target.includes('people')) {
             console.log("Found match: ", target);
             try {
                let codeContent = call.args.CodeContent;
                if (codeContent.startsWith('"') && codeContent.endsWith('"')) {
                   codeContent = JSON.parse(codeContent);
                }
                const name = target.split(/[\\/]/).slice(-2).join('_');
                fs.writeFileSync(name, codeContent);
             } catch (e) { console.error(e) }
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
}
console.log('Extraction complete v3');
