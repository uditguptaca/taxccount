'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, ClipboardList, Globe, ShieldCheck, Info, Eye, ArrowLeft, ArrowRight, Check, CheckCircle2, AlertCircle, Sparkles, MessageSquare, Bot, Cpu } from 'lucide-react';

function getQuestionExplanation(qText: string, helpText?: string, desc?: string): string {
  if (helpText) return helpText;
  if (desc) return desc;
  
  const text = qText.toLowerCase();
  if (text.includes('t4') && text.includes('employment')) {
    return 'The T4 slip is the Statement of Remuneration Paid, showing employment earnings and deductions (CPP, EI, tax withheld).';
  }
  if (text.includes('t5') && text.includes('investment')) {
    return 'The T5 slip is the Statement of Investment Income, which reports interest, dividends, and investment earnings.';
  }
  if (text.includes('t3') && text.includes('trust')) {
    return 'The T3 slip reports income from trust allocations or mutual funds.';
  }
  if (text.includes('rrsp') || text.includes('rrif')) {
    return 'Registered Retirement Savings Plan contributions can be deducted to reduce your taxable income. Unused room carries forward.';
  }
  if (text.includes('first home') || text.includes('fhsa')) {
    return 'First Home Savings Account contributions are tax-deductible, and qualifying withdrawals to buy a home are tax-free.';
  }
  if (text.includes('t4a')) {
    return 'The T4A slip is the Statement of Pension, Retirement, Annuity, and Other Income.';
  }
  if (text.includes('t4e') || text.includes('employment insurance')) {
    return 'The T4E slip is the Statement of Employment Insurance and Other Benefits.';
  }
  if (text.includes('t5013')) {
    return 'The T5013 slip reports partnership income, losses, and deductions.';
  }
  if (text.includes('t5008') || text.includes('stocks') || text.includes('mutual funds')) {
    return 'The T5008 reports securities transactions. Used to calculate capital gains or losses.';
  }
  if (text.includes('t5007') || text.includes('workers\' compensation') || text.includes('social assistance')) {
    return 'The T5007 reports workers\' compensation benefits or social assistance payments.';
  }
  if (text.includes('cpp') || text.includes('qpp')) {
    return 'Canada Pension Plan or Quebec Pension Plan benefits received during the year.';
  }
  if (text.includes('old age security') || text.includes('oas')) {
    return 'Old Age Security pension benefits received by seniors aged 65 and older.';
  }
  if (text.includes('notice of assessment') || text.includes('notice of reassessment')) {
    return 'The Notice of Assessment is the document sent by the CRA after your tax return is processed, showing carryforward limits.';
  }
  if (text.includes('charitable') || text.includes('donation')) {
    return 'Donations to registered Canadian charities can be claimed for a non-refundable tax credit.';
  }
  if (text.includes('medical expense')) {
    return 'Claim medical receipts for yourself, spouse, or dependents. Must exceed a CRA threshold to qualify.';
  }
  if (text.includes('tuition') || text.includes('t2202') || text.includes('college') || text.includes('university')) {
    return 'The T2202 reports tuition fees paid to eligible post-secondary institutions.';
  }
  if (text.includes('student-loan')) {
    return 'Interest paid on government student loans is eligible for a non-refundable tax credit.';
  }
  if (text.includes('child-care') || text.includes('child care')) {
    return 'Deduct payments made to caregivers or day nurseries to allow you to work or study.';
  }
  if (text.includes('home buyers\' plan') || text.includes('hbp')) {
    return 'The HBP allows you to withdraw up to $60,000 from RRSPs tax-free to buy a home, repayable over 15 years.';
  }
  if (text.includes('lifelong learning') || text.includes('llp')) {
    return 'The LLP allows you to withdraw up to $20,000 from RRSPs tax-free to finance training or education.';
  }
  if (text.includes('disability')) {
    return 'The Disability Tax Credit (DTC) is a non-refundable credit for individuals with severe and prolonged impairments.';
  }
  if (text.includes('moved') || text.includes('moving expenses')) {
    return 'Deduct moving costs if you moved at least 40 km closer to a new job or post-secondary school.';
  }
  if (text.includes('self-employment') || text.includes('sole proprietorship')) {
    return 'Business income and expenses for self-employed individuals, freelancers, and sole proprietors.';
  }
  if (text.includes('rental property')) {
    return 'Rental income and associated expenses (mortgage interest, property taxes, repairs) for properties you own.';
  }
  if (text.includes('foreign property') || text.includes('1135')) {
    return 'If you owned specified foreign property costing more than CAD $100,000, you must report it.';
  }
  if (text.includes('worked from home') || text.includes('t777')) {
    return 'Deduct home office expenses if you worked from home due to employment requirements.';
  }
  if (text.includes('sin') || text.includes('social insurance number')) {
    return 'Your 9-digit Social Insurance Number (SIN) is required for CRA tax filing identification.';
  }
  if (text.includes('province') || text.includes('residence')) {
    return 'Your province or territory of residence on December 31 determines your provincial tax rates.';
  }
  if (text.includes('marital status') || text.includes('married') || text.includes('common-law')) {
    return 'Your legal marital status on December 31 affects family-based tax credit calculations.';
  }
  if (text.includes('dependents') || text.includes('child') || text.includes('children')) {
    return 'Dependents (children, infirm relatives) can qualify you for family credits and transfers.';
  }
  if (text.includes('box 14')) {
    return 'Box 14: Total employment income before deductions. This is usually the main figure on your T4 slip.';
  }
  if (text.includes('box 16')) {
    return 'Box 16: Employee\'s Canada Pension Plan (CPP) contributions withheld from earnings.';
  }
  if (text.includes('box 18')) {
    return 'Box 18: Employee\'s Employment Insurance (EI) premiums withheld from earnings.';
  }
  if (text.includes('box 22')) {
    return 'Box 22: Income tax deducted. This is the total federal and provincial income tax withheld from your pay.';
  }
  if (text.includes('box 20')) {
    return 'Box 20: Registered Pension Plan (RPP) contributions you made during the year.';
  }
  if (text.includes('box 52')) {
    return 'Box 52: Pension Adjustment. Reports the value of the pension benefit you earned, affecting next year\'s RRSP limit.';
  }
  if (text.includes('box 44')) {
    return 'Box 44: Union dues paid for membership in a trade union or association.';
  }
  
  return `Enter information or select options for ${qText.replace(/[?.:]/g, '')}.`;
}

export default function PlatformSuperFormsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');
  const [serviceLineFilter, setServiceLineFilter] = useState('All');

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    form_code: '',
    country: 'Canada',
    service_type: 'Accounting firm',
    service_line: 'Direct tax',
    description: ''
  });

  // Preview State
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});
  const [currentPreviewSectionIdx, setCurrentPreviewSectionIdx] = useState(0);

  const [ocrFiles, setOcrFiles] = useState<any[]>([]);
  const [ocrUploading, setOcrUploading] = useState(false);
  const [ocrProgressStep, setOcrProgressStep] = useState(0);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  const [connectedToCra, setConnectedToCra] = useState(false);
  const [showCraAuthModal, setShowCraAuthModal] = useState(false);
  const [craLoading, setCraLoading] = useState(false);



  const handlePreviewClick = async (templateId: string) => {
    try {
      setPreviewLoading(true);
      const res = await fetch(`/api/platform/super-forms/${templateId}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewTemplate(data);
        setPreviewResponses({});
        setCurrentPreviewSectionIdx(0);
        setOcrSuccess(false);
        setConnectedToCra(false);
      } else {
        alert('Failed to load template preview details.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };


  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/platform/super-forms');
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/platform/super-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewForm({
          name: '',
          form_code: '',
          country: 'Canada',
          service_type: 'Accounting firm',
          service_line: 'Direct tax',
          description: ''
        });
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Super Form template?')) return;
    try {
      const res = await fetch(`/api/platform/super-forms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (t.form_code && t.form_code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCountry = countryFilter === 'All' || t.country === countryFilter;
    const matchesType = serviceTypeFilter === 'All' || t.service_type === serviceTypeFilter;
    const matchesLine = serviceLineFilter === 'All' || t.service_line === serviceLineFilter;
    return matchesSearch && matchesCountry && matchesType && matchesLine;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={26} style={{ color: '#4f46e5' }} /> Super Forms Master Catalogue
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Register professional, developer-locked templates categorized by service line for Consultant Admins.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.15)',
            transition: 'background 0.2s'
          }}
        >
          <Plus size={16} /> Add Super Form
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        background: '#f8fafc',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search templates by name or code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              background: 'white'
            }}
          />
        </div>

        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            outline: 'none',
            background: 'white',
            minWidth: '150px'
          }}
        >
          <option value="All">All Countries</option>
          <option value="USA">USA 🇺🇸</option>
          <option value="Canada">Canada 🍁</option>
          <option value="India">India 🇮🇳</option>
        </select>

        <select
          value={serviceTypeFilter}
          onChange={e => {
            const val = e.target.value;
            setServiceTypeFilter(val);
            // Reset sub-service if not accounting firm
            if (val !== 'All' && val !== 'Accounting firm') {
              setServiceLineFilter('All');
            }
          }}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            outline: 'none',
            background: 'white',
            minWidth: '180px'
          }}
        >
          <option value="All">All Service Lines</option>
          <option value="Accounting firm">Accounting firm</option>
          <option value="Investment firm">Investment firm</option>
          <option value="ISO">ISO</option>
        </select>

        <select
          value={serviceLineFilter}
          onChange={e => setServiceLineFilter(e.target.value)}
          disabled={serviceTypeFilter !== 'All' && serviceTypeFilter !== 'Accounting firm'}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            outline: 'none',
            background: (serviceTypeFilter !== 'All' && serviceTypeFilter !== 'Accounting firm') ? '#f1f5f9' : 'white',
            minWidth: '180px',
            cursor: (serviceTypeFilter !== 'All' && serviceTypeFilter !== 'Accounting firm') ? 'not-allowed' : 'pointer'
          }}
        >
          <option value="All">
            {(serviceTypeFilter !== 'All' && serviceTypeFilter !== 'Accounting firm') ? 'Sub-Service: N/A' : 'All Sub-Services'}
          </option>
          <option value="Direct tax">Direct tax</option>
          <option value="Indirect tax">Indirect tax</option>
          <option value="Payroll">Payroll</option>
          <option value="Annual Return">Annual Return</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <p style={{ fontWeight: 500 }}>Loading Super Forms catalogue...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          border: '1px dashed #cbd5e1',
          borderRadius: '12px',
          background: '#f8fafc'
        }}>
          <p style={{ fontSize: '15px', color: '#64748b', fontWeight: 500 }}>No Super Form templates match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredTemplates.map(t => (
            <div
              key={t.id}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'box-shadow 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: t.country === 'Canada' ? '#c2410c' : '#1d4ed8',
                    background: t.country === 'Canada' ? '#ffedd5' : '#dbeafe',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Globe size={11} /> {t.country}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{t.form_code || 'CODE-PENDING'}</span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '4px 0 8px 0' }}>{t.name}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, margin: '0 0 12px 0', minHeight: '36px' }}>{t.description || 'No description provided.'}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    Type: {t.service_type || 'Accounting firm'}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    background: (() => {
                      if (t.service_line === 'Direct tax') return '#dcfce7';
                      if (t.service_line === 'Indirect tax') return '#fef9c3';
                      if (t.service_line === 'Payroll') return '#e0f2fe';
                      return '#f3e8ff';
                    })(),
                    color: (() => {
                      if (t.service_line === 'Direct tax') return '#15803d';
                      if (t.service_line === 'Indirect tax') return '#a16207';
                      if (t.service_line === 'Payroll') return '#0369a1';
                      return '#6b21a8';
                    })(),
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {t.service_line}
                  </span>
                </div>
              </div>

              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <ShieldCheck size={12} /> Software Engineer Designed
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => handlePreviewClick(t.id)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Eye size={14} /> Preview
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            width: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>Register New Super Form</h2>
            
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Form Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. T1 Personal Income Tax Return"
                  value={newForm.name}
                  onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Form Code</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. CAN-T1-INTAKE"
                    value={newForm.form_code}
                    onChange={e => setNewForm({ ...newForm, form_code: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Country</label>
                  <select
                    value={newForm.country}
                    onChange={e => setNewForm({ ...newForm, country: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: 'white' }}
                  >
                    <option value="Canada">Canada</option>
                    <option value="USA">USA</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Service Line</label>
                  <select
                    value={newForm.service_type}
                    onChange={e => {
                      const val = e.target.value;
                      setNewForm(prev => ({
                        ...prev,
                        service_type: val,
                        // Set sub service line default if not accounting
                        service_line: val === 'Accounting firm' ? 'Direct tax' : 'General'
                      }));
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: 'white' }}
                  >
                    <option value="Accounting firm">Accounting firm</option>
                    <option value="Investment firm">Investment firm</option>
                    <option value="ISO">ISO</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Sub-Service Line</label>
                  <select
                    value={newForm.service_line}
                    disabled={newForm.service_type !== 'Accounting firm'}
                    onChange={e => setNewForm({ ...newForm, service_line: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: newForm.service_type === 'Accounting firm' ? 'white' : '#f1f5f9'
                    }}
                  >
                    {newForm.service_type === 'Accounting firm' ? (
                      <>
                        <option value="Direct tax">Direct tax</option>
                        <option value="Indirect tax">Indirect tax</option>
                        <option value="Payroll">Payroll</option>
                        <option value="Annual Return">Annual Return</option>
                      </>
                    ) : (
                      <option value="General">Not Applicable (General)</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Description</label>
                <textarea
                  placeholder="Provide a description of the form's logic and capabilities..."
                  value={newForm.description}
                  onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Info size={16} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '11px', color: '#0369a1', lineHeight: 1.4 }}>
                  This form is registered as a Super Form template. Standard users cannot modify its inputs or structural boxes unless custom settings are enabled.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: 'transparent', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Register Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {previewLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #4f46e5', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontWeight: 600, color: '#475569', fontSize: '14px' }}>Loading form preview details...</p>
        </div>
      )}

      {/* Preview Wizard Modal */}
      {previewTemplate && (() => {
        const { form, sections, questions } = previewTemplate;
        const visibleSections = (() => {
          const triageSec = sections.find((s: any) => s.title.toLowerCase().includes('triage') || s.title.toLowerCase().includes('how was your year'));
          if (!triageSec) return sections;

          const branchingRules: Record<string, string[]> = {
            'worked for': ['t4 employment', 'tips & other employment'],
            'employment insurance': ['t4e employment insurance'],
            'workers\' compensation': ['t5007'],
            'received cpp': ['cpp, qpp'],
            'old age security': ['cpp, qpp'],
            'pension or annuity': ['t4a pension', 'pension splitting'],
            'rrsp or rrif income': ['rrsp/rrif income'],
            'social assistance': ['t5007'],
            'earned interest': ['t5 investment'],
            'received dividends': ['t5 investment'],
            'trust income': ['t3 trust'],
            'partnership income': ['t5013 partnership'],
            'sold stocks': ['t5008', 'capital gains'],
            'cryptocurrency': ['cryptocurrency'],
            'foreign investments': ['foreign income'],
            'foreign property': ['foreign property'],
            'rental property': ['rental income'],
            'sold real estate': ['property disposition', 'capital gains'],
            'principal residence': ['property disposition'],
            'self-employment': ['self-employment'],
            'sole proprietorship': ['self-employment'],
            'professional income': ['self-employment'],
            'farming income': ['self-employment'],
            'fishing income': ['self-employment'],
            'platform': ['self-employment'],
            'attended college': ['tuition & education'],
            'student-loan': ['student-loan interest'],
            'scholarship': ['other income'],
            'tuition': ['tuition & education'],
            'child-care': ['child-care expenses'],
            'support': ['support payments'],
            'adopted': ['adoption'],
            'disability': ['disability tax credit'],
            'qualifying home': ['home buyers\' amount', 'home accessibility'],
            'home-accessibility': ['home accessibility'],
            'moved for work': ['moving expenses'],
            'contributed to an rrsp': ['rrsp deduction'],
            'home buyers\' plan': ['home buyers\' plan'],
            'lifelong learning': ['lifelong learning plan'],
            'fhsa': ['first home savings'],
            'charitable donations': ['charitable donations'],
            'medical expenses': ['medical expenses'],
            'union or professional dues': ['union and professional dues'],
            'investment-management': ['carrying charges'],
            'political contributions': ['political contributions'],
            'employment expenses': ['employment expense eligibility', 'work-from-home', 'other t777'],
            'worked from home': ['work-from-home'],
          };

          const triageQuestions = questions.filter((q: any) => q.section_id === triageSec.id);
          const activeKeys = new Set<string>();

          triageQuestions.forEach((q: any) => {
            if (!!previewResponses[q.id]) {
              Object.entries(branchingRules).forEach(([key, secNames]) => {
                if (q.question_text.toLowerCase().includes(key)) {
                  (secNames as string[]).forEach(sn => activeKeys.add(sn));
                }
              });
            }
          });

          return sections.filter((s: any) => {
            if (s.sort_order <= triageSec.sort_order) return true;
            const lowerTitle = s.title.toLowerCase();
            if (lowerTitle.includes('signature') || lowerTitle.includes('review') || lowerTitle.includes('consent') || lowerTitle.includes('welcome') || lowerTitle.includes('profile') || lowerTitle.includes('dashboard') || lowerTitle.includes('completeness') || lowerTitle.includes('optimization') || lowerTitle.includes('confirmation') || lowerTitle.includes('e-filing') || lowerTitle.includes('summary') || lowerTitle.includes('checklist') || lowerTitle.includes('prior notice') || lowerTitle.includes('other income') || lowerTitle.includes('other mandatory')) return true;
            return Array.from(activeKeys).some(secName => lowerTitle.includes(secName));
          });
        })();

        const stages = [
          { name: 'Get Started', keywords: ['welcome', 'tax year', 'who is', 'spouse filing option', 'checklist', 'prior notice'] },
          { name: 'Personal Information', keywords: ['name', 'social insurance', 'date of birth', 'contact', 'address', 'resence', 'movement', 'residency', 'newcomer', 'emigrant', 'citizenship', 'elections canada', 'marital', 'spouse / common-law', 'dependant'] },
          { name: 'Tax Profile', keywords: ['how was your year', 'first-time filer', 'foreign property', 'disposition', 'mandatory questions'] },
          { name: 'Income', keywords: ['income dashboard', 't4 employment', 'tips & other', 't4e', 'cpp, qpp', 't4a pension', 'rrsp/rrif income', 'social benefits', 't5 investment', 't3 trust', 't5013 partnership', 't5008', 'capital gains', 'cryptocurrency', 'rental income', 'self-employment', 'foreign income', 'support payments received', 'other income'] },
          { name: 'RRSP and Registered Plans', keywords: ['rrsp deduction limit', 'rrsp deduction choice', 'home buyers\' plan', 'lifelong learning plan', 'first home savings'] },
          { name: 'Deductions and Credits', keywords: ['employment expense eligibility', 'work-from-home', 'other t777', 'child-care', 'moving', 'union', 'support payments paid', 'carrying charges', 'medical expenses', 'charitable donations', 'tuition & education', 'student-loan', 'disability tax credit', 'caregiver', 'home buyers\' amount', 'home accessibility', 'pension splitting'] },
          { name: 'Provincial or Territorial Questions', keywords: ['provincial interview', 'ontario', 'carbon rebate', 'quebec'] },
          { name: 'Review', keywords: ['completeness review', 'duplicate', 'saving opportunities', 'warnings', 'detailed tax summary', 'compare with previous'] },
          { name: 'Finish and File', keywords: ['filing method', 'eligibility', 'final filing', 'submission', 'disclaimer'] }
        ];

        const getSectionStageIndex = (sectionTitle: string) => {
          const title = sectionTitle.toLowerCase();
          const idx = stages.findIndex(stage => 
            stage.keywords.some(kw => title.includes(kw))
          );
          return idx >= 0 ? idx : stages.length - 1;
        };

        const currentSection = visibleSections[currentPreviewSectionIdx] || visibleSections[0];
        const currentStageIdx = currentSection ? getSectionStageIndex(currentSection.title) : 0;

        const visibleStages = stages.map((stage, idx) => {
          const stageSections = visibleSections.filter((s: any) => getSectionStageIndex(s.title) === idx);
          return {
            index: idx,
            name: stage.name,
            sections: stageSections
          };
        }).filter(stage => stage.sections.length > 0);

        const getStageStatus = (stage: any) => {
          const isCurrent = stage.sections.some((s: any) => s.id === currentSection?.id);
          const stageSectionIds = stage.sections.map((s: any) => s.id);
          const stageQs = questions.filter(q => stageSectionIds.includes(q.section_id));
          
          if (stageQs.length === 0) return 'Completed';

          const answeredQs = stageQs.filter(q => previewResponses[q.id] !== undefined && previewResponses[q.id] !== '' && previewResponses[q.id] !== false);
          const requiredQs = stageQs.filter(q => q.is_required === 1);
          const missingRequired = requiredQs.some(q => previewResponses[q.id] === undefined || previewResponses[q.id] === '' || previewResponses[q.id] === false);

          if (answeredQs.length === 0) {
            return isCurrent ? 'In Progress' : 'Not Started';
          }
          if (missingRequired) {
            return 'Needs Attention';
          }
          return 'Completed';
        };

        const sectionQuestions = questions.filter((q: any) => q.section_id === currentSection?.id);

        const progressPercent = visibleSections.length > 0 
          ? Math.round(((currentPreviewSectionIdx + 1) / visibleSections.length) * 100)
          : 0;



        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '16px', width: '100%', maxHeight: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', height: '90vh' }}>
              
              {/* Header */}
              <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#4f46e5', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>PREVIEW MODE</span>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>{form.name}</h2>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Interact with the form to test guided steps and OCR auto-fill triggers.</p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Close Preview
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '4px', background: '#e2e8f0', width: '100%' }}>
                <div style={{ height: '100%', background: '#4f46e5', width: `${progressPercent}%`, transition: 'width 0.3s ease-in-out' }} />
              </div>

              {/* Main Content Area */}
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                
                {/* Steps Sidebar */}
                <div style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', overflowY: 'auto', padding: '16px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '12px' }}>Filing Steps</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {visibleStages.map((stage: any, idx: number) => {
                      const isActive = stage.index === currentStageIdx;
                      const isPast = stage.index < currentStageIdx;
                      const currentSectionInStageIdx = stage.sections.findIndex((s: any) => s.id === currentSection?.id);
                      
                      return (
                        <div 
                          key={stage.index}
                          onClick={() => {
                            const firstSec = stage.sections[0];
                            if (firstSec) {
                              const globalIdx = visibleSections.findIndex(s => s.id === firstSec.id);
                              if (globalIdx >= 0) setCurrentPreviewSectionIdx(globalIdx);
                            }
                          }}
                          style={{
                            display: 'flex', flexDirection: 'column', gap: '2px',
                            padding: '6px 8px', borderRadius: '8px',
                            background: isActive ? '#f0fdf4' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              <div style={{
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: isPast ? '#16a34a' : isActive ? '#15803d' : '#e2e8f0',
                                color: isPast || isActive ? 'white' : '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '9px', fontWeight: 'bold', flexShrink: 0
                              }}>
                                {isPast ? <Check size={8} strokeWidth={3} /> : idx + 1}
                              </div>
                              <span style={{ 
                                fontSize: '12px', 
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#15803d' : isPast ? '#111827' : '#475569',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                              }}>
                                {stage.name}
                              </span>
                            </div>
                            {(() => {
                              const status = getStageStatus(stage);
                              const badgeColors: Record<string, { color: string, bg: string }> = {
                                'Completed': { color: '#16a34a', bg: '#f0fdf4' },
                                'Needs Attention': { color: '#dc2626', bg: '#fef2f2' },
                                'In Progress': { color: '#2563eb', bg: '#eff6ff' },
                                'Not Started': { color: '#6b7280', bg: '#f3f4f6' }
                              };
                              const c = badgeColors[status] || badgeColors['Not Started'];
                              return (
                                <span style={{ fontSize: '8px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', color: c.color, backgroundColor: c.bg, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                                  {status}
                                </span>
                              );
                            })()}
                          </div>
                          {isActive && stage.sections.length > 1 && currentSectionInStageIdx >= 0 && (
                            <div style={{ fontSize: '10px', color: '#64748b', paddingLeft: '26px', marginTop: '2px' }}>
                              Step {currentSectionInStageIdx + 1} of {stage.sections.length}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Fields Canvas */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#f8fafc' }}>
                  <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                    
                    {/* Welcome Screen OCR Upload */}
                    {currentPreviewSectionIdx === 0 && (
                      <div style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%)', border: '1px solid #b9ddff', borderRadius: '14px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(59,130,246,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '22px' }}>🚀</span>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1e3a8a' }}>AI Smart Auto-Fill & OCR</h4>
                            <p style={{ margin: 0, fontSize: '12px', color: '#1e40af' }}>Upload T4 slips, tax documents, or previous year returns. AI will auto-fill relevant fields.</p>
                          </div>
                        </div>
                        <div style={{ border: '2px dashed #93c5fd', borderRadius: '10px', padding: '14px', textAlign: 'center', background: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                          <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>📤 Click to upload tax documents (T4, T5, PDFs, prior year returns)</span>
                        </div>
                      </div>
                    )}

                    {/* Per-Section OCR Upload Widget */}
                    {currentPreviewSectionIdx > 0 && (() => {
                      const ocrSlipMap: Record<string, string> = {
                        't4 employment': 'T4 Slip', 't5 investment': 'T5 Slip', 't3 trust': 'T3 Slip',
                        't4a pension': 'T4A Slip', 't4e employment': 'T4E Slip', 't5013 partnership': 'T5013 Slip',
                        't5008': 'T5008 Statement', 'charitable donations': 'Donation Receipt',
                        'medical expenses': 'Medical Receipt', 'tuition': 'T2202 Certificate',
                        'rrsp deduction': 'RRSP Receipt', 'rental income': 'Rental Records'
                      };
                      const lower = (currentSection?.title || '').toLowerCase();
                      let slipLabel = '';
                      for (const [key, val] of Object.entries(ocrSlipMap)) { if (lower.includes(key)) { slipLabel = val; break; } }
                      if (!slipLabel) return null;
                      return (
                        <div style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #d8b4fe', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '18px' }}>📄</span>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#6b21a8' }}>Upload {slipLabel} to Auto-Fill</h4>
                          </div>
                          <div style={{ border: '2px dashed #c4b5fd', borderRadius: '8px', padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                            <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600 }}>📤 Upload {slipLabel} (PDF, PNG, JPG)</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Review All Answers Special Renderer */}
                    {currentSection?.title?.toLowerCase().includes('review all') ? (
                      <div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                          <button style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📥 Download as PDF
                          </button>
                        </div>
                        {visibleSections.filter((s: any) => s.title !== currentSection?.title && s.title !== 'Disclaimer & Submission').map((sec: any) => {
                          const secQs = questions.filter((q: any) => q.section_id === sec.id);
                          const answeredQs = secQs.filter((q: any) => previewResponses[q.id] !== undefined && previewResponses[q.id] !== '' && previewResponses[q.id] !== false);
                          return (
                            <div key={sec.id} style={{ marginBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: answeredQs.length > 0 ? '#f0fdf4' : '#fef2f2', borderBottom: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {answeredQs.length > 0 ? <CheckCircle2 size={13} style={{ color: '#16a34a' }} /> : <AlertCircle size={13} style={{ color: '#dc2626' }} />}
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{sec.title}</span>
                                  <span style={{ fontSize: '10px', color: '#6b7280' }}>({answeredQs.length}/{secQs.length})</span>
                                  <span style={{ fontSize: '11px', color: '#dc2626', marginLeft: '8px' }}>
                                    {answeredQs.length < secQs.filter((q: any) => q.is_required === 1).length && '⚠️ Missing Required'}
                                  </span>
                                </div>
                                <button onClick={() => { const idx = visibleSections.findIndex((s: any) => s.id === sec.id); if (idx >= 0) setCurrentPreviewSectionIdx(idx); }} style={{ fontSize: '10px', fontWeight: 600, color: '#4f46e5', background: 'white', border: '1px solid #c7d2fe', padding: '3px 8px', borderRadius: '5px', cursor: 'pointer' }}>✏️ Edit</button>
                              </div>
                              {answeredQs.length > 0 && (
                                <div style={{ padding: '6px 14px' }}>
                                  {answeredQs.slice(0, 5).map((q: any) => (
                                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #f9fafb', fontSize: '11px' }}>
                                      <span style={{ color: '#6b7280' }}>{q.question_text}</span>
                                      <span style={{ fontWeight: 600, color: '#111827' }}>{previewResponses[q.id] === true ? '✓' : String(previewResponses[q.id]).substring(0, 30)}</span>
                                    </div>
                                  ))}
                                  {answeredQs.length > 5 && <p style={{ fontSize: '10px', color: '#6b7280', margin: '4px 0 0' }}>...and {answeredQs.length - 5} more</p>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div style={{ marginTop: '16px', padding: '14px', border: '1px solid #fbbf24', borderRadius: '10px', background: '#fffbeb' }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 700, color: '#92400e' }}>⚠️ Disclaimer</h4>
                          <p style={{ margin: 0, fontSize: '11px', color: '#92400e', lineHeight: 1.4 }}>This tax return has been prepared based solely on the information provided. Taxccount does not guarantee accuracy of tax calculations or CRA acceptance.</p>
                        </div>
                      </div>
                    ) : (
                    <>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {currentSection?.title}
                      {currentSection?.description && (
                        <span 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            width: '16px', 
                            height: '16px', 
                            borderRadius: '50%', 
                            background: '#f1f5f9', 
                            border: '1px solid #cbd5e1',
                            color: '#475569', 
                            fontSize: '10px', 
                            fontWeight: 'bold', 
                            cursor: 'help',
                            flexShrink: 0
                          }} 
                          title={currentSection.description}
                        >
                          ?
                        </span>
                      )}
                    </h3>
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {sectionQuestions.map((q: any) => {
                        const val = previewResponses[q.id] || '';
                        const isCheckbox = q.question_type === 'checkbox';
                        const isWide = !isCheckbox && (q.question_type === 'radio' || q.question_type === 'long_text' || q.question_type === 'file' || (q.question_text && q.question_text.length > 80));
                        const explanation = getQuestionExplanation(q.question_text, q.help_text, q.description);
                        
                        return (
                          <div key={q.id} style={{ gridColumn: isWide ? '1 / -1' : 'auto', display: 'flex', flexDirection: 'column', gap: '3px', justifyContent: 'center' }}>
                            {isCheckbox ? (
                              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#334155', margin: 0, padding: '4px 0' }}>
                                <input
                                  type="checkbox"
                                  checked={!!val}
                                  onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.checked })}
                                  style={{ accentColor: '#4f46e5', width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }}
                                />
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', lineHeight: 1.3 }}>
                                  {q.question_text}
                                  {q.is_required === 1 && <span style={{ color: '#ef4444' }}>*</span>}
                                  <span 
                                    style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      width: '14px', 
                                      height: '14px', 
                                      borderRadius: '50%', 
                                      background: '#f1f5f9', 
                                      border: '1px solid #cbd5e1',
                                      color: '#475569', 
                                      fontSize: '9px', 
                                      fontWeight: 'bold', 
                                      cursor: 'help',
                                      flexShrink: 0
                                    }} 
                                    title={explanation}
                                  >
                                    ?
                                  </span>
                                </span>
                              </label>
                            ) : (
                              <>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>
                                  <span>{q.question_text}</span>
                                  {q.is_required === 1 && <span style={{ color: '#ef4444' }}>*</span>}
                                  <span 
                                    style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      width: '14px', 
                                      height: '14px', 
                                      borderRadius: '50%', 
                                      background: '#f1f5f9', 
                                      border: '1px solid #cbd5e1',
                                      color: '#475569', 
                                      fontSize: '9px', 
                                      fontWeight: 'bold', 
                                      cursor: 'help',
                                      flexShrink: 0
                                    }} 
                                    title={explanation}
                                  >
                                    ?
                                  </span>
                                </label>
                                
                                <div style={{ marginTop: '1px' }}>
                                  {q.question_type === 'date' ? (
                                    <input
                                      type="date"
                                      value={val}
                                      onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.value })}
                                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                                    />
                                  ) : q.question_type === 'long_text' ? (
                                    <textarea
                                      value={val}
                                      onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.value })}
                                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', minHeight: '52px', resize: 'vertical' }}
                                    />
                                  ) : q.question_type === 'currency' ? (
                                    <div style={{ position: 'relative' }}>
                                      <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>$</span>
                                      <input
                                        type="number"
                                        value={val}
                                        onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.value })}
                                        style={{ width: '100%', padding: '6px 8px 6px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                                      />
                                    </div>
                                  ) : q.question_type === 'select' ? (
                                    <select
                                      value={val}
                                      onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.value })}
                                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: 'white' }}
                                    >
                                      <option value="">— Select —</option>
                                      {(() => { try { const opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []); return opts.map((o: string, i: number) => <option key={i} value={o}>{o}</option>); } catch { return null; } })()}
                                    </select>
                                  ) : q.question_type === 'radio' ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                                      {(() => { try { const opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []); return opts.map((o: string, i: number) => (
                                        <label key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', color: '#334155', background: val === o ? '#eef2ff' : '#f8fafc', border: `1px solid ${val === o ? '#818cf8' : '#e2e8f0'}`, borderRadius: '6px', padding: '4px 10px' }}>
                                          <input type="radio" name={q.id} value={o} checked={val === o} onChange={() => setPreviewResponses({ ...previewResponses, [q.id]: o })} style={{ accentColor: '#4f46e5', width: '14px', height: '14px' }} />
                                          {o}
                                        </label>
                                      )); } catch { return null; } })()}
                                    </div>
                                  ) : q.question_type === 'file' ? (
                                    <div style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}>
                                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Drop files or click to browse</p>
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      placeholder={q.placeholder || ''}
                                      value={val}
                                      onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.value })}
                                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                                    />
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                      <button
                        disabled={currentPreviewSectionIdx === 0}
                        onClick={() => setCurrentPreviewSectionIdx(currentPreviewSectionIdx - 1)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'white',
                          border: '1px solid #cbd5e1',
                          color: currentPreviewSectionIdx === 0 ? '#94a3b8' : '#475569',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: currentPreviewSectionIdx === 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <ArrowLeft size={16} /> Back
                      </button>

                      {currentPreviewSectionIdx < visibleSections.length - 1 ? (
                        <button
                          onClick={() => setCurrentPreviewSectionIdx(currentPreviewSectionIdx + 1)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Next <ArrowRight size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setPreviewTemplate(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Finish Preview <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>

                  </div>
                </div>



              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
