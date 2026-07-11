'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Settings, FileText, CheckSquare, Type, Calendar, Hash, Paperclip, ShieldAlert, Cpu, Eye, Trash2, GripVertical, FileImage, ChevronDown, ChevronRight, Layers, PlusCircle, Check, Sparkles, MessageSquare, Bot, Send, Info, CheckCircle2, AlertCircle } from 'lucide-react';

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

export default function SmartFormBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [form, setForm] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSectionIdx, setPreviewSectionIdx] = useState(0);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});

  const [ocrFilesPreview, setOcrFilesPreview] = useState<any[]>([]);
  const [ocrUploadingPreview, setOcrUploadingPreview] = useState(false);
  const [ocrProgressStepPreview, setOcrProgressStepPreview] = useState(0);
  const [ocrSuccessPreview, setOcrSuccessPreview] = useState(false);

  const [importingPriorYearPreview, setImportingPriorYearPreview] = useState(false);
  const [connectedToCraPreview, setConnectedToCraPreview] = useState(false);
  const [showCraAuthModalPreview, setShowCraAuthModalPreview] = useState(false);
  const [craLoadingPreview, setCraLoadingPreview] = useState(false);

  const populatePriorYearDataPreview = () => {
    const updatedResponses = { ...previewResponses };
    const setAnswer = (questionTextSearch: string, value: any) => {
      const q = questions.find(q => q.question_text.toLowerCase().includes(questionTextSearch.toLowerCase()));
      if (q) updatedResponses[q.id] = value;
    };

    // Ensure the year we are filing remains 2024 (the current tax year)
    setAnswer('tax year being filed', '2024');
    setAnswer('are you importing data from a prior-year', true);
    setAnswer('is this your first time filing', false);

    // Pre-fill Personal Identification
    setAnswer('first name', 'James');
    setAnswer('last name', 'Carter');
    setAnswer('social insurance number', '555-123-456');
    setAnswer('date of birth', '1988-06-15');
    setAnswer('marital status', 'Married');

    // Carry forward triage categories
    setAnswer('earn employment income', true);
    setAnswer('pension, retirement', false);
    setAnswer('employment expenses', false);
    setAnswer('investment income', true);
    setAnswer('sell stocks', true);
    setAnswer('principal residence', false);
    setAnswer('self-employment', false);
    setAnswer('rental income', false);
    setAnswer('foreign income', false);
    setAnswer('rrsp contributions', true);
    setAnswer('fhsa', false);
    setAnswer('tuition', true);
    setAnswer('child care', false);
    setAnswer('medical expenses', true);
    setAnswer('charitable donations', true);

    // Carry forward historical balances & default slip setups
    setAnswer('employment income (box 14)', '84500.00');
    setAnswer('income tax deducted (box 22)', '18200.00');
    setAnswer('cpp contributions (box 16)', '3754.45');
    setAnswer('ei premiums (box 18)', '1002.45');
    setAnswer('actual amount of eligible dividends', '1250.00');
    setAnswer('interest from canadian sources', '345.00');
    setAnswer('total rrsp contributions made', '5000.00');

    setPreviewResponses(updatedResponses);
  };

  const populateOcrDataPreview = () => {
    const updatedResponses = { ...previewResponses };

    const setAnswer = (questionTextSearch: string, value: any) => {
      const q = questions.find(q => q.question_text.toLowerCase().includes(questionTextSearch.toLowerCase()));
      if (q) {
        updatedResponses[q.id] = value;
      }
    };

    // Pre-fill Welcome Triage & Setup
    setAnswer('tax year being filed', '2024');
    setAnswer('are you importing data from a prior-year', true);
    setAnswer('would you like to connect to cra auto-fill', true);
    setAnswer('is this your first time filing', false);
    setAnswer('preferred language', 'English');

    // Pre-fill Personal Info
    setAnswer('first name', 'James');
    setAnswer('last name', 'Carter');
    setAnswer('social insurance number', '555-123-456');
    setAnswer('date of birth', '1988-06-15');
    setAnswer('marital status', 'Married');

    // Triage checklist responses
    setAnswer('earn employment income', true);
    setAnswer('pension, retirement', false);
    setAnswer('employment expenses', false);
    setAnswer('investment income', true);
    setAnswer('sell stocks', true);
    setAnswer('principal residence', false);
    setAnswer('self-employment', false);
    setAnswer('rental income', false);
    setAnswer('foreign income', false);
    setAnswer('rrsp contributions', true);
    setAnswer('fhsa', false);
    setAnswer('tuition', true);
    setAnswer('child care', false);
    setAnswer('medical expenses', true);
    setAnswer('charitable donations', true);

    // Section 8 T4 fields
    setAnswer('employment income (box 14)', '84500.00');
    setAnswer('income tax deducted (box 22)', '18200.00');
    setAnswer('cpp contributions (box 16)', '3754.45');
    setAnswer('ei premiums (box 18)', '1002.45');

    // Section 12 Investment (T5) fields
    setAnswer('actual amount of eligible dividends', '1250.00');
    setAnswer('interest from canadian sources', '345.00');

    // Section 18 RRSP fields
    setAnswer('total rrsp contributions made', '5000.00');

    setPreviewResponses(updatedResponses);
  };

  const populateCraDataPreview = () => {
    const updatedResponses = { ...previewResponses };
    const setAnswer = (questionTextSearch: string, value: any) => {
      const q = questions.find(q => q.question_text.toLowerCase().includes(questionTextSearch.toLowerCase()));
      if (q) updatedResponses[q.id] = value;
    };

    // Triage checklist responses
    setAnswer('earn employment income', true);
    setAnswer('pension, retirement', false);
    setAnswer('employment expenses', false);
    setAnswer('investment income', true);
    setAnswer('sell stocks', true);
    setAnswer('principal residence', false);
    setAnswer('self-employment', false);
    setAnswer('rental income', false);
    setAnswer('foreign income', false);
    setAnswer('rrsp contributions', true);
    setAnswer('fhsa', false);
    setAnswer('tuition', true);
    setAnswer('child care', false);
    setAnswer('medical expenses', true);
    setAnswer('charitable donations', true);

    // Section 8 T4 fields
    setAnswer('employment income (box 14)', '84500.00');
    setAnswer('income tax deducted (box 22)', '18200.00');
    setAnswer('cpp contributions (box 16)', '3754.45');
    setAnswer('ei premiums (box 18)', '1002.45');

    // Section 12 Investment (T5) fields
    setAnswer('actual amount of eligible dividends', '1250.00');
    setAnswer('interest from canadian sources', '345.00');

    // Section 18 RRSP fields
    setAnswer('total rrsp contributions made', '5000.00');

    setPreviewResponses(updatedResponses);
  };

  const runOcrProcessPreview = () => {
    setOcrUploadingPreview(true);
    setOcrProgressStepPreview(1);

    setTimeout(() => {
      setOcrProgressStepPreview(2);
      setTimeout(() => {
        setOcrProgressStepPreview(3);
        setTimeout(() => {
          populateOcrDataPreview();
          setOcrUploadingPreview(false);
          setOcrSuccessPreview(true);
        }, 1200);
      }, 1200);
    }, 1200);
  };



  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      const res = await fetch(`/api/smart-forms/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setForm(data.form);
      setSections(data.sections || []);
      setQuestions(data.questions || []);
      setDocuments(data.documents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showSave = (msg: string) => { setSaveSuccess(msg); setTimeout(() => setSaveSuccess(''), 3000); };

  const updateFormDetail = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/smart-forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_builder',
          versionId: form.current_version,
          sections,
          questions,
          documents,
          conditions: [],
          ocrMaps: [],
          aiRules: []
        })
      });

      await fetch(`/api/smart-forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_details',
          name: form.name,
          description: form.description,
          country: form.country,
          compliance_type: form.compliance_type,
          status: form.status
        })
      });

      showSave('Draft saved successfully');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (type: string, sectionId?: string) => {
    const newQ = {
      id: crypto.randomUUID(),
      question_text: 'New Question',
      question_type: type,
      section_id: sectionId || sections[0]?.id || null,
      is_required: false,
      is_ai_assisted: false,
    };
    setQuestions([...questions, newQ]);
    setSelectedQuestion(newQ);
  };

  const addSection = () => {
    const newSection = {
      id: crypto.randomUUID(),
      title: 'New Section',
      description: '',
      sort_order: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const updateSelectedQuestion = (field: string, value: any) => {
    if (!selectedQuestion) return;
    const updated = { ...selectedQuestion, [field]: value };
    setSelectedQuestion(updated);
    setQuestions(questions.map(q => q.id === selectedQuestion.id ? updated : q));
  };

  const deleteQuestion = (qId: string) => {
    setQuestions(questions.filter(q => q.id !== qId));
    if (selectedQuestion?.id === qId) setSelectedQuestion(null);
  };

  if (loading) return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-gray-500)' }}>Loading builder...</div>;
  if (!form) return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-danger)' }}>Form not found</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--color-gray-50)', margin: 'calc(-1 * var(--space-6))' }}>
      
      {/* Topbar */}
      <div style={{ 
        height: '64px', background: 'white', borderBottom: '1px solid var(--color-gray-200)', 
        padding: '0 var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button onClick={() => router.push('/dashboard/smart-forms')} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-gray-500)' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>{form.name}</h1>
            <span className="badge badge-gray">v1.0 (Draft)</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {saveSuccess && <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', fontWeight: 500, alignSelf: 'center' }}>✓ {saveSuccess}</span>}
          <button className="btn btn-secondary" onClick={() => setShowPreviewModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Eye size={16} /> Preview
          </button>
          {!form.parent_template_id && (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar - Blocks */}
        <div style={{ width: '280px', background: 'white', borderRight: '1px solid var(--color-gray-200)', padding: 'var(--space-4)', overflowY: 'auto', flexShrink: 0 }}>
          {form.parent_template_id ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🍁 Engine-Locked Template
              </span>
              <p style={{ margin: 0, fontSize: '11px', color: '#14532d', lineHeight: 1.4 }}>
                This is a professional Super Form pre-configured with OCR extraction, CRA My Account feeds, and complex tax validation code. Layout changes are locked.
              </p>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-500)', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>Form Blocks</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('text')}>
                  <Type size={16} style={{ color: 'var(--color-gray-400)' }} /> Short Text
                </button>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('long_text')}>
                  <FileText size={16} style={{ color: 'var(--color-gray-400)' }} /> Long Text
                </button>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('number')}>
                  <Hash size={16} style={{ color: 'var(--color-gray-400)' }} /> Number
                </button>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('date')}>
                  <Calendar size={16} style={{ color: 'var(--color-gray-400)' }} /> Date
                </button>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('checkbox')}>
                  <CheckSquare size={16} style={{ color: 'var(--color-gray-400)' }} /> Checkbox
                </button>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'white', width: '100%' }} onClick={() => addQuestion('file')}>
                  <Paperclip size={16} style={{ color: 'var(--color-gray-400)' }} /> File Upload
                </button>
              </div>

              <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>AI Features</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)', width: '100%' }}>
                  <Cpu size={16} /> OCR Mapping
                </button>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'flex-start', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)', width: '100%' }}>
                  <ShieldAlert size={16} /> Auto Anomaly Check
                </button>
              </div>
            </>
          )}

          <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-500)', letterSpacing: '0.05em', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Layers size={14} /> Sections
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {sections.map((s, i) => {
              const sectionQuestionCount = questions.filter(q => q.section_id === s.id).length;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="btn btn-ghost"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', textAlign: 'left', padding: '8px 10px',
                    borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-gray-700)', fontWeight: 500,
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i + 1}. {s.title}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-gray-400)', flexShrink: 0, marginLeft: '8px' }}>
                    {sectionQuestionCount}
                  </span>
                </button>
              );
            })}
            <button
              onClick={addSection}
              className="btn btn-ghost"
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                width: '100%', textAlign: 'left', padding: '8px 10px',
                borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)',
                color: 'var(--color-primary)', fontWeight: 500, marginTop: 'var(--space-2)',
              }}
            >
              <PlusCircle size={14} /> Add Section
            </button>
          </div>
        </div>

        {/* Center Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-8)', position: 'relative' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '120px' }}>
            
            {/* Main Form Info */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', cursor: 'pointer' }} onClick={() => setSelectedQuestion(null)}>
              <div className="card-body">
                {form.parent_template_id && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} /> Locked: This is a professional Super Admin Form designed by software engineers. Layout and validation rules cannot be modified.
                  </div>
                )}
                <h2 
                  style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)', outline: 'none' }} 
                  contentEditable={!form.parent_template_id} suppressContentEditableWarning
                  onBlur={(e) => updateFormDetail('name', e.target.innerText)}
                >
                  {form.name}
                </h2>
                <p 
                  className="text-muted" 
                  style={{ outline: 'none' }} 
                  contentEditable={!form.parent_template_id} suppressContentEditableWarning
                  onBlur={(e) => updateFormDetail('description', e.target.innerText)}
                >
                  {form.description || 'Add a description for the client...'}
                </p>
              </div>
            </div>

            {/* Questions list — grouped by section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {(() => {
                const unsortedQuestions = questions.filter(q => !q.section_id || !sections.some(s => s.id === q.section_id));
                const sectionGroups = [
                  ...sections.map(s => ({
                    id: s.id,
                    title: s.title,
                    description: s.description,
                    questions: questions.filter(q => q.section_id === s.id),
                  })),
                  ...(unsortedQuestions.length > 0 ? [{
                    id: '__unsorted__',
                    title: 'Unsorted Questions',
                    description: 'Questions not assigned to any section',
                    questions: unsortedQuestions,
                  }] : []),
                ];

                if (sectionGroups.length === 0 && questions.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--color-gray-300)', borderRadius: 'var(--radius-lg)', background: 'var(--color-gray-50)' }}>
                      <p className="text-muted">Drag and drop blocks here or click to add.</p>
                    </div>
                  );
                }

                return sectionGroups.map((group) => {
                  const isCollapsed = collapsedSections.has(group.id);
                  return (
                    <div key={group.id} id={`section-${group.id}`}>
                      {/* Section Header */}
                      <div
                        onClick={() => toggleSection(group.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 20px',
                          background: 'white',
                          borderLeft: '3px solid var(--color-primary)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-gray-200)',
                          borderLeftWidth: '3px',
                          borderLeftColor: group.id === '__unsorted__' ? 'var(--color-gray-400)' : 'var(--color-primary)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'background 0.15s, box-shadow 0.15s',
                          marginBottom: isCollapsed ? 0 : 'var(--space-4)',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-gray-50)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'white'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <span style={{ color: 'var(--color-gray-500)', transition: 'transform 0.2s', display: 'flex' }}>
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                          </span>
                          <div>
                            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)', margin: 0 }}>
                              {group.title}
                            </h3>
                            {group.description && (
                              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', margin: '2px 0 0 0' }}>
                                {group.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-500)',
                          background: 'var(--color-gray-100)', padding: '2px 10px',
                          borderRadius: '999px', whiteSpace: 'nowrap',
                        }}>
                          {group.questions.length} question{group.questions.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Section Questions */}
                      <div style={{
                        display: isCollapsed ? 'none' : 'flex',
                        flexDirection: 'column', gap: 'var(--space-4)',
                      }}>
                        {group.questions.map((q) => {
                          const isSelected = selectedQuestion?.id === q.id;
                          return (
                            <div
                              key={q.id}
                              onClick={() => setSelectedQuestion(q)}
                              className="card"
                              style={{
                                cursor: 'pointer',
                                position: 'relative',
                                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-gray-200)',
                                transition: 'all 0.2s',
                              }}
                            >
                              <div className="card-body" style={{ paddingLeft: form.parent_template_id ? 'var(--space-4)' : 'var(--space-8)' }}>
                                {!form.parent_template_id && (
                                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', cursor: 'grab' }}>
                                    <GripVertical size={20} />
                                  </div>
                                )}
                                {!form.parent_template_id && (
                                  <div style={{ position: 'absolute', right: '16px', top: '16px' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }} style={{ color: 'var(--color-danger)' }}>
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {q.question_type.replace('_', ' ')}
                                  </span>
                                  {q.is_required && <span className="badge badge-red">Required</span>}
                                  {q.is_ai_assisted && (
                                    <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Cpu size={12} /> AI Assisted
                                    </span>
                                  )}
                                </div>

                                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 'var(--space-1)' }}>
                                  {q.question_text || 'Untitled Question'}
                                </h3>
                                {q.description && <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>{q.description}</p>}

                                {/* Fake input display */}
                                <div style={{ marginTop: 'var(--space-4)', pointerEvents: 'none' }}>
                                  {q.question_type === 'text' && <input className="form-control" disabled placeholder="Text input..." />}
                                  {q.question_type === 'long_text' && <textarea className="form-control" disabled rows={3} placeholder="Long text input..." />}
                                  {q.question_type === 'number' && <input className="form-control" disabled placeholder="Number input..." type="number" />}
                                  {q.question_type === 'date' && <input className="form-control" disabled placeholder="Date input..." type="date" />}
                                  {q.question_type === 'currency' && (
                                    <div style={{ position: 'relative' }}>
                                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', fontWeight: 600, fontSize: '14px' }}>$</span>
                                      <input className="form-control" disabled placeholder="0.00" type="text" style={{ paddingLeft: '28px' }} />
                                    </div>
                                  )}
                                  {q.question_type === 'checkbox' && (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <input type="checkbox" disabled style={{ width: 16, height: 16 }} /> <span className="text-muted">Option</span>
                                    </label>
                                  )}
                                  {q.question_type === 'file' && (
                                    <div style={{ width: '100%', height: '100px', border: '2px dashed var(--color-gray-300)', borderRadius: 'var(--radius-md)', background: 'var(--color-gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-400)' }}>
                                      <FileImage size={24} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {group.questions.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '30px 20px', border: '2px dashed var(--color-gray-200)', borderRadius: 'var(--radius-md)', background: 'var(--color-gray-50)' }}>
                            <p className="text-muted" style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>No questions in this section yet. Add one from the sidebar.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div style={{ width: '320px', background: 'white', borderLeft: '1px solid var(--color-gray-200)', padding: 'var(--space-6)', overflowY: 'auto', flexShrink: 0 }}>
          {selectedQuestion ? (
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-900)', letterSpacing: '0.05em', marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Settings size={16} /> Question Properties
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <textarea 
                    value={selectedQuestion.question_text}
                    onChange={(e) => updateSelectedQuestion('question_text', e.target.value)}
                    className="form-control"
                    rows={3}
                    disabled={!!form.parent_template_id}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea 
                    value={selectedQuestion.description || ''}
                    onChange={(e) => updateSelectedQuestion('description', e.target.value)}
                    className="form-control"
                    rows={2}
                    disabled={!!form.parent_template_id}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <select
                    value={selectedQuestion.section_id || ''}
                    onChange={(e) => updateSelectedQuestion('section_id', e.target.value)}
                    className="form-select"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
                    disabled={!!form.parent_template_id}
                  >
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-100)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', cursor: form.parent_template_id ? 'default' : 'pointer', background: 'var(--color-gray-50)' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedQuestion.is_required}
                      onChange={(e) => updateSelectedQuestion('is_required', e.target.checked)}
                      style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                      disabled={!!form.parent_template_id}
                    />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Required Field</span>
                  </label>
                </div>

                <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-100)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Cpu size={16} style={{ color: 'var(--color-primary)' }} /> AI Features
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--color-primary-light)', borderRadius: 'var(--radius-md)', cursor: form.parent_template_id ? 'default' : 'pointer', background: 'var(--color-primary-light)' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedQuestion.is_ai_assisted}
                      onChange={(e) => updateSelectedQuestion('is_ai_assisted', e.target.checked)}
                      style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                      disabled={!!form.parent_template_id}
                    />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-primary)' }}>Enable AI Auto-Fill / OCR</span>
                  </label>
                  
                  {selectedQuestion.is_ai_assisted && (
                    <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>OCR Mapping Key (Source Document)</label>
                        <input 
                          type="text"
                          value={selectedQuestion.ocr_mapping_key || ''}
                          onChange={(e) => updateSelectedQuestion('ocr_mapping_key', e.target.value)}
                          placeholder="e.g. 'T4 Box 14'"
                          className="form-control"
                          disabled={!!form.parent_template_id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-900)', letterSpacing: '0.05em', marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Settings size={16} /> Form Details
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-gray-700)' }}>Form Name</label>
                  <input 
                    type="text"
                    value={form.name || ''}
                    onChange={(e) => updateFormDetail('name', e.target.value)}
                    className="form-control"
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-gray-700)' }}>Description</label>
                  <textarea 
                    value={form.description || ''}
                    onChange={(e) => updateFormDetail('description', e.target.value)}
                    className="form-control"
                    rows={3}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-gray-700)' }}>Country</label>
                  <select 
                    value={form.country || 'Canada'}
                    onChange={(e) => updateFormDetail('country', e.target.value)}
                    className="form-select"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
                  >
                    <option value="Canada">Canada</option>
                    <option value="USA">USA</option>
                    <option value="Global">Global</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-gray-700)' }}>Compliance Category</label>
                  <select 
                    value={form.compliance_type || 'Tax'}
                    onChange={(e) => updateFormDetail('compliance_type', e.target.value)}
                    className="form-select"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
                  >
                    <option value="Direct Tax">Direct Tax</option>
                    <option value="Indirect Tax">Indirect Tax</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Annual Return">Annual Return</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-gray-700)' }}>Status</label>
                  <select 
                    value={form.status || 'Draft'}
                    onChange={(e) => updateFormDetail('status', e.target.value)}
                    className="form-select"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPreviewModal && (() => {
        // Helper matching functions for branching logic
        const getPreviewTriageAnswer = (searchText: string) => {
          const q = questions.find(q => q.question_text.toLowerCase().includes(searchText.toLowerCase()));
          if (!q) return false;
          return previewResponses[q.id] === true || previewResponses[q.id] === 'true';
        };

        const getPreviewMaritalStatus = () => {
          const q = questions.find(q => q.question_text.toLowerCase().includes('marital status on december 31'));
          if (!q) return '';
          return String(previewResponses[q.id] || '').toLowerCase();
        };

        const isPreviewSectionVisible = (section: any) => {
          if (!section.is_conditional) return true;
          
          const title = section.title.toLowerCase();
          
          // Spouse: Married or Common-law
          if (title.includes('spouse') || title.includes('partner')) {
            const status = getPreviewMaritalStatus();
            if (!status) return true;
            return status.includes('married') || status.includes('common-law');
          }

          const getPreviewTriageAnswer = (searchText: string) => {
            const q = questions.find(q => q.question_text.toLowerCase().includes(searchText.toLowerCase()));
            if (!q) return false;
            return previewResponses[q.id] === true || previewResponses[q.id] === 'true';
          };

          const branchingRules: Record<string, string[]> = {
            'worked for': ['t4 employment', 'tips & other employment'],
            'tips or gratuities': ['tips & other employment'],
            'employment insurance': ['t4e employment'],
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
            'foreign property': ['specified foreign property'],
            'rental property': ['rental income'],
            'sold real estate': ['property disposition', 'capital gains'],
            'self-employment': ['self-employment'],
            'sole proprietorship': ['self-employment'],
            'farming': ['self-employment'],
            'fishing': ['self-employment'],
            'platform': ['self-employment'],
            'attended college': ['tuition & education'],
            'student-loan': ['student-loan interest'],
            'child-care': ['child-care expenses'],
            'support payments': ['support payments'],
            'adopted': ['adoption'],
            'disabled': ['disability tax credit'],
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
            'employment expenses': ['employment expense eligibility', 'work-from-home', 'other t777'],
            'worked from home': ['work-from-home'],
          };

          const activeKeys = new Set<string>();
          Object.entries(branchingRules).forEach(([key, secNames]) => {
            if (getPreviewTriageAnswer(key)) {
              secNames.forEach(sn => activeKeys.add(sn));
            }
          });

          // Newcomer/Emigrant conditional on residency answer
          if (title.includes('newcomer') || title.includes('emigrant')) {
            const residency = questions.find(q => q.question_text.toLowerCase().includes('canadian tax residency during'));
            if (!residency) return true;
            const val = String(previewResponses[residency.id] || '').toLowerCase();
            if (title.includes('newcomer')) return val.includes('became a resident');
            if (title.includes('emigrant')) return val.includes('ceased to be');
            return true;
          }

          // Ontario
          if (title.includes('ontario')) {
            const prov = questions.find(q => q.question_text.toLowerCase().includes('province or territory on december 31'));
            if (!prov) return true;
            return String(previewResponses[prov.id] || '').toLowerCase().includes('ontario');
          }

          // Quebec
          if (title.includes('quebec')) {
            const prov = questions.find(q => q.question_text.toLowerCase().includes('province or territory on december 31'));
            if (!prov) return true;
            return String(previewResponses[prov.id] || '').toLowerCase().includes('quebec');
          }

          if (title.includes('carbon rebate')) return true;

          if (activeKeys.size > 0) {
            return Array.from(activeKeys).some(secName => title.includes(secName));
          }

          return true;
        };

        const visiblePreviewSections = sections.filter(isPreviewSectionVisible);
        
        // Ensure index doesn't overshoot if visibility changed
        const safeIdx = Math.min(previewSectionIdx, Math.max(0, visiblePreviewSections.length - 1));
        const currentPreviewSection = visiblePreviewSections[safeIdx];
        const previewSectionQuestions = currentPreviewSection ? questions.filter(q => q.section_id === currentPreviewSection.id) : [];
        const progressPct = visiblePreviewSections.length > 0 ? Math.round((safeIdx / visiblePreviewSections.length) * 100) : 0;

        return (
          <div className="modal-overlay" onClick={() => setShowPreviewModal(false)} style={{ zIndex: 100 }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1350px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
              
              {/* Header */}
              <div className="modal-header" style={{ flexShrink: 0, padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Eye size={20} style={{ color: 'var(--color-primary)' }} /> Form Preview (Guided Wizard)
                  </h2>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowPreviewModal(false)}>✕</button>
                </div>
                {/* Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <div style={{ flex: 1, height: '6px', background: 'var(--color-gray-100)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)' }}>{progressPct}% Done</span>
                </div>
              </div>

              {/* Modal Content - Split layout */}
              <div className="modal-body" style={{ flex: 1, overflow: 'hidden', padding: 0, display: 'flex', background: 'var(--color-gray-50)' }}>
                
                {/* Left Sidebar Stepper index */}
                <div style={{ width: '260px', borderRight: '1px solid var(--color-gray-200)', background: 'white', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {visiblePreviewSections.map((s, idx) => {
                    const isActive = idx === safeIdx;
                    const isPast = idx < safeIdx;
                    return (
                      <div 
                        key={s.id}
                        onClick={() => setPreviewSectionIdx(idx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '8px 10px', borderRadius: '8px',
                          fontSize: '12px', fontWeight: isActive ? 600 : 500,
                          color: isActive ? 'var(--color-primary)' : isPast ? '#111827' : '#9ca3af',
                          background: isActive ? 'var(--color-primary-light)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          border: isActive ? '2px solid var(--color-primary)' : isPast ? '2px solid var(--color-success)' : '2px solid #d1d5db',
                          background: isPast ? 'var(--color-success)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '8px', flexShrink: 0
                        }}>
                          {isPast ? <Check size={10} strokeWidth={3} /> : idx + 1}
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.title}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Right Questions Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                  {/* Current Section Card */}
                  <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--color-gray-200)', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <span className="text-muted" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Section {safeIdx + 1} of {visiblePreviewSections.length}
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '4px 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {currentPreviewSection?.title}
                      {currentPreviewSection?.description && (
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
                          title={currentPreviewSection.description}
                        >
                          ?
                        </span>
                      )}
                    </h2>

                    {/* AI Auto-Fill / OCR Triage Widget (Welcome section only) */}
                    {safeIdx === 0 && (
                      <div style={{
                        background: 'linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%)',
                        border: '1px solid #b9ddff',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '28px',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)'
                      }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: 'var(--color-primary)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Cpu size={24} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#1e3a8a' }}>🚀 AI Smart Auto-Fill & OCR</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: 1.4 }}>
                              Skip manual entry! Upload T4 slips, T5 statements, or previous year returns. Our AI will automatically parse the files, check relevant triage categories, and pre-fill your form.
                            </p>

                            {/* File Dropzone */}
                            {!ocrSuccessPreview && !ocrUploadingPreview && (
                              <div style={{
                                marginTop: '16px', border: '2px dashed #93c5fd', borderRadius: '12px',
                                padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.6)',
                                cursor: 'pointer', transition: 'all 0.2s'
                              }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.accept = '.pdf,.png,.jpg,.jpeg';
                                input.onchange = (e: any) => {
                                  const files = Array.from(e.target.files || []);
                                  setOcrFilesPreview(files);
                                };
                                input.click();
                              }}
                              >
                                <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>
                                  {ocrFilesPreview.length > 0 ? `Selected ${ocrFilesPreview.length} file(s)` : 'Click to select or drag & drop tax documents (T4, T5, PDFs)'}
                                </span>
                                {ocrFilesPreview.length > 0 && (
                                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {ocrFilesPreview.map((f: any, idx) => (
                                      <span key={idx} style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 500 }}>
                                        📄 {f.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Uploading Progress */}
                            {ocrUploadingPreview && (
                              <div style={{ marginTop: '16px', background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #dbeafe' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a' }}>
                                    {ocrProgressStepPreview === 1 && "Step 1/3: Reading PDF structure & text contents..."}
                                    {ocrProgressStepPreview === 2 && "Step 2/3: Running AI parser on slips (T4, T5 dividends)..."}
                                    {ocrProgressStepPreview === 3 && "Step 3/3: Auto-populating form data & activating triage flows..."}
                                  </span>
                                </div>
                                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${(ocrProgressStepPreview / 3) * 100}%`, height: '100%', background: '#3b82f6', transition: 'width 0.4s ease' }}></div>
                                </div>
                              </div>
                            )}

                            {/* Success Alert */}
                            {ocrSuccessPreview && (
                              <div style={{ marginTop: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ color: '#059669' }}><CheckCircle2 size={20} /></div>
                                <div>
                                  <h5 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: '#065f46' }}>🎉 Auto-fill Completed Successfully!</h5>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#047857' }}>
                                    AI detected **T4 earnings**, **Investment dividends**, and **RRSP receipts**. We pre-filled **36 form fields** and configured your interview flow checklist automatically. Please verify entries.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Buttons */}
                            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                              {ocrFilesPreview.length > 0 && !ocrUploadingPreview && !ocrSuccessPreview && (
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={runOcrProcessPreview}
                                  style={{ background: '#2563eb', borderColor: '#2563eb' }}
                                >
                                  Start AI Scan & Pre-Fill
                                </button>
                              )}
                              {ocrSuccessPreview && (
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setOcrSuccessPreview(false);
                                    setOcrFilesPreview([]);
                                  }}
                                >
                                  Scan More Documents
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Questions */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {previewSectionQuestions.map((q, idx) => {
                        const isCheckbox = q.question_type === 'checkbox';
                        const isWide = !isCheckbox && (q.question_type === 'radio' || q.question_type === 'long_text' || q.question_type === 'file' || (q.question_text && q.question_text.length > 80));
                        const explanation = getQuestionExplanation(q.question_text, q.help_text, q.description);
                        
                        return (
                          <div key={q.id} style={{ gridColumn: isWide ? '1 / -1' : 'auto', display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                            {isCheckbox ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', height: '100%', justifyContent: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#374151', margin: 0, padding: '4px 0' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={previewResponses[q.id] === true || previewResponses[q.id] === 'true'} 
                                    onChange={e => setPreviewResponses({...previewResponses, [q.id]: e.target.checked})}
                                    style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: 'var(--color-primary)', flexShrink: 0 }}
                                  />
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', lineHeight: 1.3 }}>
                                    {q.question_text} {q.is_required ? <span style={{ color: 'red' }}>*</span> : ''}
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
                                {/* Prior year PDF upload trigger */}
                                {previewResponses[q.id] === true && q.question_text.toLowerCase().includes('prior-year') && (
                                  <div style={{ marginTop: '4px', border: '1px dashed #3b82f6', borderRadius: '6px', padding: '8px', background: '#eff6ff' }}>
                                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>
                                      Upload prior-year T1 Tax Return PDF:
                                    </span>
                                    {importingPriorYearPreview ? (
                                      <div style={{ marginTop: '2px' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                          <CheckCircle2 size={12} /> Imported 2023 Tax Return PDF
                                        </span>
                                        <p style={{ margin: 0, fontSize: '10px', color: '#047857', lineHeight: 1.3 }}>
                                          Profile for **James Carter** (SIN: 555-***-***) imported. Carryforward checklist categories configured for the **2024 filing year**.
                                        </p>
                                      </div>
                                    ) : (
                                      <input 
                                        type="file" 
                                        accept=".pdf" 
                                        style={{ fontSize: '11px' }} 
                                        onChange={(e) => {
                                          setImportingPriorYearPreview(true);
                                          populatePriorYearDataPreview();
                                        }}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#374151', margin: 0, fontSize: '13px', lineHeight: 1.3 }}>
                                  <span>{q.question_text} {q.is_required ? <span style={{ color: 'red' }}>*</span> : ''}</span>
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
                                
                                <div style={{ marginTop: '6px', width: '100%' }}>
                                  {q.question_type === 'text' && (
                                    <input 
                                      type="text" 
                                      className="form-input" 
                                      placeholder={q.placeholder || "Enter text..."}
                                      value={previewResponses[q.id] || ''} 
                                      onChange={e => setPreviewResponses({...previewResponses, [q.id]: e.target.value})}
                                      style={{ padding: '6px 10px', height: '32px', fontSize: '13px', borderRadius: '6px', width: '100%' }}
                                    />
                                  )}
                                  {q.question_type === 'long_text' && (
                                    <textarea 
                                      className="form-textarea" 
                                      rows={3}
                                      placeholder={q.placeholder || "Enter details..."}
                                      value={previewResponses[q.id] || ''} 
                                      onChange={e => setPreviewResponses({...previewResponses, [q.id]: e.target.value})}
                                      style={{ padding: '6px 10px', fontSize: '13px', borderRadius: '6px', minHeight: '52px', width: '100%' }}
                                    />
                                  )}
                                  {q.question_type === 'number' && (
                                    <input 
                                      type="number" 
                                      className="form-input" 
                                      placeholder={q.placeholder || "Enter number..."}
                                      value={previewResponses[q.id] || ''} 
                                      onChange={e => setPreviewResponses({...previewResponses, [q.id]: e.target.value})}
                                      style={{ padding: '6px 10px', height: '32px', fontSize: '13px', borderRadius: '6px', width: '100%' }}
                                    />
                                  )}
                                  {q.question_type === 'date' && (
                                    <input 
                                      type="date" 
                                      className="form-input" 
                                      value={previewResponses[q.id] || ''} 
                                      onChange={e => setPreviewResponses({...previewResponses, [q.id]: e.target.value})}
                                      style={{ padding: '6px 10px', height: '32px', fontSize: '13px', borderRadius: '6px', width: '100%' }}
                                    />
                                  )}
                                  {q.question_type === 'select' && (
                                    <select
                                      className="form-select"
                                      value={previewResponses[q.id] || ''}
                                      onChange={e => setPreviewResponses({...previewResponses, [q.id]: e.target.value})}
                                      style={{ padding: '6px 10px', height: '32px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', background: 'white', width: '100%' }}
                                    >
                                      <option value="">— Select —</option>
                                      {(() => { try { const opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []); return opts.map((o: string, i: number) => <option key={i} value={o}>{o}</option>); } catch { return null; } })()}
                                    </select>
                                  )}
                                  {q.question_type === 'radio' && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                                      {(() => { try { const opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []); return opts.map((o: string, i: number) => (
                                        <label key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', color: '#374151', background: previewResponses[q.id] === o ? '#eef2ff' : '#f9fafb', border: `1px solid ${previewResponses[q.id] === o ? '#818cf8' : '#e5e7eb'}`, borderRadius: '6px', padding: '4px 10px' }}>
                                          <input type="radio" name={q.id} value={o} checked={previewResponses[q.id] === o} onChange={() => setPreviewResponses({...previewResponses, [q.id]: o})} style={{ accentColor: 'var(--primary)', width: '14px', height: '14px' }} />
                                          {o}
                                        </label>
                                      )); } catch { return null; } })()}
                                    </div>
                                  )}
                                  {q.question_type === 'currency' && (
                                    <div style={{ position: 'relative', width: '100%' }}>
                                      <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', fontWeight: 600, fontSize: '13px' }}>$</span>
                                      <input 
                                        className="form-input" 
                                        placeholder="0.00" 
                                        type="text" 
                                        style={{ paddingLeft: '20px', paddingRight: '10px', height: '32px', fontSize: '13px', borderRadius: '6px', width: '100%' }}
                                        value={previewResponses[q.id] || ''} 
                                        onChange={e => setPreviewResponses({...previewResponses, [q.id]: e.target.value})}
                                      />
                                    </div>
                                  )}
                                  {q.question_type === 'file' && (
                                    <div style={{ border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '8px', textAlign: 'center', background: '#fafafa', width: '100%' }}>
                                      <input type="file" style={{ maxWidth: '100%', fontSize: '12px' }} />
                                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>Upload T-slip or supporting document</p>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>



              </div>

              {/* Footer */}
              <div className="modal-footer" style={{ flexShrink: 0, padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  className="btn btn-secondary" 
                  disabled={safeIdx === 0}
                  onClick={() => setPreviewSectionIdx(prev => Math.max(0, prev - 1))}
                >
                  Back
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowPreviewModal(false)}>Close Preview</button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      if (safeIdx < visiblePreviewSections.length - 1) {
                        setPreviewSectionIdx(prev => prev + 1);
                      } else {
                        alert('Preview Form Submitted successfully (Mockup only)');
                        setShowPreviewModal(false);
                      }
                    }}
                  >
                    {safeIdx === visiblePreviewSections.length - 1 ? 'Finish & Submit' : 'Next Step'}
                  </button>
                </div>
              </div>

              {showCraAuthModalPreview && (
                <div className="modal-overlay" style={{ zIndex: 110 }}>
                  <div className="modal" style={{ maxWidth: '500px', padding: '24px', textAlign: 'center' }}>
                    <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '28px' }}>🍁</span>
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>CRA Secure Login (Auto-fill My Return)</h3>
                    <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.4, margin: '0 0 20px 0' }}>
                      Securely authorize **Taxccount Pro Services** to retrieve your 2024 tax slips directly from the Canada Revenue Agency.
                    </p>

                    {craLoadingPreview ? (
                      <div style={{ padding: '20px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--color-gray-600)', fontWeight: 600 }}>Retrieving secure slips from CRA...</span>
                        </div>
                        <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', width: '200px', margin: '0 auto' }}>
                          <div style={{ width: '100%', height: '100%', background: '#d97706', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button 
                          type="button"
                          className="btn btn-primary" 
                          onClick={() => {
                            setCraLoadingPreview(true);
                            setTimeout(() => {
                              setCraLoadingPreview(false);
                              setConnectedToCraPreview(true);
                              setShowCraAuthModalPreview(false);
                              populateCraDataPreview();
                            }, 2000);
                          }}
                          style={{ background: '#d97706', borderColor: '#d97706', width: '100%' }}
                        >
                          Authorize Connection
                        </button>
                        <button 
                          type="button"
                          className="btn btn-secondary" 
                          onClick={() => setShowCraAuthModalPreview(false)}
                          style={{ width: '100%' }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}
    </div>
  );
}
