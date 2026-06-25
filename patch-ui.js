const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'dashboard', 'settings', 'page.tsx');
let code = fs.readFileSync(pagePath, 'utf8');

// 1. Update setTemplateForm
code = code.replace(
  "const [templateForm, setTemplateForm] = useState({ id: '', name: '', code: '', description: '', price: 0, category: 'General' });",
  "const [templateForm, setTemplateForm] = useState({ id: '', name: '', code: '', description: '', price: 0, category: 'General', checklist_id: '' });"
);

code = code.replace(
  "setTemplateForm({id:'', name:'', code:'', description:'', price:0, category: 'General'});",
  "setTemplateForm({id:'', name:'', code:'', description:'', price:0, category: 'General', checklist_id: ''});"
);

// 2. Add Checklist selection to Modal
const insertAfter = `<textarea className="form-input" rows={2} value={templateForm.description} onChange={e => setTemplateForm({...templateForm, description: e.target.value})} />
                </div>`;

const appendCode = `
                {!templateForm.id && (
                  <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                    <label className="form-label">Use Generic Document Checklist?</label>
                    <select className="form-input" value={templateForm.checklist_id} onChange={e => setTemplateForm({...templateForm, checklist_id: e.target.value})}>
                      <option value="">No, start blank</option>
                      {checklists.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name === 'Generic Default Document Checklist' ? 'Yes, add default checklist' : \`Select from saved: \${c.name}\`}</option>
                      ))}
                    </select>
                  </div>
                )}`;

if (!code.includes("Use Generic Document Checklist?")) {
  code = code.replace(insertAfter, insertAfter + appendCode);
  fs.writeFileSync(pagePath, code, 'utf8');
  console.log("Patched UI Template Modal");
} else {
  console.log("Already patched UI");
}
