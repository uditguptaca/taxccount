'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Lock, Sparkles, Calendar, AlertTriangle, Info } from 'lucide-react';

type WizardStep = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

const STEP_LABELS: Record<WizardStep, string> = {
  A: 'Business Details', B: 'Choose Jurisdiction', C: 'Answer Questions',
  D: 'Select Compliances', E: 'Set Key Dates', F: 'Review & Confirm',
};

export default function BrowseCompliancesPage() {
  const [step, setStep] = useState<WizardStep>('A');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdItems, setCreatedItems] = useState<any[]>([]);

  // Step A: Business details
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBn] = useState('');
  const [directors, setDirectors] = useState('');
  const [contactPerson, setCp] = useState('');
  const [address, setAddress] = useState('');

  // Step B: Jurisdiction
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [selCountry, setSelCountry] = useState('');
  const [selState, setSelState] = useState('');
  const [selEntity, setSelEntity] = useState('');

  // Step C: Questions
  const [compulsory, setCompulsory] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [discoveryMethod, setDiscoveryMethod] = useState('auto_discovery');

  // Step D: Select compliances
  const [suggestedCompliances, setSuggested] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedBrief, setExpandedBrief] = useState<string | null>(null);

  // Step E: Dates
  const [baseDates, setBaseDates] = useState<Record<string, string>>({});
  const [calculatedResults, setCalculatedResults] = useState<any[]>([]);
  const [confirmedDates, setConfirmedDates] = useState<Record<string, string>>({});

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('user') || '{}')); } catch {}
  }, []);

  // Load reference data for Step B
  useEffect(() => {
    fetch('/api/portal/browse?action=countries').then(r => r.json()).then(setCountries);
    fetch('/api/portal/browse?action=entity-types').then(r => r.json()).then(setEntityTypes);
  }, []);

  useEffect(() => {
    if (selCountry) {
      fetch(`/api/portal/browse?action=states&countryId=${selCountry}`).then(r => r.json()).then(setStates);
      setSelState(''); // reset
    }
  }, [selCountry]);

  // Step B → C: Load discovery data
  const loadDiscovery = async () => {
    setLoading(true);
    // Save profile first
    const profileRes = await fetch('/api/portal/browse', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save-profile', userId: user?.id, country_id: selCountry, state_id: selState,
        entity_type_id: selEntity, company_name: companyName, business_number: businessNumber,
        directors: directors, contact_person: contactPerson, address: address,
        discovery_method: discoveryMethod,
      }),
    });
    const profileData = await profileRes.json();
    setProfileId(profileData.id);

    // Load questions
    const discRes = await fetch(`/api/portal/browse?action=discover&countryId=${selCountry}&stateId=${selState}&entityTypeId=${selEntity}`);
    const discData = await discRes.json();
    setCompulsory(discData.compulsory || []);
    setQuestions(discData.questions || []);
    setLoading(false);
    setStep('C');
  };

  // Step C → D: Run suggestion engine
  const runSuggestionEngine = async () => {
    setLoading(true);
    // Save answers
    const answerArr = Object.entries(answers).map(([qId, ans]) => ({ questionId: qId, answer: ans }));
    await fetch('/api/portal/browse', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save-answers', userId: user?.id, profileId, answers: answerArr }),
    });

    // Get suggestions
    const sugRes = await fetch('/api/portal/browse', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'suggest', countryId: selCountry, stateId: selState, entityTypeId: selEntity, answers: answerArr,
      }),
    });
    const suggested = await sugRes.json();
    setSuggested(suggested);

    // Pre-select compulsory and auto-suggested
    const preSelected = new Set<string>();
    suggested.forEach((s: any) => {
      if (s.selectionMethod === 'compulsory' || s.selectionMethod === 'auto_suggested') {
        preSelected.add(s.sub_compliance_id);
      }
    });
    setSelectedIds(preSelected);
    setLoading(false);
    setStep('D');
  };

  // Step D → E: Calculate dates
  const calculateDates = async () => {
    setLoading(true);
    const selectedCompliances = suggestedCompliances.filter(s => selectedIds.has(s.sub_compliance_id));
    setCalculatedResults(selectedCompliances); // We'll calc after user enters dates
    setLoading(false);
    setStep('E');
  };

  const runDateCalc = async () => {
    setLoading(true);
    const selectedCompliances = suggestedCompliances.filter(s => selectedIds.has(s.sub_compliance_id));
    const res = await fetch('/api/portal/browse', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'calculate-dates', countryId: selCountry, selectedCompliances, baseDates,
      }),
    });
    const data = await res.json();
    setCalculatedResults(data.results || []);
    // Pre-fill confirmed dates
    const preConfirmed: Record<string, string> = {};
    (data.results || []).forEach((r: any) => {
      if (r.calculated?.nextDueDate) preConfirmed[r.sub_compliance_id] = r.calculated.nextDueDate;
    });
    setConfirmedDates(preConfirmed);
    setLoading(false);
  };

  // Step F: Final submission
  const submitFinal = async () => {
    setSaving(true);
    const selectedCompliances = calculatedResults.filter(r => selectedIds.has(r.sub_compliance_id));
    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : {};

    const res = await fetch('/api/portal/browse', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'select', userId: user?.id, profileId,
        selectedCompliances, confirmedDates, orgId: userData.org_id || null,
      }),
    });
    const result = await res.json();
    setCreatedItems(result.items || []);
    setSuccess(true);
    setSaving(false);
  };

  const toggleSelection = (scId: string, isCompulsory: boolean) => {
    if (isCompulsory) return; // Can't deselect compulsory
    const next = new Set(selectedIds);
    if (next.has(scId)) next.delete(scId);
    else next.add(scId);
    setSelectedIds(next);
  };

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>Compliances Added Successfully!</h1>
          <p style={{ color: '#6b7280', marginTop: 8, fontSize: 16 }}>{createdItems.length} compliance(s) have been added to your vault</p>
          <div style={{ maxWidth: 500, margin: '24px auto 0', textAlign: 'left' }}>
            {createdItems.map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: '#f0fdf4', borderRadius: 8, marginBottom: 8, border: '1px solid #bbf7d0' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>✅ {item.name}</span>
                <span style={{ fontSize: 13, color: '#166534' }}>{item.dueDate || 'No date'}</span>
              </div>
            ))}
          </div>
          <button onClick={() => window.location.href = '/portal/vault'} style={{ ...primaryBtn, marginTop: 24 }}>
            Go to My Vault →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
        {(Object.keys(STEP_LABELS) as WizardStep[]).map((s) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{ height: 4, borderRadius: 2, background: s <= step ? '#4f46e5' : '#e5e7eb', transition: 'all 0.3s' }} />
            <div style={{ fontSize: 11, color: s === step ? '#4f46e5' : '#9ca3af', marginTop: 4, fontWeight: s === step ? 700 : 400 }}>
              Step {s}: {STEP_LABELS[s]}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════ STEP A: Business Details ═══════════════ */}
      {step === 'A' && (
        <div>
          <h2 style={headingStyle}>🏢 Business Details</h2>
          <p style={subStyle}>Tell us about your business so we can find applicable compliances</p>
          <div style={formGrid}>
            <div style={fieldWrap}><label style={label}>Company/Individual Name *</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} style={input} placeholder="e.g., QM Consulting Corp." /></div>
            <div style={fieldWrap}><label style={label}>Business Number</label><input value={businessNumber} onChange={e => setBn(e.target.value)} style={input} placeholder="e.g., 123456789" /></div>
            <div style={fieldWrap}><label style={label}>Directors / Principals</label><input value={directors} onChange={e => setDirectors(e.target.value)} style={input} placeholder="e.g., John Smith, Jane Doe" /></div>
            <div style={fieldWrap}><label style={label}>Contact Person</label><input value={contactPerson} onChange={e => setCp(e.target.value)} style={input} placeholder="Primary contact name" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>Address</label><textarea value={address} onChange={e => setAddress(e.target.value)} style={{ ...input, minHeight: 60 }} placeholder="Full business address" /></div>
          </div>
          <div style={navBar}>
            <div />
            <button onClick={() => companyName ? setStep('B') : alert('Please enter a name')} style={primaryBtn} disabled={!companyName}>Next: Choose Jurisdiction <ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP B: Jurisdiction ═══════════════ */}
      {step === 'B' && (
        <div>
          <h2 style={headingStyle}>🌍 Choose Your Jurisdiction</h2>
          <p style={subStyle}>Select your country, state/province, and entity type</p>
          <div style={{ ...formGrid, gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div style={fieldWrap}>
              <label style={label}>Country *</label>
              <select value={selCountry} onChange={e => setSelCountry(e.target.value)} style={input}>
                <option value="">Select Country...</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}{c.iso_code ? ` (${c.iso_code})` : ''}</option>)}
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={label}>State / Province *</label>
              <select value={selState} onChange={e => setSelState(e.target.value)} style={input} disabled={!selCountry}>
                <option value="">Select State...</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>)}
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={label}>Entity Type *</label>
              <select value={selEntity} onChange={e => setSelEntity(e.target.value)} style={input}>
                <option value="">Select Type...</option>
                {entityTypes.map(e2 => <option key={e2.id} value={e2.id}>{e2.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ margin: '20px 0', padding: 16, background: '#eef2ff', borderRadius: 8, border: '1px solid #c7d2fe' }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#3730a3', marginBottom: 8 }}>Discovery Method</h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="radio" checked={discoveryMethod === 'auto_discovery'} onChange={() => setDiscoveryMethod('auto_discovery')} />
              <Sparkles size={14} style={{ color: '#4f46e5' }} /> <strong>Auto-Discovery</strong> — Answer questions and let the system suggest compliances
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="radio" checked={discoveryMethod === 'manual_selection'} onChange={() => setDiscoveryMethod('manual_selection')} />
              <Check size={14} /> <strong>Manual Selection</strong> — Browse and select compliances yourself
            </label>
          </div>

          <div style={navBar}>
            <button onClick={() => setStep('A')} style={secBtn}><ChevronLeft size={16} /> Back</button>
            <button onClick={loadDiscovery} style={primaryBtn} disabled={!selCountry || !selState || !selEntity || loading}>
              {loading ? 'Loading...' : discoveryMethod === 'auto_discovery' ? 'Next: Answer Questions' : 'Next: Browse Compliances'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP C: Questions ═══════════════ */}
      {step === 'C' && (
        <div>
          <h2 style={headingStyle}>❓ Applicability Questions</h2>
          <p style={subStyle}>Your answers help us determine which compliances apply to your specific situation</p>

          {compulsory.length > 0 && (
            <div style={{ marginBottom: 24, padding: 16, background: '#fefce8', borderRadius: 8, border: '1px solid #fde68a' }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>🔒 Compulsory Compliances (Auto-Selected)</h4>
              {compulsory.map((c: any) => (
                <div key={c.sub_compliance_id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#78350f', padding: '4px 0' }}>
                  <Lock size={12} /> {c.name} <span style={{ color: '#a16207', fontStyle: 'italic' }}>({c.compliance_head_name})</span>
                </div>
              ))}
            </div>
          )}

          {questions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questions.map(q => (
                <div key={q.id} style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: answers[q.id] ? '#f0fdf4' : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{q.question_text}</div>
                      {q.description && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{q.description}</div>}
                      {q.threshold_context && <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 4, fontStyle: 'italic' }}>💡 {q.threshold_context}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                      <button onClick={() => setAnswers({ ...answers, [q.id]: 'yes' })}
                        style={{ ...choiceBtn, ...(answers[q.id] === 'yes' ? { background: '#4f46e5', color: '#fff', borderColor: '#4f46e5' } : {}) }}>Yes</button>
                      <button onClick={() => setAnswers({ ...answers, [q.id]: 'no' })}
                        style={{ ...choiceBtn, ...(answers[q.id] === 'no' ? { background: '#ef4444', color: '#fff', borderColor: '#ef4444' } : {}) }}>No</button>
                    </div>
                  </div>

                  {/* Child questions */}
                  {answers[q.id] === 'yes' && q.children && q.children.length > 0 && (
                    <div style={{ marginTop: 12, paddingLeft: 20, borderLeft: '3px solid #c7d2fe' }}>
                      {q.children.map((cq: any) => (
                        <div key={cq.id} style={{ padding: '8px 0' }}>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>↳ {cq.question_text}</div>
                          {cq.threshold_context && <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 2 }}>💡 {cq.threshold_context}</div>}
                          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                            <button onClick={() => setAnswers({ ...answers, [cq.id]: 'yes' })}
                              style={{ ...choiceBtnSm, ...(answers[cq.id] === 'yes' ? { background: '#4f46e5', color: '#fff' } : {}) }}>Yes</button>
                            <button onClick={() => setAnswers({ ...answers, [cq.id]: 'no' })}
                              style={{ ...choiceBtnSm, ...(answers[cq.id] === 'no' ? { background: '#ef4444', color: '#fff' } : {}) }}>No</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              <Sparkles size={32} style={{ margin: '0 auto 12px', color: '#4f46e5' }} />
              <p>No additional questions for your jurisdiction. Proceed to see available compliances.</p>
            </div>
          )}

          <div style={navBar}>
            <button onClick={() => setStep('B')} style={secBtn}><ChevronLeft size={16} /> Back</button>
            <button onClick={runSuggestionEngine} style={primaryBtn} disabled={loading}>
              {loading ? 'Running Intelligence Engine...' : 'Next: View Suggestions'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP D: Select Compliances ═══════════════ */}
      {step === 'D' && (
        <div>
          <h2 style={headingStyle}>✅ Select Your Compliances</h2>
          <p style={subStyle}>
            Based on your answers, we've analyzed {suggestedCompliances.length} compliance(s).
            <strong> {selectedIds.size}</strong> selected so far.
          </p>

          {/* Group by compliance head */}
          {(() => {
            const grouped = suggestedCompliances.reduce((acc: any, s: any) => {
              const key = s.compliance_head_name || 'Other';
              if (!acc[key]) acc[key] = { color: s.compliance_head_color, icon: s.compliance_head_icon, items: [] };
              acc[key].items.push(s);
              return acc;
            }, {} as Record<string, { color: string; icon: string; items: any[] }>);

            return Object.entries(grouped).map(([headName, group]: [string, any]) => (
              <div key={headName} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: group.color || '#111', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{group.icon || '📄'}</span> {headName}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.items.map((s: any) => {
                    const isSelected = selectedIds.has(s.sub_compliance_id);
                    const isCompulsory = s.selectionMethod === 'compulsory';
                    const isAutoSuggested = s.selectionMethod === 'auto_suggested';
                    return (
                      <div key={s.sub_compliance_id}
                        onClick={() => toggleSelection(s.sub_compliance_id, isCompulsory)}
                        style={{
                          padding: 16, borderRadius: 8, cursor: isCompulsory ? 'default' : 'pointer',
                          border: `2px solid ${isSelected ? '#4f46e5' : '#e5e7eb'}`,
                          background: isSelected ? '#eef2ff' : '#fff',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: isSelected ? '#4f46e5' : '#fff', border: isSelected ? 'none' : '2px solid #d1d5db',
                            }}>
                              {isSelected && <Check size={14} color="#fff" />}
                              {isCompulsory && <Lock size={10} color="#fff" />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                              {s.description && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.description}</div>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isCompulsory && <span style={{ ...badge, background: '#fef2f2', color: '#dc2626' }}>🔒 Compulsory</span>}
                            {isAutoSuggested && <span style={{ ...badge, background: '#eef2ff', color: '#4f46e5' }}>✨ Auto-Suggested</span>}
                            {!isCompulsory && !isAutoSuggested && <span style={{ ...badge, background: '#f3f4f6', color: '#6b7280' }}>Available</span>}
                            {s.brief && (
                              <button onClick={(e) => { e.stopPropagation(); setExpandedBrief(expandedBrief === s.sub_compliance_id ? null : s.sub_compliance_id); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5' }}>
                                <Info size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                        {s.reason && <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 6, fontStyle: 'italic' }}>{s.reason}</div>}
                        {expandedBrief === s.sub_compliance_id && s.brief && (
                          <div style={{ marginTop: 12, padding: 12, background: '#f9fafb', borderRadius: 6, fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
                            {s.brief}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}

          <div style={navBar}>
            <button onClick={() => setStep('C')} style={secBtn}><ChevronLeft size={16} /> Back</button>
            <button onClick={calculateDates} style={primaryBtn} disabled={selectedIds.size === 0 || loading}>
              {loading ? 'Processing...' : `Next: Set Dates (${selectedIds.size} selected)`} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP E: Key Dates ═══════════════ */}
      {step === 'E' && (
        <div>
          <h2 style={headingStyle}>📅 Enter Key Dates</h2>
          <p style={subStyle}>Enter your business anchor dates so we can calculate all compliance deadlines automatically</p>

          {/* Base date inputs */}
          <div style={{ marginBottom: 24, padding: 20, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} /> Anchor Dates
            </h3>
            <div style={{ ...formGrid, gridTemplateColumns: '1fr 1fr' }}>
              <div style={fieldWrap}>
                <label style={label}>Financial Year End (Corporate Tax)</label>
                <input type="date" value={baseDates['financial_year_corporate_tax'] || ''} onChange={e => setBaseDates({ ...baseDates, financial_year_corporate_tax: e.target.value })} style={input} />
              </div>
              <div style={fieldWrap}>
                <label style={label}>Incorporation Date (Federal)</label>
                <input type="date" value={baseDates['incorporation_date_federal'] || ''} onChange={e => setBaseDates({ ...baseDates, incorporation_date_federal: e.target.value })} style={input} />
              </div>
              <div style={fieldWrap}>
                <label style={label}>Incorporation Date (Provincial)</label>
                <input type="date" value={baseDates['incorporation_date_provincial'] || ''} onChange={e => setBaseDates({ ...baseDates, incorporation_date_provincial: e.target.value })} style={input} />
              </div>
              <div style={fieldWrap}>
                <label style={label}>Financial Year End (GST)</label>
                <input type="date" value={baseDates['financial_year_gst'] || ''} onChange={e => setBaseDates({ ...baseDates, financial_year_gst: e.target.value })} style={input} />
              </div>
              <div style={fieldWrap}>
                <label style={label}>Financial Year End (Payroll)</label>
                <input type="date" value={baseDates['financial_year_payroll'] || ''} onChange={e => setBaseDates({ ...baseDates, financial_year_payroll: e.target.value })} style={input} />
              </div>
              <div style={fieldWrap}>
                <label style={label}>Calendar Year Fixed Date</label>
                <input type="date" value={baseDates['calendar_year_fixed'] || ''} onChange={e => setBaseDates({ ...baseDates, calendar_year_fixed: e.target.value })} style={input} />
              </div>
            </div>
            <button onClick={runDateCalc} style={{ ...primaryBtn, marginTop: 16 }} disabled={loading}>
              {loading ? 'Calculating...' : '🧮 Calculate All Due Dates'}
            </button>
          </div>

          {/* Calculated results */}
          {calculatedResults.length > 0 && calculatedResults[0]?.calculated && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 12 }}>📊 Calculated Results</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                <thead><tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={thS}>Compliance</th><th style={thS}>Formula</th><th style={thS}>Next Due Date</th><th style={thS}>Recurrence</th><th style={thS}>Confirmed Date</th>
                </tr></thead>
                <tbody>
                  {calculatedResults.filter(r => r.calculated).map(r => (
                    <tr key={r.sub_compliance_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ ...tdS, fontWeight: 600 }}>{r.name}</td>
                      <td style={{ ...tdS, fontSize: 11, fontFamily: 'monospace', color: '#7c3aed' }}>{r.calculated.formulaExplanation}</td>
                      <td style={tdS}><span style={{ fontWeight: 700, color: '#059669' }}>{r.calculated.nextDueDate}</span></td>
                      <td style={tdS}>{r.calculated.recurrenceLabel}</td>
                      <td style={tdS}>
                        <input type="date" value={confirmedDates[r.sub_compliance_id] || ''} onChange={e => setConfirmedDates({ ...confirmedDates, [r.sub_compliance_id]: e.target.value })} style={{ ...input, width: 160 }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={navBar}>
            <button onClick={() => setStep('D')} style={secBtn}><ChevronLeft size={16} /> Back</button>
            <button onClick={() => setStep('F')} style={primaryBtn}>Next: Review & Confirm <ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP F: Review & Confirm ═══════════════ */}
      {step === 'F' && (
        <div>
          <h2 style={headingStyle}>📋 Review & Confirm</h2>
          <p style={subStyle}>Review your selections and confirm to add these compliances to your vault</p>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, background: '#eef2ff', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#4f46e5' }}>{companyName}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Business Name</div>
            </div>
            <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>{selectedIds.size}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Compliances Selected</div>
            </div>
            <div style={{ padding: 16, background: '#fefce8', borderRadius: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>{Object.keys(confirmedDates).length}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Dates Confirmed</div>
            </div>
          </div>

          {/* Compliance list */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            {calculatedResults.filter(r => selectedIds.has(r.sub_compliance_id)).map((r, i) => (
              <div key={r.sub_compliance_id} style={{ padding: 16, borderBottom: i < calculatedResults.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{r.compliance_head_name} • {r.selectionMethod === 'compulsory' ? '🔒 Compulsory' : r.selectionMethod === 'auto_suggested' ? '✨ Suggested' : '📌 Manual'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {confirmedDates[r.sub_compliance_id] && (
                    <>
                      <div style={{ fontWeight: 700, color: '#059669', fontSize: 14 }}>{confirmedDates[r.sub_compliance_id]}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{r.calculated?.recurrenceLabel || 'One-time'}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Undertaking */}
          <div style={{ margin: '24px 0', padding: 16, background: '#fefce8', borderRadius: 8, border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} style={{ color: '#d97706' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>By confirming, you acknowledge that all information provided is accurate and agree to the undertaking terms for each compliance.</span>
            </div>
          </div>

          <div style={navBar}>
            <button onClick={() => setStep('E')} style={secBtn}><ChevronLeft size={16} /> Back</button>
            <button onClick={submitFinal} style={{ ...primaryBtn, background: '#059669' }} disabled={saving}>
              {saving ? 'Adding to Vault...' : `✅ Confirm & Add ${selectedIds.size} Compliance(s) to Vault`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const containerStyle: React.CSSProperties = { maxWidth: 900, margin: '0 auto', padding: 24 };
const headingStyle: React.CSSProperties = { fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 };
const subStyle: React.CSSProperties = { fontSize: 14, color: '#6b7280', marginBottom: 24 };
const formGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
const fieldWrap: React.CSSProperties = {};
const label: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };
const input: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const navBar: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 16, borderTop: '1px solid #e5e7eb' };
const primaryBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#4f46e5', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 };
const secBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#374151' };
const choiceBtn: React.CSSProperties = { padding: '8px 20px', borderRadius: 6, border: '2px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const choiceBtnSm: React.CSSProperties = { padding: '4px 14px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500 };
const badge: React.CSSProperties = { padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 };
const thS: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' };
const tdS: React.CSSProperties = { padding: '10px 12px', fontSize: 13 };
