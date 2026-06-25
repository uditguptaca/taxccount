const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'dashboard', 'settings', 'page.tsx');
let code = fs.readFileSync(pagePath, 'utf8');

// 1. Add lucide icons
code = code.replace(
  "import { Building2, Users, FileStack, Bell, Calculator, Link2, Save, CheckCircle2, Network, Mail, HardDrive, MessageCircle, Phone, Shield, Key, ExternalLink, Settings, Zap, UserCircle, DollarSign, Plus, Edit2, Trash2 } from 'lucide-react';",
  "import { Building2, Users, FileStack, Bell, Calculator, Link2, Save, CheckCircle2, Network, Mail, HardDrive, MessageCircle, Phone, Shield, Key, ExternalLink, Settings, Zap, UserCircle, DollarSign, Plus, Edit2, Trash2, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';"
);

// 2. Add state and functions before loadFirmProfile
const stateBlock = `  const [checklists, setChecklists] = useState<any[]>([]);
  const loadChecklists = () => {
    fetch('/api/settings/checklists').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setChecklists(d);
    }).catch(() => {});
  };

  const [currencySettings, setCurrencySettings] = useState({ base_currency: 'CAD', currency_display_style: 'code_and_amount' });
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateForm, setRateForm] = useState({ id: '', from_currency: '', to_currency: 'CAD', exchange_rate: '', effective_date: new Date().toISOString().split('T')[0], status: 'active', notes: '' });

  const loadCurrencyData = () => {
    fetch('/api/settings/currency').then(r => r.json()).then(d => {
      if (d.settings) setCurrencySettings({ base_currency: d.settings.base_currency || 'CAD', currency_display_style: d.settings.currency_display_style || 'code_and_amount' });
    }).catch(() => {});
    fetch('/api/settings/exchange-rates').then(r => r.json()).then(d => {
      if (d.rates) setExchangeRates(d.rates);
    }).catch(() => {});
  };

  async function handleSaveCurrencySettings(e: any) {
    e.preventDefault();
    const res = await fetch('/api/settings/currency', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currencySettings) });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  async function handleSaveRate(e: any) {
    e.preventDefault();
    const res = await fetch('/api/settings/exchange-rates', { method: rateForm.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rateForm) });
    if (res.ok) { setShowRateModal(false); loadCurrencyData(); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  async function handleDeleteRate(id: string) {
    if (!confirm('Delete this exchange rate?')) return;
    const res = await fetch(\`/api/settings/exchange-rates?id=\${id}\`, { method: 'DELETE' });
    if (res.ok) loadCurrencyData();
  }

`;
code = code.replace("  const loadFirmProfile = () => {", stateBlock + "  const loadFirmProfile = () => {");

// 3. Update useEffect
code = code.replace(
  "    loadTaxRates();",
  "    loadTaxRates();\n    loadCurrencyData();\n    loadChecklists();"
);

// 4. Update navItems
code = code.replace(
  "    { key: 'integrations', label: 'Integrations', icon: Link2 },",
  "    { key: 'integrations', label: 'Integrations', icon: Link2 },\n    { key: 'currency', label: 'Currency Settings', icon: DollarSign },\n    { key: 'checklists', label: 'Checklist Library', icon: ClipboardList },"
);

// 5. Add rendering blocks before "      {/* Invite Member Modal */}"
const renderBlock = `
      {activeTab === 'currency' && (
        <div className="settings-section">
          <div className="settings-header">
            <h2>Currency Settings</h2>
            <p>Manage your firm&apos;s base currency and exchange rates for dashboard revenue conversion.</p>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Base Dashboard Currency</h3>
            <form onSubmit={handleSaveCurrencySettings}>
              <div className="form-group">
                <label className="form-label">Base Currency</label>
                <select className="form-input" value={currencySettings.base_currency} onChange={e => setCurrencySettings({...currencySettings, base_currency: e.target.value})} style={{ maxWidth: 300 }}>
                  <option value="CAD">CAD</option>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="GBP">GBP</option>
                  <option value="AUD">AUD</option>
                  <option value="EUR">EUR</option>
                </select>
                <div className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Used for dashboard revenue cards, pipeline, and team workload attribution.</div>
              </div>
              <div className="form-group">
                <label className="form-label">Currency Display Style</label>
                <select className="form-input" value={currencySettings.currency_display_style} onChange={e => setCurrencySettings({...currencySettings, currency_display_style: e.target.value})} style={{ maxWidth: 300 }}>
                  <option value="symbol_only">Symbol only (e.g. C$1,000)</option>
                  <option value="code_only">Currency code only (e.g. CAD 1,000)</option>
                  <option value="code_and_amount">Code + amount (e.g. CAD 1,000.00)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Save Base Currency</button>
            </form>
          </div>

          <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>Currency Exchange Rates</h3>
              <p className="text-muted text-sm" style={{ margin: 0 }}>Used to convert foreign currency projects into your base currency.</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setRateForm({ id: '', from_currency: 'USD', to_currency: currencySettings.base_currency, exchange_rate: '', effective_date: new Date().toISOString().split('T')[0], status: 'active', notes: '' }); setShowRateModal(true); }}>Add Exchange Rate</button>
          </div>

          <div className="card">
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>From Currency</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>To Currency</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Exchange Rate</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Effective Date</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exchangeRates.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-gray-500)' }}>
                      No exchange rates found. Add one if you work with foreign currencies.
                    </td>
                  </tr>
                ) : exchangeRates.map(rate => (
                  <tr key={rate.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{rate.from_currency}</td>
                    <td style={{ padding: '12px 16px' }}>{rate.to_currency}</td>
                    <td style={{ padding: '12px 16px' }}>{rate.exchange_rate}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(rate.effective_date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={"badge " + (rate.status === 'active' ? 'badge-success' : 'badge-secondary')}>{rate.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setRateForm({ id: rate.id, from_currency: rate.from_currency, to_currency: rate.to_currency, exchange_rate: rate.exchange_rate, effective_date: rate.effective_date.split('T')[0], status: rate.status, notes: rate.notes || '' }); setShowRateModal(true); }} style={{ padding: '4px', marginRight: 'var(--space-2)' }}>Edit</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDeleteRate(rate.id)} style={{ padding: '4px', color: 'var(--color-danger)' }}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'checklists' && (
        <div className="card">
          <div className="card-header">
            <h3>Checklist Library</h3>
          </div>
          <div className="card-body">
            <p className="text-muted text-sm mb-4">Manage reusable document checklists that can be quickly added to your compliance templates.</p>
            {checklists.length === 0 ? (
              <div className="empty-state">No checklists found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {checklists.map(c => (
                  <div key={c.id} style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-gray-200)', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        {c.description && <div className="text-sm text-muted">{c.description}</div>}
                      </div>
                      <div className="badge badge-blue">{c.items?.length || 0} items</div>
                    </div>
                    <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      {c.items && c.items.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          {c.items.slice(0, 5).map((item: any, i: number) => (
                            <div key={item.id} className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                              <span style={{ color: 'var(--color-gray-400)' }}>{i + 1}.</span> 
                              {item.is_mandatory ? <span style={{ color: 'var(--color-danger)' }}>*</span> : ''}
                              {item.document_name} 
                              <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>{item.suggested_stage ? "Stage: " + item.suggested_stage : ''}</span>
                            </div>
                          ))}
                          {c.items.length > 5 && (
                            <div className="text-xs text-muted" style={{ marginTop: 'var(--space-1)', fontStyle: 'italic' }}>
                              + {c.items.length - 5} more items...
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted">No items in this checklist.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

`;
code = code.replace("      {/* Invite Member Modal */}", renderBlock + "      {/* Invite Member Modal */}");

// 6. Add Rate Modal before final </Fragment>
const rateModalBlock = `
      {showRateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{rateForm.id ? 'Edit Exchange Rate' : 'Add Exchange Rate'}</h2>
              <button className="btn btn-secondary" onClick={() => setShowRateModal(false)} style={{ padding: '4px' }}>✕</button>
            </div>
            <div className="modal-body">
              <form id="rateForm" onSubmit={handleSaveRate}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">From Currency</label>
                    <select className="form-input" value={rateForm.from_currency} onChange={e => setRateForm({...rateForm, from_currency: e.target.value})} required>
                      <option value="">Select</option>
                      <option value="CAD">CAD</option>
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="GBP">GBP</option>
                      <option value="AUD">AUD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">To Currency</label>
                    <input type="text" className="form-input" value={rateForm.to_currency} disabled />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Exchange Rate</label>
                  <input type="number" step="0.0001" className="form-input" value={rateForm.exchange_rate} onChange={e => setRateForm({...rateForm, exchange_rate: e.target.value})} required placeholder="e.g. 1.35 or 0.016" />
                  <div className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Multiply 'From' by this rate to get 'To'.</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Effective Date</label>
                  <input type="date" className="form-input" value={rateForm.effective_date} onChange={e => setRateForm({...rateForm, effective_date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={rateForm.status} onChange={e => setRateForm({...rateForm, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" rows={2} value={rateForm.notes} onChange={e => setRateForm({...rateForm, notes: e.target.value})}></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRateModal(false)}>Cancel</button>
              <button form="rateForm" type="submit" className="btn btn-primary">Save Rate</button>
            </div>
          </div>
        </div>
      )}`;
code = code.replace("    </>", rateModalBlock + "\n    </>");

fs.writeFileSync(pagePath, code, 'utf8');
console.log("Successfully patched settings/page.tsx");
