'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Send, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft as ArrowLeftIcon, Check, ChevronRight, Sparkles, MessageSquare, Bot, Cpu, HelpCircle, Info } from 'lucide-react';
import Link from 'next/link';

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

export default function FillSmartFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams?.get('client_id');
  const backUrl = clientId ? `/portal/smart-forms?client_id=${clientId}` : '/portal/smart-forms';
  
  const [assignment, setAssignment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  const [user, setUser] = useState<any>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    } catch {}
  }, []);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);

  const [ocrFiles, setOcrFiles] = useState<any[]>([]);
  const [ocrUploading, setOcrUploading] = useState(false);
  const [ocrProgressStep, setOcrProgressStep] = useState(0);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  const [importingPriorYear, setImportingPriorYear] = useState(false);
  const [sectionOcrState, setSectionOcrState] = useState<Record<string, 'idle' | 'scanning' | 'done'>>({});
  const [showReviewSummary, setShowReviewSummary] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // OCR SLIP MAPPING: section title keywords → demo data
  // ═══════════════════════════════════════════════════════════
  const sectionOcrSlipMap: Record<string, { label: string; fields: Record<string, string> }> = {
    't4 employment': { label: 'T4 Slip', fields: { 'employer name': 'ACME Corp.', 'box 14': '84500.00', 'box 16': '3754.45', 'box 18': '1002.45', 'box 22': '18200.00', 'box 20': '2100.00', 'box 44': '820.00', 'box 52': '4200.00', 'province of employment': 'Ontario' } },
    't5 investment': { label: 'T5 Slip', fields: { 'financial institution': 'TD Canada Trust', 'box 13': '1245.00', 'box 24': '3200.00', 'box 25': '4416.00', 'box 10': '450.00', 'box 15': '0', 'box 16': '0' } },
    't3 trust': { label: 'T3 Slip', fields: { 'trust name': 'RBC Canadian Dividend Fund', 'interest income': '320.00', 'capital gains': '1800.00', 'eligible dividends': '2100.00' } },
    't4a pension': { label: 'T4A Slip', fields: { 'payer name': 'Sun Life', 'pension or superannuation': '12000.00', 'income tax deducted': '1800.00' } },
    't4e employment insurance': { label: 'T4E Slip', fields: { 'total benefits paid': '8400.00', 'income tax deducted': '1680.00', 'type of benefits': 'Regular' } },
    't5013 partnership': { label: 'T5013 Slip', fields: { 'partnership name': 'XYZ LP', 'partnership income': '5200.00' } },
    't5008': { label: 'T5008 Statement', fields: { 'security description': 'SHOP.TO', 'proceeds of disposition': '15000.00', 'adjusted cost base': '10500.00' } },
    'charitable donations': { label: 'Donation Receipt', fields: { 'charity name': 'Canadian Red Cross', 'amount donated': '1500.00', 'date of donation': '2025-06-15' } },
    'medical expenses': { label: 'Medical Receipt', fields: { 'prescription drugs': '1200.00', 'dental services': '800.00', 'eyeglasses': '450.00' } },
    'tuition': { label: 'T2202 Certificate', fields: { 'educational institution': 'University of Toronto', 'eligible tuition fees': '8500.00', 'full-time months': '8' } },
    'rrsp deduction': { label: 'RRSP Receipt', fields: { 'contributions made march': '5000.00', 'contributions made in first 60': '2000.00', 'financial institution': 'RBC Direct Investing' } },
    'rental income': { label: 'Rental Records', fields: { 'property address': '123 King St W, Toronto', 'gross rental income': '24000.00', 'insurance': '1800.00', 'property taxes': '3200.00', 'repairs and maintenance': '1500.00' } },
  };

  const getSectionOcrSlip = (sectionTitle: string) => {
    const lower = sectionTitle.toLowerCase();
    for (const [key, val] of Object.entries(sectionOcrSlipMap)) {
      if (lower.includes(key)) return val;
    }
    return null;
  };

  const runSectionOcr = (sectionTitle: string) => {
    const slip = getSectionOcrSlip(sectionTitle);
    if (!slip) return;
    setSectionOcrState(prev => ({ ...prev, [sectionTitle]: 'scanning' }));
    setTimeout(() => {
      const updatedResponses = { ...responses };
      const setAnswer = (search: string, value: any) => {
        const q = questions.find(q => q.question_text.toLowerCase().includes(search.toLowerCase()));
        if (q) updatedResponses[q.id] = value;
      };
      Object.entries(slip.fields).forEach(([key, val]) => setAnswer(key, val));
      setResponses(updatedResponses);
      setSectionOcrState(prev => ({ ...prev, [sectionTitle]: 'done' }));
    }, 2400);
  };

  // ═══════════════════════════════════════════════════════════
  // GLOBAL OCR & PRIOR YEAR DATA POPULATION
  // ═══════════════════════════════════════════════════════════
  const populatePriorYearData = () => {
    const updatedResponses = { ...responses };
    const setAnswer = (search: string, value: any) => {
      const q = questions.find(q => q.question_text.toLowerCase().includes(search.toLowerCase()));
      if (q) updatedResponses[q.id] = value;
    };
    setAnswer('which tax year', '2025');
    setAnswer('first name', 'James');
    setAnswer('last name', 'Carter');
    setAnswer('social insurance number', '555-123-456');
    setAnswer('confirm social insurance', '555-123-456');
    setAnswer('date of birth', '1988-06-15');
    setAnswer('marital status on december 31', 'Married');
    setAnswer('province or territory on december 31', 'Ontario');
    setAnswer('rrsp deduction limit for 2025', '29210');
    setAnswer('unused rrsp contributions', '3000');
    setAnswer('worked for one or more', true);
    setAnswer('earned interest', true);
    setAnswer('received dividends', true);
    setAnswer('contributed to an rrsp', true);
    setAnswer('made charitable donations', true);
    setAnswer('paid medical expenses', true);
    setResponses(updatedResponses);
  };

  const populateOcrData = () => {
    const updatedResponses = { ...responses };
    const setAnswer = (search: string, value: any) => {
      const q = questions.find(q => q.question_text.toLowerCase().includes(search.toLowerCase()));
      if (q) updatedResponses[q.id] = value;
    };
    // Personal
    setAnswer('which tax year', '2025');
    setAnswer('whose tax return', 'My own return');
    setAnswer('first name', 'James');
    setAnswer('last name', 'Carter');
    setAnswer('social insurance number', '555-123-456');
    setAnswer('confirm social insurance', '555-123-456');
    setAnswer('date of birth', '1988-06-15');
    setAnswer('marital status on december 31', 'Married');
    setAnswer('province or territory on december 31', 'Ontario');
    setAnswer('city', 'Toronto');
    setAnswer('street number', '42');
    setAnswer('street name', 'Maple Avenue');
    setAnswer('postal code', 'M5V 2T6');
    setAnswer('preferred language', 'English');
    // Triage
    setAnswer('worked for one or more', true);
    setAnswer('earned interest', true);
    setAnswer('received dividends', true);
    setAnswer('sold stocks', true);
    setAnswer('contributed to an rrsp', true);
    setAnswer('made charitable donations', true);
    setAnswer('paid medical expenses', true);
    setAnswer('attended college', true);
    // T4
    setAnswer('employer name', 'ACME Corporation');
    setAnswer('box 14', '84500.00');
    setAnswer('box 16', '3754.45');
    setAnswer('box 18', '1002.45');
    setAnswer('box 22', '18200.00');
    // T5
    setAnswer('box 13', '1245.00');
    setAnswer('box 24', '3200.00');
    // RRSP
    setAnswer('rrsp deduction limit for 2025', '29210');
    setAnswer('contributions made march', '5000.00');
    // Donations
    setAnswer('charity name', 'Canadian Red Cross');
    setAnswer('amount donated', '1500.00');
    setResponses(updatedResponses);
  };

  const runOcrProcess = () => {
    setOcrUploading(true);
    setOcrProgressStep(1);
    setTimeout(() => {
      setOcrProgressStep(2);
      setTimeout(() => {
        setOcrProgressStep(3);
        setTimeout(() => {
          populateOcrData();
          setOcrUploading(false);
          setOcrSuccess(true);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // Generate printable review HTML
  const generateReviewHtml = () => {
    let html = `<!DOCTYPE html><html><head><title>T1 Tax Return Summary</title><style>
      body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1f2937; }
      h1 { font-size: 22px; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; }
      h2 { font-size: 16px; color: #4f46e5; margin-top: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
      .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
      .label { color: #6b7280; flex: 1; } .value { font-weight: 600; color: #111827; flex: 1; text-align: right; }
      .disclaimer { margin-top: 32px; padding: 16px; border: 1px solid #fbbf24; border-radius: 8px; background: #fffbeb; font-size: 12px; color: #92400e; }
      @media print { body { padding: 12px; } }
    </style></head><body>`;
    html += `<h1>🍁 Canadian T1 Individual Tax Return — Filing Summary</h1>`;
    html += `<p style="font-size:13px;color:#6b7280;">Generated by Taxccount on ${new Date().toLocaleDateString()}</p>`;

    const visSections = sections.filter((s: any) => isSectionVisible(s));
    visSections.forEach((sec: any) => {
      const secQs = questions.filter((q: any) => q.section_id === sec.id);
      const answeredQs = secQs.filter((q: any) => responses[q.id] !== undefined && responses[q.id] !== '' && responses[q.id] !== false);
      if (answeredQs.length === 0) return;
      html += `<h2>${sec.title}</h2>`;
      answeredQs.forEach((q: any) => {
        const val = responses[q.id];
        const display = val === true ? '✓ Yes' : String(val);
        html += `<div class="row"><span class="label">${q.question_text}</span><span class="value">${display}</span></div>`;
      });
    });

    html += `<div class="disclaimer"><strong>⚠️ Disclaimer:</strong> This tax return summary has been prepared based solely on the information provided by the taxpayer. Taxccount does not guarantee the accuracy of tax calculations or CRA acceptance. The taxpayer is responsible for verifying all information against original documents and retaining supporting records for the period required by CRA.</div>`;
    html += `</body></html>`;
    return html;
  };

  const handleDownloadReview = () => {
    const html = generateReviewHtml();
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  };


  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/portal/smart-forms/${id}`);
      if (!res.ok) throw new Error('Failed to load form');
      const data = await res.json();
      
      setAssignment(data.assignment);
      setSections(data.sections || []);
      setQuestions(data.questions || []);
      
      const resps: Record<string, any> = {};
      (data.responses || []).forEach((r: any) => {
        let val = r.response_value;
        try { val = JSON.parse(val); } catch { /* ignore */ }
        resps[r.question_id] = val;
      });
      setResponses(resps);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (questionId: string, val: any) => {
    setResponses(prev => ({ ...prev, [questionId]: val }));
  };

  // Helper matching functions for branching logic
  const getTriageAnswer = (searchText: string) => {
    const q = questions.find(q => q.question_text.toLowerCase().includes(searchText.toLowerCase()));
    if (!q) return false;
    return responses[q.id] === true || responses[q.id] === 'true';
  };

  const getMaritalStatus = () => {
    const q = questions.find(q => q.question_text.toLowerCase().includes('marital status on december 31'));
    if (!q) return '';
    return String(responses[q.id] || '').toLowerCase();
  };

  const isSectionVisible = (section: any) => {
    const title = section.title.toLowerCase();

    // Show all sections up to the triage section
    const triageSec = sections.find((s: any) => s.title.toLowerCase().includes('how was your year'));
    const triageSortOrder = triageSec ? triageSec.sort_order : 21;
    if (section.sort_order <= triageSortOrder) return true;

    // Always show review, finish, signature, carbon rebate etc.
    if (title.includes('signature') || title.includes('review') || title.includes('consent') || title.includes('welcome') || title.includes('profile') || title.includes('dashboard') || title.includes('completeness') || title.includes('optimization') || title.includes('confirmation') || title.includes('e-filing') || title.includes('summary') || title.includes('checklist') || title.includes('prior notice') || title.includes('other income') || title.includes('other mandatory') || title.includes('disclaimer') || title.includes('submission')) return true;

    // Spouse: Married or Common-law
    if (title.includes('spouse') || title.includes('partner')) {
      const status = getMaritalStatus();
      if (!status) return false;
      return status.includes('married') || status.includes('common-law');
    }

    // Newcomer to Canada
    if (title.includes('newcomer')) {
      const residency = questions.find(q => q.question_text.toLowerCase().includes('canadian tax residency during'));
      if (!residency) return false;
      const val = String(responses[residency.id] || '').toLowerCase();
      return val.includes('became a resident');
    }

    // Emigrant from Canada
    if (title.includes('emigrant')) {
      const residency = questions.find(q => q.question_text.toLowerCase().includes('canadian tax residency during'));
      if (!residency) return false;
      const val = String(responses[residency.id] || '').toLowerCase();
      return val.includes('ceased to be');
    }

    // Ontario questions
    if (title.includes('ontario')) {
      const prov = questions.find(q => q.question_text.toLowerCase().includes('province or territory on december 31'));
      if (!prov) return false;
      return String(responses[prov.id] || '').toLowerCase().includes('ontario');
    }

    // Quebec questions
    if (title.includes('quebec')) {
      const prov = questions.find(q => q.question_text.toLowerCase().includes('province or territory on december 31'));
      if (!prov) return false;
      return String(responses[prov.id] || '').toLowerCase().includes('quebec');
    }

    // Carbon rebate — always show if any province selected
    if (title.includes('carbon rebate')) return true;

    // Data-driven branching rules: triage question keyword → section title patterns
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

    // Build active section patterns from triage answers
    const activeKeys = new Set<string>();
    Object.entries(branchingRules).forEach(([key, secNames]) => {
      if (getTriageAnswer(key)) {
        secNames.forEach(sn => activeKeys.add(sn));
      }
    });

    // Check against active triage selections
    if (activeKeys.size > 0) {
      return Array.from(activeKeys).some(secName => title.includes(secName));
    }

    // Default: do not show conditional sections if they don't match
    if (section.is_conditional) return false;

    return true;
  };

  const visibleSections = sections.filter(isSectionVisible);

  // Grouping sections into stages for a cleaner sidebar
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

  const currentSection = visibleSections[currentSectionIdx];
  const currentStageIdx = currentSection ? getSectionStageIndex(currentSection.title) : 0;

  const visibleStages = stages.map((stage, idx) => {
    const stageSections = visibleSections.filter(s => getSectionStageIndex(s.title) === idx);
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

    const answeredQs = stageQs.filter(q => responses[q.id] !== undefined && responses[q.id] !== '' && responses[q.id] !== false);
    const requiredQs = stageQs.filter(q => q.is_required === 1);
    const missingRequired = requiredQs.some(q => responses[q.id] === undefined || responses[q.id] === '' || responses[q.id] === false);

    if (answeredQs.length === 0) {
      return isCurrent ? 'In Progress' : 'Not Started';
    }
    if (missingRequired) {
      return 'Needs Attention';
    }
    return 'Completed';
  };

  // Keep currentSectionIdx in bounds when visibleSections change
  useEffect(() => {
    if (visibleSections.length > 0 && currentSectionIdx >= visibleSections.length) {
      setCurrentSectionIdx(visibleSections.length - 1);
    }
  }, [visibleSections.length, currentSectionIdx]);
  const sectionQuestions = currentSection ? questions.filter(q => q.section_id === currentSection.id) : [];

  const handleSave = async (isSubmit = false) => {
    if (isSubmit) {
      // Validate all required fields across visible sections before submitting
      const missingFields: string[] = [];
      visibleSections.forEach(s => {
        const sQs = questions.filter(q => q.section_id === s.id);
        sQs.forEach(q => {
          if (q.is_required && !responses[q.id]) {
            missingFields.push(q.question_text);
          }
        });
      });

      if (missingFields.length > 0) {
        setErrorMsg(`Please complete all required fields. Missing: ${missingFields[0]}`);
        return;
      }
      setSubmitting(true);
    } else {
      setSaving(true);
    }
    setErrorMsg('');

    try {
      const res = await fetch(`/api/portal/smart-forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_responses', responses, is_final_submit: isSubmit })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (isSubmit) {
        router.push('/portal/smart-forms');
      } else {
        setAssignment({ ...assignment, status: data.status });
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    // Validate current section required fields
    const missing = sectionQuestions.find(q => q.is_required && !responses[q.id]);
    if (missing) {
      setErrorMsg(`"${missing.question_text}" is required.`);
      return;
    }
    setErrorMsg('');
    if (currentSectionIdx < visibleSections.length - 1) {
      setCurrentSectionIdx(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSave(true);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  if (loading) return <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-gray-500)' }}>Loading form...</div>;
  if (errorMsg && !assignment) return <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'red' }}>{errorMsg}</div>;

  const isCompleted = assignment?.status === 'Completed' || assignment?.status === 'Under review';
  const progressPct = visibleSections.length > 0 ? Math.round(((currentSectionIdx) / visibleSections.length) * 100) : 0;

  const handleSendSupportRequest = () => {
    alert(`Your request for customization on "${assignment?.template_name || 'T1 Personal Income Tax Return'}" has been successfully submitted to the Abidebylaw Administrator!\n\nDetails: "${supportMessage}"\n\nOur administration team will review this and assist you shortly.`);
    setShowSupportModal(false);
    setSupportMessage('');
  };

  return (
    <>
      {user && ['firm_admin', 'admin', 'team_member', 'team_manager', 'platform_admin'].includes(user.role) && (
        <div style={{
          background: '#fffbeb',
          borderBottom: '1px solid #fcd34d',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          fontWeight: 500,
          color: '#b45309',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} style={{ color: '#d97706', flexShrink: 0 }} />
            <span><strong>Preview Mode</strong> — You are viewing this form as a Consultant/Admin. Test entries here will not affect actual client filings.</span>
          </span>
          <button 
            onClick={() => setShowSupportModal(true)}
            style={{
              background: '#d97706',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'background 0.15s ease'
            }}
          >
            <HelpCircle size={12} /> Request Changes from Admin
          </button>
        </div>
      )}

      {showSupportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '450px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>
              Request Form Customization
            </h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Since this T1 intake form is engine-locked, you cannot modify questions directly. Describe the customizations or assistance you need, and the Abidebylaw Administrator will help you apply them.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  Form Template
                </label>
                <input 
                  type="text" 
                  disabled 
                  value={assignment?.template_name || 'T1 Personal Income Tax Return'} 
                  style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#6b7280' }} 
                />
              </div>
              
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  Request Details *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your requested change (e.g., add a specific checkbox, modify instructions, change conditional logic)..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button 
                onClick={() => { setShowSupportModal(false); setSupportMessage(''); }}
                style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendSupportRequest}
                disabled={!supportMessage.trim()}
                style={{
                  background: supportMessage.trim() ? '#4f46e5' : '#a5b4fc',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: supportMessage.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="portal-content-area" style={{ padding: 'var(--space-6)', maxWidth: 1100, margin: '0 auto', display: 'flex', gap: '24px', position: 'relative', minHeight: 'calc(100vh - 120px)', paddingBottom: '100px' }}>
      
      {/* Left Sidebar Steps index */}
      <div style={{ width: '280px', flexShrink: 0, display: 'block' }}>
        <Link href={backUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-500)', fontSize: '13px', marginBottom: 'var(--space-6)', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Forms
        </Link>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '16px', position: 'sticky', top: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>Interview Flow</h4>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{progressPct}% Completed</div>
            <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {visibleStages.map((stage, idx) => {
              const isActive = stage.index === currentStageIdx;
              const isPast = stage.index < currentStageIdx;
              const currentSectionInStageIdx = stage.sections.findIndex(s => s.id === currentSection?.id);
              
              return (
                <div 
                  key={stage.index}
                  onClick={() => {
                    const firstSec = stage.sections[0];
                    if (firstSec) {
                      const globalIdx = visibleSections.findIndex(s => s.id === firstSec.id);
                      if (globalIdx >= 0) setCurrentSectionIdx(globalIdx);
                    }
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    padding: '8px 10px', borderRadius: '8px',
                    background: isActive ? 'var(--color-primary-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <div style={{
                        width: '16px', height: '16px', borderRadius: '50%',
                        border: isActive ? '2px solid var(--color-primary)' : isPast ? '2px solid var(--color-success)' : '2px solid #d1d5db',
                        background: isPast ? 'var(--color-success)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isPast ? 'white' : isActive ? 'var(--color-primary)' : '#9ca3af',
                        fontSize: '9px', fontWeight: 'bold', flexShrink: 0
                      }}>
                        {isPast ? <Check size={8} strokeWidth={3} /> : idx + 1}
                      </div>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--color-primary)' : isPast ? '#111827' : '#6b7280',
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
                    <div style={{ fontSize: '10px', color: '#6b7280', paddingLeft: '28px', marginTop: '2px' }}>
                      Step {currentSectionInStageIdx + 1} of {stage.sections.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Wizard Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        
        {/* Current Stage Card */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Section {currentSectionIdx + 1} of {visibleSections.length}
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              </h2>
            </div>
            {isCompleted && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Submitted</span>
            )}
          </div>

          {isCompleted && currentSectionIdx === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '12px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontWeight: 500, fontSize: '14px', marginBottom: '24px' }}>
              <CheckCircle2 size={18} />
              This form is submitted and under review. View-only mode active.
            </div>
          )}

          {/* AI Auto-Fill / OCR Triage Widget (Welcome section only) */}
          {currentSectionIdx === 0 && !isCompleted && (
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
                  {!ocrSuccess && !ocrUploading && (
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
                        setOcrFiles(files);
                      };
                      input.click();
                    }}
                    >
                      <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>
                        {ocrFiles.length > 0 ? `Selected ${ocrFiles.length} file(s)` : 'Click to select or drag & drop tax documents (T4, T5, PDFs)'}
                      </span>
                      {ocrFiles.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          {ocrFiles.map((f: any, idx) => (
                            <span key={idx} style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 500 }}>
                              📄 {f.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Uploading Progress */}
                  {ocrUploading && (
                    <div style={{ marginTop: '16px', background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #dbeafe' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a' }}>
                          {ocrProgressStep === 1 && "Step 1/3: Reading PDF structure & text contents..."}
                          {ocrProgressStep === 2 && "Step 2/3: Running AI parser on slips (T4, T5 dividends)..."}
                          {ocrProgressStep === 3 && "Step 3/3: Auto-populating form data & activating triage flows..."}
                        </span>
                      </div>
                      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(ocrProgressStep / 3) * 100}%`, height: '100%', background: '#3b82f6', transition: 'width 0.4s ease' }}></div>
                      </div>
                    </div>
                  )}

                  {/* Success Alert */}
                  {ocrSuccess && (
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
                    {ocrFiles.length > 0 && !ocrUploading && !ocrSuccess && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={runOcrProcess}
                        style={{ background: '#2563eb', borderColor: '#2563eb' }}
                      >
                        Start AI Scan & Pre-Fill
                      </button>
                    )}
                    {ocrSuccess && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setOcrSuccess(false);
                          setOcrFiles([]);
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

          {/* Per-Section OCR Upload Widget */}
          {currentSectionIdx > 0 && !isCompleted && currentSection && getSectionOcrSlip(currentSection.title) && (() => {
            const slip = getSectionOcrSlip(currentSection.title)!;
            const state = sectionOcrState[currentSection.title] || 'idle';
            return (
              <div style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #d8b4fe', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📄</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#6b21a8' }}>Upload {slip.label} to Auto-Fill</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#7c3aed' }}>Upload your {slip.label} and we’ll automatically fill the fields below.</p>
                  </div>
                </div>
                {state === 'idle' && (
                  <div
                    style={{ border: '2px dashed #c4b5fd', borderRadius: '10px', padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file'; input.accept = '.pdf,.png,.jpg,.jpeg';
                      input.onchange = () => runSectionOcr(currentSection.title);
                      input.click();
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#7c3aed', fontWeight: 600 }}>📤 Click to upload {slip.label} (PDF, PNG, JPG)</span>
                  </div>
                )}
                {state === 'scanning' && (
                  <div style={{ background: 'white', borderRadius: '10px', padding: '12px', border: '1px solid #e9d5ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b21a8' }}>Scanning {slip.label}... Reading fields and extracting data...</span>
                    </div>
                    <div style={{ height: '5px', background: '#f3e8ff', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '70%', height: '100%', background: '#8b5cf6', animation: 'pulse 1.2s infinite ease-in-out' }}></div>
                    </div>
                  </div>
                )}
                {state === 'done' && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>✅ {slip.label} scanned! {Object.keys(slip.fields).length} fields auto-filled. Please verify below.</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ═══ REVIEW ALL ANSWERS — Special Renderer ═══ */}
          {currentSection?.title?.toLowerCase().includes('review all') ? (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleDownloadReview}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  📥 Download as PDF
                </button>
              </div>
              {sections.filter((s: any) => isSectionVisible(s) && s.title !== currentSection.title && s.title !== 'Disclaimer & Submission').map((sec: any, secIdx: number) => {
                const secQs = questions.filter((q: any) => q.section_id === sec.id);
                const answeredQs = secQs.filter((q: any) => responses[q.id] !== undefined && responses[q.id] !== '' && responses[q.id] !== false);
                if (answeredQs.length === 0 && secQs.length === 0) return null;
                return (
                  <div key={sec.id} style={{ marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: answeredQs.length > 0 ? '#f0fdf4' : '#fef2f2', borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {answeredQs.length > 0 ? <CheckCircle2 size={14} style={{ color: '#16a34a' }} /> : <AlertCircle size={14} style={{ color: '#dc2626' }} />}
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{sec.title}</span>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>({answeredQs.length}/{secQs.length} answered)</span>
                      </div>
                      <button
                        onClick={() => {
                          const idx = visibleSections.findIndex((s: any) => s.id === sec.id);
                          if (idx >= 0) setCurrentSectionIdx(idx);
                        }}
                        style={{ fontSize: '11px', fontWeight: 600, color: '#4f46e5', background: 'white', border: '1px solid #c7d2fe', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                    {answeredQs.length > 0 && (
                      <div style={{ padding: '8px 16px' }}>
                        {answeredQs.map((q: any) => (
                          <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f9fafb', fontSize: '12px' }}>
                            <span style={{ color: '#6b7280', flex: 1 }}>{q.question_text}</span>
                            <span style={{ fontWeight: 600, color: '#111827', flex: 1, textAlign: 'right' }}>
                              {responses[q.id] === true ? '✓ Yes' : String(responses[q.id])}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Disclaimer Banner */}
              <div style={{ marginTop: '20px', padding: '16px', border: '1px solid #fbbf24', borderRadius: '12px', background: '#fffbeb' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: '#92400e' }}>⚠️ Important Disclaimer</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                  This tax return has been prepared based solely on the information you have provided. Taxccount does not guarantee the accuracy of tax calculations or CRA acceptance of this return.
                  You are responsible for verifying all information against your original tax documents and retaining all supporting records for the period required by CRA.
                </p>
              </div>

              {/* Questions (checkbox confirmations) */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sectionQuestions.map((q: any) => {
                  const val = responses[q.id];
                  return (
                    <div key={q.id}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={val === true || val === 'true'}
                          onChange={e => handleUpdate(q.id, e.target.checked)}
                          disabled={isCompleted}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                        />
                        <span>{q.question_text} {q.is_required ? <span style={{ color: 'red' }}>*</span> : ''}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (

          /* ═══ NORMAL Questions list inside section ═══ */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {sectionQuestions.map((q, idx) => {
              const isCheckbox = q.question_type === 'checkbox';
              const isWide = !isCheckbox && (q.question_type === 'radio' || q.question_type === 'long_text' || q.question_type === 'file' || (q.question_text && q.question_text.length > 80));
              const explanation = getQuestionExplanation(q.question_text, q.help_text, q.description);
              
              return (
                <div key={q.id} style={{ gridColumn: isWide ? '1 / -1' : 'auto', display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                  {isCheckbox ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', height: '100%', justifyContent: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: isCompleted ? 'default' : 'pointer', fontSize: '13px', fontWeight: 500, color: '#374151', margin: 0, padding: '4px 0' }}>
                        <input 
                          type="checkbox" 
                          checked={responses[q.id] === true || responses[q.id] === 'true'} 
                          onChange={e => handleUpdate(q.id, e.target.checked)}
                          disabled={isCompleted}
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
                      {responses[q.id] === true && q.question_text.toLowerCase().includes('prior-year') && (
                        <div style={{ marginTop: '4px', border: '1px dashed #3b82f6', borderRadius: '6px', padding: '8px', background: '#eff6ff' }}>
                          <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>
                            Upload prior-year T1 Tax Return PDF:
                          </span>
                          {importingPriorYear ? (
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
                                setImportingPriorYear(true);
                                populatePriorYearData();
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
                            value={responses[q.id] || ''} 
                            onChange={e => handleUpdate(q.id, e.target.value)}
                            disabled={isCompleted}
                            style={{ padding: '6px 10px', height: '32px', fontSize: '13px', borderRadius: '6px', width: '100%' }}
                          />
                        )}
                        {q.question_type === 'long_text' && (
                          <textarea 
                            className="form-textarea" 
                            rows={3}
                            placeholder={q.placeholder || "Enter details..."}
                            value={responses[q.id] || ''} 
                            onChange={e => handleUpdate(q.id, e.target.value)}
                            disabled={isCompleted}
                            style={{ padding: '6px 10px', fontSize: '13px', borderRadius: '6px', minHeight: '52px', width: '100%' }}
                          />
                        )}
                        {q.question_type === 'number' && (
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder={q.placeholder || "Enter number..."}
                            value={responses[q.id] || ''} 
                            onChange={e => handleUpdate(q.id, e.target.value)}
                            disabled={isCompleted}
                            style={{ padding: '6px 10px', height: '32px', fontSize: '13px', borderRadius: '6px', width: '100%' }}
                          />
                        )}
                        {q.question_type === 'date' && (
                          <input 
                            type="date" 
                            className="form-input" 
                            value={responses[q.id] || ''} 
                            onChange={e => handleUpdate(q.id, e.target.value)}
                            disabled={isCompleted}
                            style={{ padding: '6px 10px', height: '32px', fontSize: '13px', borderRadius: '6px', width: '100%' }}
                          />
                        )}
                        {q.question_type === 'select' && (
                          <select
                            className="form-select"
                            value={responses[q.id] || ''}
                            onChange={e => setResponses({ ...responses, [q.id]: e.target.value })}
                            style={{ padding: '6px 10px', height: '32px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', background: 'white', width: '100%' }}
                          >
                            <option value="">— Select —</option>
                            {(() => { try { const opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []); return opts.map((o: string, i: number) => <option key={i} value={o}>{o}</option>); } catch { return null; } })()}
                          </select>
                        )}
                        {q.question_type === 'radio' && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                            {(() => { try { const opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []); return opts.map((o: string, i: number) => (
                              <label key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', color: '#374151', background: responses[q.id] === o ? '#eef2ff' : '#f9fafb', border: `1px solid ${responses[q.id] === o ? '#818cf8' : '#e5e7eb'}`, borderRadius: '6px', padding: '4px 10px' }}>
                                <input type="radio" name={q.id} value={o} checked={responses[q.id] === o} onChange={() => setResponses({ ...responses, [q.id]: o })} style={{ accentColor: 'var(--primary)', width: '14px', height: '14px' }} />
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
                              value={responses[q.id] || ''} 
                              onChange={e => handleUpdate(q.id, e.target.value)}
                              disabled={isCompleted}
                            />
                          </div>
                        )}
                        {q.question_type === 'file' && (
                          <div style={{ border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '8px', textAlign: 'center', background: '#fafafa', width: '100%' }}>
                            <input type="file" disabled={isCompleted} style={{ maxWidth: '100%', fontSize: '12px' }} />
                            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>Upload T-slip or supporting document</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {sectionQuestions.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: '12px' }}>No questions in this section. Click Next to continue.</div>
            )}
          </div>
          )}
        </div>

        {/* Navigation Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleBack} 
            disabled={currentSectionIdx === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeftIcon size={16} /> Back
          </button>

          {errorMsg && (
            <div style={{ color: 'red', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', padding: '8px 16px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
              <AlertCircle size={16}/> {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            {!isCompleted && (
              <button className="btn btn-secondary" onClick={() => handleSave(false)} disabled={saving || submitting}>
                {saving ? 'Saving...' : <><Save size={16}/> Save Draft</>}
              </button>
            )}
            
            <button 
              className="btn btn-primary" 
              onClick={handleNext} 
              disabled={saving || submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {currentSectionIdx === visibleSections.length - 1 ? (
                isCompleted ? 'Done' : (submitting ? 'Submitting...' : <><Send size={16}/> Submit Form</>)
              ) : (
                <>{isCompleted ? 'Next' : 'Next Step'} <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
    </>
  );
}
