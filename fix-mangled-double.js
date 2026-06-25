const fs = require('fs');
let lines = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8').split(/\\r?\\n/);

let sIdx = lines.findIndex(l => l.includes('onClick={() => handleDisconnectIntegration(int.id)}>Disconnect</button>'));
let eIdx = lines.findIndex(l => l.includes("{activeTab === 'currency' && ("));

if (sIdx !== -1 && eIdx !== -1) {
  // We want to replace from sIdx + 1 to eIdx - 1
  const replacement = [
    "                            </>",
    "                          ) : (",
    "                            <button className=\\"btn btn-primary btn-sm\\" style={{ flex: 1, background: int.color, borderColor: int.color }} onClick={() => openIntegrationConfig(int)}><Key size={13} /> Connect & Configure</button>",
    "                          )}",
    "                        </div>",
    "                      </div>",
    "                    </div>",
    "                  );",
    "                })}",
    "              </div>",
    "            </div>",
    "          )}",
    ""
  ];
  
  lines.splice(sIdx + 1, eIdx - sIdx - 1, ...replacement);
  
  const rateModal = [
    "      {/* Exchange Rate Modal */}",
    "      {showRateModal && (",
    "        <div className=\\"modal-overlay\\" onClick={() => setShowRateModal(false)}>",
    "          <div className=\\"modal\\" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>",
    "            <div className=\\"modal-header\\">",
    "              <h2>{rateForm.id ? 'Edit Exchange Rate' : 'Add Exchange Rate'}</h2>",
    "              <button className=\\"btn btn-ghost btn-sm\\" onClick={() => setShowRateModal(false)}>✕</button>",
    "            </div>",
    "            <form id=\\"rateForm\\" onSubmit={handleSaveRate}>",
    "              <div className=\\"modal-body\\">",
    "                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>",
    "                  <div className=\\"form-group\\" style={{ flex: 1, marginBottom: 0 }}>",
    "                    <label className=\\"form-label\\">From Currency</label>",
    "                    <select className=\\"form-input\\" value={rateForm.from_currency} onChange={e => setRateForm({...rateForm, from_currency: e.target.value})} required>",
    "                      <option value=\\"\\">Select</option>",
    "                      <option value=\\"CAD\\">CAD</option>",
    "                      <option value=\\"USD\\">USD</option>",
    "                      <option value=\\"INR\\">INR</option>",
    "                      <option value=\\"GBP\\">GBP</option>",
    "                      <option value=\\"AUD\\">AUD</option>",
    "                      <option value=\\"EUR\\">EUR</option>",
    "                    </select>",
    "                  </div>",
    "                  <div className=\\"form-group\\" style={{ flex: 1, marginBottom: 0 }}>",
    "                    <label className=\\"form-label\\">To Currency</label>",
    "                    <input type=\\"text\\" className=\\"form-input\\" value={rateForm.to_currency} disabled />",
    "                  </div>",
    "                </div>",
    "                <div className=\\"form-group\\">",
    "                  <label className=\\"form-label\\">Exchange Rate</label>",
    "                  <input type=\\"number\\" step=\\"0.0001\\" className=\\"form-input\\" value={rateForm.exchange_rate} onChange={e => setRateForm({...rateForm, exchange_rate: e.target.value})} required placeholder=\\"e.g. 1.35 or 0.016\\" />",
    "                  <div className=\\"text-muted text-sm\\" style={{ marginTop: 'var(--space-1)' }}>Multiply 'From' by this rate to get 'To'.</div>",
    "                </div>",
    "                <div className=\\"form-group\\">",
    "                  <label className=\\"form-label\\">Effective Date</label>",
    "                  <input type=\\"date\\" className=\\"form-input\\" value={rateForm.effective_date} onChange={e => setRateForm({...rateForm, effective_date: e.target.value})} required />",
    "                </div>",
    "                <div className=\\"form-group\\">",
    "                  <label className=\\"form-label\\">Status</label>",
    "                  <select className=\\"form-input\\" value={rateForm.status} onChange={e => setRateForm({...rateForm, status: e.target.value})}>",
    "                    <option value=\\"active\\">Active</option>",
    "                    <option value=\\"inactive\\">Inactive</option>",
    "                  </select>",
    "                </div>",
    "                <div className=\\"form-group\\">",
    "                  <label className=\\"form-label\\">Notes</label>",
    "                  <textarea className=\\"form-input\\" rows={2} value={rateForm.notes} onChange={e => setRateForm({...rateForm, notes: e.target.value})}></textarea>",
    "                </div>",
    "              </div>",
    "              <div className=\\"modal-footer\\">",
    "                <button type=\\"button\\" className=\\"btn btn-secondary\\" onClick={() => setShowRateModal(false)}>Cancel</button>",
    "                <button type=\\"submit\\" className=\\"btn btn-primary\\">Save Rate</button>",
    "              </div>",
    "            </form>",
    "          </div>",
    "        </div>",
    "      )}"
  ];

  const lastFragmentClose = lines.lastIndexOf('    </>');
  lines.splice(lastFragmentClose, 0, ...rateModal);
  
  fs.writeFileSync('src/app/dashboard/settings/page.tsx', lines.join('\\n'), 'utf8');
  console.log('Successfully fixed using splice line by line!');
} else {
  console.log('Could not find start or end indices!');
}
