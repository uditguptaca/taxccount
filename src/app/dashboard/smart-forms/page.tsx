'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreVertical, FileText, CheckCircle2, Archive, Globe, Tag, Settings, X, ArrowLeft, ArrowRight, Check, AlertCircle, HelpCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function SmartFormsListPage() {
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [activeMenuFormId, setActiveMenuFormId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>({ id: '', name: '', description: '', country: '', compliance_type: '', status: '' });

  // Super Admin Template Integration
  const [activeTab, setActiveTab] = useState<'active_forms' | 'super_templates'>('active_forms');
  const [superTemplates, setSuperTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [activatingTemplateId, setActivatingTemplateId] = useState<string | null>(null);
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');

  // Preview Mode State
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});
  const [currentPreviewSectionIdx, setCurrentPreviewSectionIdx] = useState(0);
  useEffect(() => {
    fetchForms();
    fetchSuperTemplates();
  }, []);

  const fetchSuperTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const res = await fetch('/api/smart-forms/templates');
      const data = await res.json();
      setSuperTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleActivateTemplate = async (templateId: string) => {
    try {
      setActivatingTemplateId(templateId);
      const res = await fetch('/api/smart-forms/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      if (res.ok) {
        await fetchForms();
        setActiveTab('active_forms');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActivatingTemplateId(null);
    }
  };

  const handlePreviewTemplate = async (id: string, isSuperTemplate: boolean) => {
    try {
      setPreviewLoading(true);
      const url = isSuperTemplate ? `/api/smart-forms/templates/${id}` : `/api/smart-forms/${id}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPreviewTemplate(data);
        setPreviewResponses({});
        setCurrentPreviewSectionIdx(0);
      } else {
        alert('Failed to load template preview details.');
      }
    } catch (e) {
      console.error('Fetch Preview Error:', e);
      alert('Failed to load preview for this form.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleEditMetadata = (form: any) => {
    setEditForm({
      id: form.id,
      name: form.name,
      description: form.description || '',
      country: form.country || 'Canada',
      compliance_type: form.compliance_type || 'Tax',
      status: form.status || 'Active'
    });
    setShowEditModal(true);
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/smart-forms/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_details', ...editForm })
      });
      if (res.ok) {
        fetchForms();
        setShowEditModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to archive/delete this smart form?')) return;
    try {
      const res = await fetch(`/api/smart-forms/${formId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchForms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/smart-forms');
      const data = await res.json();
      setForms(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const res = await fetch('/api/smart-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Smart Form', country: 'Canada', compliance_type: 'Tax' })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/dashboard/smart-forms/builder/${data.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const countries = Array.from(new Set(forms.map(f => f.country).filter(Boolean)));

  const filteredForms = forms.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    const matchesCountry = countryFilter === 'All' || f.country === countryFilter;
    const matchesCategory = (() => {
      if (categoryFilter === 'All') return true;
      const formType = (f.compliance_type || '').toLowerCase().trim();
      const formName = (f.name || '').toLowerCase();
      
      if (categoryFilter === 'Direct Tax') {
        return formType === 'direct tax' || formType === 'tax' || formName.includes('t1') || formName.includes('t2');
      }
      if (categoryFilter === 'Indirect Tax') {
        return formType === 'indirect tax' || formType === 'indirect tac' || formType === 'gst' || formType === 'hst' || formName.includes('gst') || formName.includes('hst');
      }
      if (categoryFilter === 'Payroll') {
        return formType === 'payroll' || formName.includes('payroll');
      }
      if (categoryFilter === 'Annual Return') {
        return formType === 'annual return' || formName.includes('annual return');
      }
      return false;
    })();

    return matchesSearch && matchesStatus && matchesCountry && matchesCategory;
  });

  const hasActiveFilters = countryFilter !== 'All' || categoryFilter !== 'All' || statusFilter !== 'All' || searchQuery !== '';

  const handleClearFilters = () => {
    setCountryFilter('All');
    setCategoryFilter('All');
    setStatusFilter('All');
    setSearchQuery('');
  };

  const getSelectStyle = (isActive: boolean) => ({
    minWidth: '130px',
    height: '34px',
    borderRadius: '20px',
    border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-gray-200)',
    background: isActive ? 'var(--color-primary-light)' : 'var(--color-white)',
    color: isActive ? 'var(--color-primary)' : 'var(--color-gray-700)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: isActive ? 600 : 500,
    padding: '0 12px',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
  });

  return (
    <>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>Smart Forms Portal</h1>
          <p className="text-muted text-xs" style={{ marginTop: '2px' }}>Deploy software engineer designed Super Forms or build your own custom intake forms.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link href="/dashboard/settings/smart-forms" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={14} /> Settings
          </Link>
          <button onClick={handleCreateNew} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Create Custom Form
          </button>
        </div>
      </div>

      {/* Tabs bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-gray-200)', marginBottom: '20px', gap: '24px' }}>
        <button
          onClick={() => setActiveTab('active_forms')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'active_forms' ? '2px solid var(--color-primary)' : '2px solid transparent',
            padding: '10px 4px',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'active_forms' ? 'var(--color-primary)' : 'var(--color-gray-500)',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out'
          }}
        >
          Active Forms
        </button>
        <button
          onClick={() => setActiveTab('super_templates')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'super_templates' ? '2px solid var(--color-primary)' : '2px solid transparent',
            padding: '10px 4px',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'super_templates' ? 'var(--color-primary)' : 'var(--color-gray-500)',
            cursor: 'pointer',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🍁 Super Admin Templates
        </button>
      </div>

      {activeTab === 'active_forms' ? (
        <>
          {/* Filters Bar for Active Forms */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-2)', 
            marginBottom: 'var(--space-4)', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            background: 'white',
            padding: '10px 14px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-gray-100)'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
              <input 
                type="text"
                placeholder="Search forms by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ 
                  paddingLeft: '32px', 
                  width: '100%', 
                  height: '34px', 
                  borderRadius: '20px', 
                  fontSize: '13px',
                  border: searchQuery ? '1px solid var(--color-primary)' : '1px solid var(--color-gray-200)',
                  background: searchQuery ? 'var(--color-primary-light)' : 'transparent'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <Filter size={14} className="text-muted" style={{ marginRight: '2px' }} />
              
              {/* Country Filter */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={countryFilter} 
                  onChange={(e) => setCountryFilter(e.target.value)}
                  style={getSelectStyle(countryFilter !== 'All')}
                >
                  <option value="All">All Countries</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={getSelectStyle(categoryFilter !== 'All')}
                >
                  <option value="All">All Categories</option>
                  <option value="Direct Tax">Direct Tax</option>
                  <option value="Indirect Tax">Indirect Tax</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Annual Return">Annual Return</option>
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={getSelectStyle(statusFilter !== 'All')}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button 
                  onClick={handleClearFilters}
                  className="btn btn-ghost btn-sm"
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    padding: '0 12px', 
                    height: '34px', 
                    borderRadius: '20px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    color: 'var(--color-danger)',
                    background: 'rgba(239, 68, 68, 0.08)'
                  }}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-500)' }}>Loading forms...</div>
          ) : filteredForms.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
              <div className="empty-state">
                <FileText size={40} className="text-muted" style={{ marginBottom: 'var(--space-2)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No Smart Forms found</h3>
                <p className="text-xs text-muted" style={{ marginBottom: 'var(--space-4)' }}>Try adjusting your search filters or create a new form.</p>
                <button onClick={handleCreateNew} className="btn btn-primary btn-sm">
                  Create Smart Form
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 'var(--space-4)' }}>
              {filteredForms.map(form => (
                <div 
                  key={form.id} 
                  className="card smart-form-card" 
                  style={{ 
                    position: 'relative', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid var(--color-gray-200)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    className="card-body" 
                    style={{ 
                      padding: 'var(--space-4)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: 'var(--radius-md)', 
                            background: 'var(--color-primary-light)', 
                            color: 'var(--color-primary)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <FileText size={16} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-900)', margin: 0, lineHeight: 1.2 }}>{form.name}</h3>
                              {form.parent_template_id && (
                                <span style={{ fontSize: '9px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                  Super Form
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Globe size={10} /> {form.country || 'Global'}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Tag size={10} /> {form.compliance_type || 'General'}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '2px', height: '24px', width: '24px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setActiveMenuFormId(activeMenuFormId === form.id ? null : form.id);
                            }}
                          >
                            <MoreVertical size={14} className="text-muted" />
                          </button>
                          
                          {activeMenuFormId === form.id && (
                            <>
                              <div 
                                style={{ position: 'fixed', inset: 0, zIndex: 998, cursor: 'default' }} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setActiveMenuFormId(null);
                                }}
                              />
                              <div style={{
                                position: 'absolute', right: 0, top: '28px',
                                background: 'white', border: '1px solid var(--color-gray-200)',
                                borderRadius: '8px', boxShadow: 'var(--shadow-lg)',
                                zIndex: 999, width: '150px', padding: '4px 0',
                                display: 'flex', flexDirection: 'column'
                              }}>
                                <Link href={`/dashboard/smart-forms/builder/${form.id}`} style={{
                                  padding: '8px 12px', fontSize: '13px', color: 'var(--color-gray-700)',
                                  textDecoration: 'none', textAlign: 'left', display: 'block'
                                }}>
                                  {form.parent_template_id ? 'View Form Layout' : 'Open Builder'}
                                </Link>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setActiveMenuFormId(null);
                                    handleEditMetadata(form);
                                  }}
                                  style={{
                                    padding: '8px 12px', fontSize: '13px', color: 'var(--color-gray-700)',
                                    textDecoration: 'none', textAlign: 'left', display: 'block',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    width: '100%'
                                  }}
                                >
                                  Edit Details
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setActiveMenuFormId(null);
                                    handleDeleteForm(form.id);
                                  }}
                                  style={{
                                    padding: '8px 12px', fontSize: '13px', color: 'var(--color-danger)',
                                    textDecoration: 'none', textAlign: 'left', display: 'block',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    width: '100%'
                                  }}
                                >
                                  Delete Form
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-muted" style={{ 
                        height: '32px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        marginBottom: '12px',
                        lineHeight: 1.3
                      }}>
                        {form.description || 'No description provided.'}
                      </p>
                    </div>

                    <div>
                      {/* Space Efficient Metrics Row */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        fontSize: '11px', 
                        color: 'var(--color-gray-500)', 
                        borderTop: '1px solid var(--color-gray-100)', 
                        paddingTop: '10px',
                        marginBottom: '10px',
                        alignItems: 'center'
                      }}>
                        <span><strong>{form.question_count || 0}</strong> Qs</span>
                        <span style={{ color: 'var(--color-gray-300)' }}>|</span>
                        <span><strong>{form.doc_count || 0}</strong> Docs</span>
                        <span style={{ color: 'var(--color-gray-300)' }}>|</span>
                        <span><strong>{form.usage_count || 0}</strong> Uses</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className={`badge ${
                          form.status === 'Active' ? 'badge-green' :
                          form.status === 'Draft' ? 'badge-yellow' :
                          'badge-gray'
                        }`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '2px 8px', borderRadius: '12px' }}>
                          {form.status === 'Active' && <CheckCircle2 size={10} />}
                          {form.status === 'Draft' && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />}
                          {form.status === 'Archived' && <Archive size={10} />}
                          {form.status}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handlePreviewTemplate(form.id, false)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                          >
                            👁️ Preview
                          </button>
                          <span style={{ color: '#cbd5e1', fontSize: '12px' }}>|</span>
                          <Link 
                            href={`/dashboard/smart-forms/builder/${form.id}`} 
                            style={{ 
                              fontSize: '12px', 
                              fontWeight: 600, 
                              color: 'var(--color-primary)', 
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            {form.parent_template_id ? 'Layout →' : 'Builder →'}
                          </Link>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Filters Bar for Super Admin Templates */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-2)', 
            marginBottom: 'var(--space-4)', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            background: 'white',
            padding: '10px 14px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-gray-100)'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
              <input 
                type="text"
                placeholder="Search templates by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ 
                  paddingLeft: '32px', 
                  width: '100%', 
                  height: '34px', 
                  borderRadius: '20px', 
                  fontSize: '13px',
                  border: searchQuery ? '1px solid var(--color-primary)' : '1px solid var(--color-gray-200)',
                  background: searchQuery ? 'var(--color-primary-light)' : 'transparent'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <Filter size={14} className="text-muted" style={{ marginRight: '2px' }} />
              
              {/* Country Filter */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={countryFilter} 
                  onChange={(e) => setCountryFilter(e.target.value)}
                  style={getSelectStyle(countryFilter !== 'All')}
                >
                  <option value="All">All Countries</option>
                  <option value="USA">USA 🇺🇸</option>
                  <option value="Canada">Canada 🍁</option>
                  <option value="India">India 🇮🇳</option>
                </select>
              </div>

              {/* Service Line Filter (Type) */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={serviceTypeFilter} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setServiceTypeFilter(val);
                    if (val !== 'All' && val !== 'Accounting firm') {
                      setCategoryFilter('All');
                    }
                  }}
                  style={getSelectStyle(serviceTypeFilter !== 'All')}
                >
                  <option value="All">All Service Lines</option>
                  <option value="Accounting firm">Accounting firm</option>
                  <option value="Investment firm">Investment firm</option>
                  <option value="ISO">ISO</option>
                </select>
              </div>

              {/* Sub-Service Line Filter (Line) */}
              <div style={{ position: 'relative' }}>
                <select 
                  value={categoryFilter} 
                  disabled={serviceTypeFilter !== 'All' && serviceTypeFilter !== 'Accounting firm'}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    ...getSelectStyle(categoryFilter !== 'All'),
                    background: (serviceTypeFilter !== 'All' && serviceTypeFilter !== 'Accounting firm') ? '#f1f5f9' : 'white',
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
            </div>
          </div>

          {loadingTemplates ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-500)' }}>Loading templates...</div>
          ) : superTemplates.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
              <div className="empty-state">
                <FileText size={40} className="text-muted" style={{ marginBottom: 'var(--space-2)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No templates registered</h3>
                <p className="text-xs text-muted">Super Admin has not added any templates yet.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {superTemplates
                .filter(t => {
                  const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
                  const matchCountry = countryFilter === 'All' || t.country === countryFilter;
                  const matchType = serviceTypeFilter === 'All' || t.service_type === serviceTypeFilter;
                  const matchLine = categoryFilter === 'All' || t.service_line === categoryFilter;
                  return matchSearch && matchCountry && matchType && matchLine;
                })
                .map(template => {
                  const activeForm = forms.find(f => f.parent_template_id === template.id && f.status !== 'Archived');
                  const isActivated = !!activeForm;
                  return (
                    <div 
                      key={template.id} 
                      className="card smart-form-card" 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        border: '1px solid var(--color-gray-200)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: template.country === 'Canada' ? '#c2410c' : '#1d4ed8',
                            background: template.country === 'Canada' ? '#ffedd5' : '#dbeafe',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {template.country}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{template.form_code}</span>
                        </div>

                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-gray-900)', margin: '0 0 6px 0' }}>{template.name}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--color-gray-500)', lineHeight: 1.4, margin: '0 0 12px 0', minHeight: '34px' }}>
                          {template.description || 'No description provided.'}
                        </p>

                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                          <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {template.service_type || 'Accounting firm'}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            background: (() => {
                              if (template.service_line === 'Direct tax') return '#dcfce7';
                              if (template.service_line === 'Indirect tax') return '#fef9c3';
                              if (template.service_line === 'Payroll') return '#e0f2fe';
                              return '#f3e8ff';
                            })(),
                            color: (() => {
                              if (template.service_line === 'Direct tax') return '#15803d';
                              if (template.service_line === 'Indirect tax') return '#a16207';
                              if (template.service_line === 'Payroll') return '#0369a1';
                              return '#6b21a8';
                            })(),
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}>
                            {template.service_line}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> System Locked
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handlePreviewTemplate(template.id, true)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                          >
                            👁️ Preview
                          </button>

                          {isActivated ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ color: '#cbd5e1', fontSize: '12px' }}>|</span>
                              <Link
                                href={`/portal/smart-forms/fill/${activeForm.id}`}
                                target="_blank"
                                style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}
                              >
                                Client Portal →
                              </Link>
                              <span style={{ color: '#cbd5e1', fontSize: '12px' }}>|</span>
                              <Link
                                href={`/dashboard/smart-forms/builder/${activeForm.id}`}
                                style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}
                              >
                                Admin Preview →
                              </Link>
                            </div>
                          ) : (
                            <>
                              <span style={{ color: '#cbd5e1', fontSize: '12px' }}>|</span>
                              <button
                                onClick={() => handleActivateTemplate(template.id)}
                                disabled={activatingTemplateId === template.id}
                                className="btn btn-primary btn-xs"
                                style={{ padding: '4px 10px', height: 'auto', fontWeight: 600, fontSize: '11px', borderRadius: '6px' }}
                              >
                                {activatingTemplateId === template.id ? 'Deploying...' : 'Activate'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {/* Loading Overlay */}
      {previewLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
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
          const stageQs = questions.filter((q: any) => stageSectionIds.includes(q.section_id));
          
          if (stageQs.length === 0) return 'Completed';

          const answeredQs = stageQs.filter((q: any) => previewResponses[q.id] !== undefined && previewResponses[q.id] !== '' && previewResponses[q.id] !== false);
          const requiredQs = stageQs.filter((q: any) => q.is_required);
          const missingRequired = requiredQs.some((q: any) => previewResponses[q.id] === undefined || previewResponses[q.id] === '' || previewResponses[q.id] === false);

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
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '16px', width: '100%', maxHeight: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', height: '90vh' }}>
              
              {/* Header */}
              <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#4f46e5', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>PREVIEW MODE</span>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>{form.name}</h2>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Consultant Preview: Click through and answer questions to test the guided stepper path.</p>
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
                              const globalIdx = visibleSections.findIndex((s: any) => s.id === firstSec.id);
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
                    
                    {/* Welcome Screen Info */}
                    {currentPreviewSectionIdx === 0 && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', margin: 0 }}>Manual Entry Tax Return</h4>
                        </div>
                        <p style={{ fontSize: '12px', color: '#166534', margin: 0, lineHeight: 1.4 }}>
                          This guided interview will walk you through every section of your Canadian T1 return. Answer the questions based on your tax slips and receipts. The form dynamically shows only the sections that apply to you.
                        </p>
                      </div>
                    )}

                    {/* Review All Answers Special Renderer */}
                    {currentSection?.title?.toLowerCase().includes('review all') ? (
                      <div>
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
                      </div>
                    ) : (
                      /* Section Body and Inputs */
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{currentSection?.title}</h3>
                        {currentSection?.description && <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>{currentSection.description}</p>}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                          {sectionQuestions.map((q: any) => {
                            const val = previewResponses[q.id] || '';
                            const showHelpTooltip = !!q.help_text || !!q.description;
                            
                            return (
                              <div key={q.id} style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '6px',
                                gridColumn: q.question_type === 'long_text' ? 'span 2' : 'span 1',
                                background: 'white',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                              }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                  {q.question_text}
                                  {q.is_required === 1 && <span style={{ color: '#ef4444' }}>*</span>}
                                  
                                  {/* Tooltip implementation */}
                                  <div className="tooltip-container" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <HelpCircle size={14} style={{ color: '#94a3b8' }} />
                                    <span className="tooltip-text" style={{
                                      visibility: 'hidden',
                                      width: '240px',
                                      backgroundColor: '#1e293b',
                                      color: '#fff',
                                      textAlign: 'left',
                                      borderRadius: '8px',
                                      padding: '8px 12px',
                                      position: 'absolute',
                                      zIndex: 1,
                                      bottom: '125%',
                                      left: '50%',
                                      marginLeft: '-120px',
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      fontSize: '11px',
                                      fontWeight: 500,
                                      lineHeight: 1.4,
                                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                    }}>
                                      {getQuestionExplanation(q.question_text, q.help_text, q.description)}
                                    </span>
                                  </div>
                                </label>

                                {q.question_type === 'checkbox' ? (
                                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                                      <input 
                                        type="checkbox" 
                                        checked={!!val} 
                                        onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.checked })}
                                        style={{ accentColor: '#4f46e5', width: '16px', height: '16px' }}
                                      />
                                      Yes
                                    </label>
                                  </div>
                                ) : q.question_type === 'select' ? (
                                  <select
                                    value={val}
                                    onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: 'white' }}
                                  >
                                    <option value="">— Select —</option>
                                    {(() => { try { const opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []); return opts.map((o: string, i: number) => <option key={i} value={o}>{o}</option>); } catch { return null; } })()}
                                  </select>
                                ) : q.question_type === 'radio' ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                                    {(() => { try { const opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []); return opts.map((o: string, i: number) => (
                                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}>
                                        <input type="radio" name={q.id} value={o} checked={val === o} onChange={() => setPreviewResponses({ ...previewResponses, [q.id]: o })} style={{ accentColor: '#4f46e5' }} />
                                        {o}
                                      </label>
                                    )); } catch { return null; } })()}
                                  </div>
                                ) : q.question_type === 'long_text' ? (
                                  <textarea
                                    value={val}
                                    onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.value })}
                                    rows={3}
                                    placeholder={q.placeholder || 'Enter explanation...'}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                                  />
                                ) : q.question_type === 'currency' ? (
                                  <div style={{ position: 'relative', width: '100%' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>$</span>
                                    <input
                                      type="number"
                                      value={val}
                                      onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.value })}
                                      placeholder="0.00"
                                      style={{ width: '100%', padding: '10px 10px 10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                                    />
                                  </div>
                                ) : q.question_type === 'file' ? (
                                  <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '14px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>📤 Click to simulate file upload</span>
                                  </div>
                                ) : q.question_type === 'date' ? (
                                  <input
                                    type="date"
                                    value={val}
                                    onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={val}
                                    placeholder={q.placeholder || 'Enter response...'}
                                    onChange={e => setPreviewResponses({ ...previewResponses, [q.id]: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                      <button
                        disabled={currentPreviewSectionIdx === 0}
                        onClick={() => setCurrentPreviewSectionIdx(currentPreviewSectionIdx - 1)}
                        style={{
                          background: currentPreviewSectionIdx === 0 ? '#f1f5f9' : 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: currentPreviewSectionIdx === 0 ? '#94a3b8' : '#334155',
                          cursor: currentPreviewSectionIdx === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <ArrowLeft size={16} /> Back
                      </button>

                      <button
                        onClick={() => {
                          if (currentPreviewSectionIdx < visibleSections.length - 1) {
                            setCurrentPreviewSectionIdx(currentPreviewSectionIdx + 1);
                          } else {
                            alert('This is a preview. Form submission is complete!');
                            setPreviewTemplate(null);
                          }
                        }}
                        style={{
                          background: '#4f46e5',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {currentPreviewSectionIdx === visibleSections.length - 1 ? 'Finish Preview' : 'Next'} <ArrowRight size={16} />
                      </button>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      <style dangerouslySetInnerHTML={{ __html: `
        .smart-form-card {
          border: 1px solid var(--color-gray-200) !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02) !important;
        }
        .smart-form-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
        }
        .tooltip-container:hover .tooltip-text {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}} />
    </>
  );
}
